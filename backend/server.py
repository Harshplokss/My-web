"""
Treasure Hunt - FastAPI Backend
Handles authentication (Emergent Google OAuth), level/question gating,
progress tracking, and admin operations.
"""
from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Literal
from datetime import datetime, timezone, timedelta
from pathlib import Path
import os
import uuid
import logging
import io
import csv
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

ADMIN_EMAILS = [e.strip().lower() for e in os.environ.get("ADMIN_EMAILS", "").split(",") if e.strip()]

app = FastAPI(title="Treasure Hunt API")
api = APIRouter(prefix="/api")

# ===== Models =====
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    is_admin: bool = False
    team: Optional[Literal["red", "blue"]] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Question(BaseModel):
    model_config = ConfigDict(extra="ignore")
    question_id: str = Field(default_factory=lambda: f"q_{uuid.uuid4().hex[:10]}")
    type: Literal["multiple_choice", "text", "image", "puzzle", "riddle"]
    prompt: str
    image_url: Optional[str] = None
    options: List[str] = []  # for multiple choice
    answer: str  # canonical answer (lowercased compare)
    order: int = 0
    is_draft: bool = False  # hidden from players when True

class Level(BaseModel):
    model_config = ConfigDict(extra="ignore")
    level_id: str = Field(default_factory=lambda: f"lvl_{uuid.uuid4().hex[:8]}")
    number: int
    title: str
    subtitle: str
    is_locked_override: bool = False  # admin lock
    questions: List[Question] = []

class Progress(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    current_level: int = 1
    current_question_index: int = 0  # within current level
    completed_levels: List[int] = []
    score: int = 0
    badges: List[str] = []
    started_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None
    answers_log: List[dict] = []  # {level, q_idx, attempts, correct_at}

# ===== Helpers =====
def serialize_dt(doc: dict) -> dict:
    for k, v in list(doc.items()):
        if isinstance(v, datetime):
            doc[k] = v.isoformat()
    return doc

async def get_user_from_request(request: Request) -> Optional[dict]:
    token = request.cookies.get("session_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        return None
    sess = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not sess:
        return None
    expires_at = sess.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at and expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at and expires_at < datetime.now(timezone.utc):
        return None
    user = await db.users.find_one({"user_id": sess["user_id"]}, {"_id": 0})
    return user

async def require_user(request: Request) -> dict:
    user = await get_user_from_request(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

async def require_admin(request: Request) -> dict:
    user = await require_user(request)
    if not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin only")
    return user

async def get_or_create_progress(user_id: str) -> dict:
    p = await db.progress.find_one({"user_id": user_id}, {"_id": 0})
    if not p:
        prog = Progress(user_id=user_id)
        doc = serialize_dt(prog.model_dump())
        await db.progress.insert_one(doc)
        p = await db.progress.find_one({"user_id": user_id}, {"_id": 0})
    return p

def visible_questions(lvl: dict) -> list:
    """TEMP: Show all questions"""
    return sorted(lvl.get("questions", []), key=lambda q: q.get("order", 0))

# ===== Auth =====
@api.post("/auth/session")
async def auth_session(request: Request, response: Response):
    body = await request.json()
    session_id = body.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")

    async with httpx.AsyncClient(timeout=15) as hc:
        r = await hc.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id},
        )
    if r.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid session_id")
    data = r.json()
    email = data["email"].lower()
    name = data.get("name", email.split("@")[0])
    picture = data.get("picture")
    session_token = data["session_token"]

    # Find or create user
    existing = await db.users.find_one({"email": email}, {"_id": 0})
    # admin: only emails listed in ADMIN_EMAILS env var
    is_admin = email in ADMIN_EMAILS
    if existing:
        user_id = existing["user_id"]
        # Sync admin flag with ADMIN_EMAILS on every login (promote AND demote)
        if bool(existing.get("is_admin")) != is_admin:
            await db.users.update_one({"user_id": user_id}, {"$set": {"is_admin": is_admin}})
        # always refresh name/picture
        await db.users.update_one({"user_id": user_id}, {"$set": {"name": name, "picture": picture}})
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        new_user = User(user_id=user_id, email=email, name=name, picture=picture, is_admin=is_admin)
        await db.users.insert_one(serialize_dt(new_user.model_dump()))
        # init progress
        await get_or_create_progress(user_id)

    # Store session
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    response.set_cookie(
        key="session_token", value=session_token, httponly=True, secure=True,
        samesite="none", path="/", max_age=7 * 24 * 60 * 60,
    )
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    return {"user": user}

@api.get("/auth/me")
async def auth_me(request: Request):
    user = await require_user(request)
    return user

@api.post("/auth/logout")
async def auth_logout(request: Request, response: Response):
    token = request.cookies.get("session_token")
    if token:
        await db.user_sessions.delete_one({"session_token": token})
    response.delete_cookie("session_token", path="/")
    return {"ok": True}

# ===== Game =====
@api.get("/levels")
async def list_levels(request: Request):
    """Return all levels with locked/unlocked status (no answers exposed)."""
    user = await require_user(request)
    prog = await get_or_create_progress(user["user_id"])
    levels = await db.levels.find({}, {"_id": 0}).sort("number", 1).to_list(100)
    completed = set(prog.get("completed_levels", []))
    current = prog.get("current_level", 1)
    out = []
    for lvl in levels:
        n = lvl["number"]
        # unlocked if n <= current AND (n == 1 OR n-1 in completed) AND not admin-locked
        unlocked = (n <= current) and (n == 1 or (n - 1) in completed) and not lvl.get("is_locked_override")
        is_completed = n in completed
        out.append({
            "level_id": lvl["level_id"],
            "number": n,
            "title": lvl["title"],
            "subtitle": lvl.get("subtitle", ""),
            "total_questions": len(visible_questions(lvl)),
            "unlocked": unlocked,
            "completed": is_completed,
        })
    return {"levels": out, "current_level": current, "current_question_index": prog.get("current_question_index", 0)}

@api.get("/progress")
async def get_progress(request: Request):
    user = await require_user(request)
    prog = await get_or_create_progress(user["user_id"])
    total_levels = await db.levels.count_documents({})
    levels_all = await db.levels.find({}, {"_id": 0}).to_list(100)
    total_questions = sum(len(visible_questions(lv)) for lv in levels_all)
    # questions answered correctly
    answered = 0
    for log in prog.get("answers_log", []):
        if log.get("correct_at"):
            answered += 1
    completed_all = len(prog.get("completed_levels", [])) == total_levels and total_levels > 0
    return {
        "user": {"user_id": user["user_id"], "name": user["name"], "email": user["email"], "picture": user.get("picture"), "is_admin": user.get("is_admin", False)},
        "current_level": prog.get("current_level", 1),
        "current_question_index": prog.get("current_question_index", 0),
        "completed_levels": prog.get("completed_levels", []),
        "score": prog.get("score", 0),
        "badges": prog.get("badges", []),
        "total_levels": total_levels,
        "total_questions": total_questions,
        "questions_answered": answered,
        "completed_all": completed_all,
        "started_at": prog.get("started_at"),
        "completed_at": prog.get("completed_at"),
        "team": user.get("team"),
    }

@api.get("/levels/{number}/question")
async def get_current_question(number: int, request: Request):
    """Returns the current pending question of a level for the user (no answer field)."""
    user = await require_user(request)
    prog = await get_or_create_progress(user["user_id"])
    completed = set(prog.get("completed_levels", []))
    current = prog.get("current_level", 1)
    # Anti-cheat: enforce gating
    if number > current:
        raise HTTPException(status_code=403, detail="Level locked")
    if number > 1 and (number - 1) not in completed:
        raise HTTPException(status_code=403, detail="Previous level not completed")
    lvl = await db.levels.find_one({"number": number}, {"_id": 0})
    if not lvl:
        raise HTTPException(status_code=404, detail="Level not found")
    if lvl.get("is_locked_override"):
        raise HTTPException(status_code=403, detail="Level locked by admin")
    questions = visible_questions(lvl)
    if number in completed:
        return {"level_completed": True, "level": {"number": number, "title": lvl["title"], "subtitle": lvl.get("subtitle", "")}}
    q_idx = prog.get("current_question_index", 0) if number == current else 0
    if q_idx >= len(questions):
        return {"level_completed": True, "level": {"number": number, "title": lvl["title"], "subtitle": lvl.get("subtitle", "")}}
    q = questions[q_idx]
    # Hidden mode: server returns only metadata, NEVER the prompt/options/image.
    # Players solve riddles distributed offline and just submit answers here.
    safe_q = {
        "question_id": q["question_id"],
        "order": q.get("order", 0),
    }
    return {
        "level": {"number": number, "title": lvl["title"], "subtitle": lvl.get("subtitle", "")},
        "question": safe_q,
        "question_index": q_idx,
        "total_questions": len(questions),
    }

@api.post("/levels/{number}/answer")
async def submit_answer(number: int, request: Request):
    user = await require_user(request)
    body = await request.json()
    submitted = (body.get("answer") or "").strip().lower()
    if not submitted:
        raise HTTPException(status_code=400, detail="answer required")
    prog = await get_or_create_progress(user["user_id"])
    current = prog.get("current_level", 1)
    completed = set(prog.get("completed_levels", []))
    if number != current:
        raise HTTPException(status_code=403, detail="Not your current level")
    if number > 1 and (number - 1) not in completed:
        raise HTTPException(status_code=403, detail="Previous level not completed")
    lvl = await db.levels.find_one({"number": number}, {"_id": 0})
    if not lvl or lvl.get("is_locked_override"):
        raise HTTPException(status_code=403, detail="Level unavailable")
    questions = visible_questions(lvl)
    q_idx = prog.get("current_question_index", 0)
    if q_idx >= len(questions):
        return {"correct": True, "level_completed": True}
    q = questions[q_idx]
    correct = submitted == q["answer"].strip().lower()
    # log attempt
    log_entry = {
        "level": number, "q_idx": q_idx, "answer": submitted,
        "correct": correct, "at": datetime.now(timezone.utc).isoformat(),
    }
    update_doc = {"$push": {"answers_log": log_entry}}
    if correct:
        update_doc["$inc"] = {"score": 10}
        new_q_idx = q_idx + 1
        level_completed = new_q_idx >= len(questions)
        all_levels = await db.levels.count_documents({})
        if level_completed:
            new_completed = list(completed | {number})
            new_current = min(number + 1, all_levels)
            set_doc = {
                "current_question_index": 0,
                "current_level": new_current,
                "completed_levels": new_completed,
            }
            # badges
            existing_badges = set(prog.get("badges", []))
            badge_map = {1: "first_clue", 2: "wanderer", 3: "spelunker", 4: "temple_seeker", 5: "treasure_master"}
            if number in badge_map:
                existing_badges.add(badge_map[number])
            set_doc["badges"] = list(existing_badges)
            if len(new_completed) == all_levels and all_levels > 0:
                set_doc["completed_at"] = datetime.now(timezone.utc).isoformat()
                existing_badges.add("legend")
                set_doc["badges"] = list(existing_badges)
            update_doc["$set"] = set_doc
        else:
            update_doc["$set"] = {"current_question_index": new_q_idx}
        await db.progress.update_one({"user_id": user["user_id"]}, update_doc)
        return {"correct": True, "level_completed": level_completed, "next_question_index": q_idx + 1}
    else:
        await db.progress.update_one({"user_id": user["user_id"]}, update_doc)
        return {"correct": False, "message": "Try Again"}

@api.get("/leaderboard")
async def leaderboard(request: Request):
    await require_user(request)
    progs = await db.progress.find({}, {"_id": 0}).to_list(500)
    users_map = {}
    user_ids = [p["user_id"] for p in progs]
    users = await db.users.find({"user_id": {"$in": user_ids}}, {"_id": 0}).to_list(500)
    for u in users:
        users_map[u["user_id"]] = u
    rows = []
    for p in progs:
        u = users_map.get(p["user_id"], {})
        rows.append({
            "name": u.get("name", "Anonymous"),
            "picture": u.get("picture"),
            "team": u.get("team"),
            "score": p.get("score", 0),
            "levels_completed": len(p.get("completed_levels", [])),
            "completed_at": p.get("completed_at"),
        })
    rows.sort(key=lambda r: (-r["levels_completed"], -r["score"]))
    return {"rows": rows[:50]}

@api.get("/teams/standings")
async def team_standings(request: Request):
    await require_user(request)
    users = await db.users.find({"team": {"$in": ["red", "blue"]}}, {"_id": 0}).to_list(1000)
    progs = await db.progress.find({}, {"_id": 0}).to_list(1000)
    prog_map = {p["user_id"]: p for p in progs}
    totals = {"red": {"score": 0, "members": 0, "levels": 0}, "blue": {"score": 0, "members": 0, "levels": 0}}
    for u in users:
        t = u["team"]
        p = prog_map.get(u["user_id"], {})
        totals[t]["score"] += p.get("score", 0)
        totals[t]["levels"] += len(p.get("completed_levels", []))
        totals[t]["members"] += 1
    return totals

@api.post("/me/team")
async def set_team(request: Request):
    user = await require_user(request)
    body = await request.json()
    team = (body.get("team") or "").lower()
    if team not in ("red", "blue"):
        raise HTTPException(status_code=400, detail="team must be 'red' or 'blue'")
    # Allow first-time set OR switching (admin discretion - keep simple: allow change)
    await db.users.update_one({"user_id": user["user_id"]}, {"$set": {"team": team}})
    return {"ok": True, "team": team}

@api.get("/final")
async def final_data(request: Request):
    """Returns final answer + secret message when user completes all levels."""
    user = await require_user(request)
    prog = await get_or_create_progress(user["user_id"])
    total_levels = await db.levels.count_documents({})
    if len(prog.get("completed_levels", [])) < total_levels or total_levels == 0:
        raise HTTPException(status_code=403, detail="Complete all levels first")
    final = await db.settings.find_one({"key": "final"}, {"_id": 0})
    if not final:
        final = {"final_answer": "TREASURE", "secret_message": "You are the legend who solved every riddle."}
    return {
        "user_name": user["name"],
        "final_answer": final.get("final_answer"),
        "secret_message": final.get("secret_message"),
        "completed_at": prog.get("completed_at"),
        "score": prog.get("score", 0),
    }

# ===== Admin =====
@api.get("/admin/users")
async def admin_list_users(request: Request):
    await require_admin(request)
    users = await db.users.find({}, {"_id": 0}).to_list(1000)
    progs = await db.progress.find({}, {"_id": 0}).to_list(1000)
    prog_map = {p["user_id"]: p for p in progs}
    for u in users:
        p = prog_map.get(u["user_id"], {})
        u["score"] = p.get("score", 0)
        u["current_level"] = p.get("current_level", 1)
        u["completed_levels"] = p.get("completed_levels", [])
        u["completed_at"] = p.get("completed_at")
    return {"users": users}

@api.post("/admin/users/{user_id}/reset")
async def admin_reset_user(user_id: str, request: Request):
    await require_admin(request)
    new_prog = Progress(user_id=user_id)
    doc = serialize_dt(new_prog.model_dump())
    await db.progress.replace_one({"user_id": user_id}, doc, upsert=True)
    return {"ok": True}

@api.get("/admin/users.csv")
async def admin_users_csv(request: Request):
    await require_admin(request)
    users = await db.users.find({}, {"_id": 0}).to_list(2000)
    progs = await db.progress.find({}, {"_id": 0}).to_list(2000)
    prog_map = {p["user_id"]: p for p in progs}
    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(["user_id", "name", "email", "is_admin", "score", "current_level", "completed_levels", "completed_at", "created_at"])
    for u in users:
        p = prog_map.get(u["user_id"], {})
        w.writerow([
            u.get("user_id"), u.get("name"), u.get("email"), u.get("is_admin", False),
            p.get("score", 0), p.get("current_level", 1),
            ",".join(str(x) for x in p.get("completed_levels", [])),
            p.get("completed_at", ""), u.get("created_at", ""),
        ])
    buf.seek(0)
    return StreamingResponse(iter([buf.getvalue()]), media_type="text/csv",
                             headers={"Content-Disposition": "attachment; filename=users.csv"})

@api.get("/admin/levels")
async def admin_list_levels(request: Request):
    await require_admin(request)
    levels = await db.levels.find({}, {"_id": 0}).sort("number", 1).to_list(100)
    return {"levels": levels}

@api.post("/admin/levels")
async def admin_create_level(request: Request):
    await require_admin(request)
    body = await request.json()
    lvl = Level(
        number=int(body["number"]),
        title=body.get("title", f"Level {body['number']}"),
        subtitle=body.get("subtitle", ""),
        is_locked_override=bool(body.get("is_locked_override", False)),
        questions=[],
    )
    await db.levels.insert_one(lvl.model_dump())
    return lvl.model_dump()

@api.put("/admin/levels/{level_id}")
async def admin_update_level(level_id: str, request: Request):
    await require_admin(request)
    body = await request.json()
    allowed = {k: v for k, v in body.items() if k in {"title", "subtitle", "is_locked_override", "number"}}
    await db.levels.update_one({"level_id": level_id}, {"$set": allowed})
    lvl = await db.levels.find_one({"level_id": level_id}, {"_id": 0})
    return lvl

@api.delete("/admin/levels/{level_id}")
async def admin_delete_level(level_id: str, request: Request):
    await require_admin(request)
    await db.levels.delete_one({"level_id": level_id})
    return {"ok": True}

@api.post("/admin/levels/{level_id}/questions")
async def admin_add_question(level_id: str, request: Request):
    await require_admin(request)
    body = await request.json()
    lvl = await db.levels.find_one({"level_id": level_id}, {"_id": 0})
    if not lvl:
        raise HTTPException(status_code=404, detail="Level not found")
    q = Question(
        type=body["type"],
        prompt=body["prompt"],
        image_url=body.get("image_url"),
        options=body.get("options", []),
        answer=body["answer"],
        order=int(body.get("order", len(lvl.get("questions", [])))),
        is_draft=False,
    )
    await db.levels.update_one({"level_id": level_id}, {"$push": {"questions": q.model_dump()}})
    return q.model_dump()

@api.put("/admin/levels/{level_id}/questions/{question_id}")
async def admin_update_question(level_id: str, question_id: str, request: Request):
    await require_admin(request)
    body = await request.json()
    set_fields = {}
    for k in ["type", "prompt", "image_url", "options", "answer", "order", "is_draft"]:
        if k in body:
            set_fields[f"questions.$.{k}"] = body[k]
    await db.levels.update_one(
        {"level_id": level_id, "questions.question_id": question_id},
        {"$set": set_fields},
    )
    lvl = await db.levels.find_one({"level_id": level_id}, {"_id": 0})
    return lvl

@api.delete("/admin/levels/{level_id}/questions/{question_id}")
async def admin_delete_question(level_id: str, question_id: str, request: Request):
    await require_admin(request)
    await db.levels.update_one({"level_id": level_id}, {"$pull": {"questions": {"question_id": question_id}}})
    return {"ok": True}

@api.get("/admin/settings/final")
async def admin_get_final(request: Request):
    await require_admin(request)
    s = await db.settings.find_one({"key": "final"}, {"_id": 0})
    return s or {"key": "final", "final_answer": "", "secret_message": ""}

@api.put("/admin/settings/final")
async def admin_set_final(request: Request):
    await require_admin(request)
    body = await request.json()
    await db.settings.update_one(
        {"key": "final"},
        {"$set": {"final_answer": body.get("final_answer", ""), "secret_message": body.get("secret_message", "")}},
        upsert=True,
    )
    return {"ok": True}

@api.get("/")
async def root():
    return {"service": "Treasure Hunt API", "status": "ok"}

# Register router
app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["https://harshweb-0cxp.onrender.com"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
