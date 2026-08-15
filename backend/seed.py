"""
Seed script for Treasure Hunt – populates levels, questions, and final secret.
Run with: python /app/backend/seed.py
"""
import asyncio
import os
import uuid
from pathlib import Path
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv(Path(__file__).parent / ".env")

client = AsyncIOMotorClient(os.environ["MONGO_URL"])
db = client[os.environ["DB_NAME"]]


def q(type_, prompt, answer, order, options=None, image_url=None):
    return {
        "question_id": f"q_{uuid.uuid4().hex[:10]}",
        "type": type_,
        "prompt": prompt,
        "answer": answer,
        "options": options or [],
        "image_url": image_url,
        "order": order,
    }


LEVELS = [
    {
        "level_id": f"lvl_{uuid.uuid4().hex[:8]}",
        "number": 1,
        "title": "The First Clue",
        "subtitle": "Sharpen your wits — the hunt begins.",
        "is_locked_override": False,
        "questions": [
            q("riddle",
              "I speak without a mouth and hear without ears. I have nobody, but I come alive with the wind. What am I?",
              "echo", 0),
            q("multiple_choice",
              "The more you take, the more you leave behind. What are they?",
              "footsteps", 1,
              options=["shadows", "footsteps", "memories", "breaths"]),
            q("riddle", "What has keys but cannot open locks?", "piano", 2),
        ],
    },
    {
        "level_id": f"lvl_{uuid.uuid4().hex[:8]}",
        "number": 2,
        "title": "Deeper into the Woods",
        "subtitle": "The trail twists. Keep your mind clear.",
        "is_locked_override": False,
        "questions": [
            q("riddle",
              "I am tall when I am young, and I am short when I am old. What am I?",
              "candle", 0),
            q("text",
              "What word becomes shorter when you add two letters to it?",
              "short", 1),
            q("multiple_choice",
              "What can travel around the world while staying in the corner?",
              "stamp", 2,
              options=["a stamp", "a shadow", "a compass", "the wind"]),
        ],
    },
    {
        "level_id": f"lvl_{uuid.uuid4().hex[:8]}",
        "number": 3,
        "title": "The Hidden Cave",
        "subtitle": "Shadows whisper. Listen carefully.",
        "is_locked_override": False,
        "questions": [
            q("riddle",
              "The more of me you take, the more you leave behind. I am quiet and patient. What am I?",
              "footprints", 0),
            q("puzzle",
              "I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?",
              "map", 1),
            q("text", "What has to be broken before you can use it?", "egg", 2),
        ],
    },
    {
        "level_id": f"lvl_{uuid.uuid4().hex[:8]}",
        "number": 4,
        "title": "The Forgotten Temple",
        "subtitle": "Ancient riddles guard the way.",
        "is_locked_override": False,
        "questions": [
            q("riddle", "I have hands but cannot clap. What am I?", "clock", 0),
            q("multiple_choice",
              "What gets wetter the more it dries?",
              "towel", 1,
              options=["a sponge", "a towel", "a cloud", "a river"]),
            q("riddle",
              "I follow you all day, but vanish at night. What am I?",
              "shadow", 2),
        ],
    },
    {
        "level_id": f"lvl_{uuid.uuid4().hex[:8]}",
        "number": 5,
        "title": "The Final Chamber",
        "subtitle": "One last test stands between you and the treasure.",
        "is_locked_override": False,
        "questions": [
            q("riddle",
              "I am not alive, but I grow. I don't have lungs, but I need air. What am I?",
              "fire", 0),
            q("text",
              "What is always in front of you but cannot be seen?",
              "future", 1),
            q("puzzle",
              "The treasure lies where the first letter of every level's answer aligns. Speak the secret word.",
              "ecmcf", 2),
        ],
    },
]


async def main():
    # Wipe existing levels + settings for clean seed
    await db.levels.delete_many({})
    await db.settings.delete_many({"key": "final"})

    await db.levels.insert_many([dict(lv) for lv in LEVELS])

    await db.settings.update_one(
        {"key": "final"},
        {"$set": {
            "key": "final",
            "final_answer": "ECMCF",
            "secret_message": "You have walked the shadowed paths, deciphered every whisper, and uncovered the secret hidden in plain sight. The treasure was never gold — it was the journey itself. Carry this triumph with you, brave hunter.",
        }},
        upsert=True,
    )
    print(f"Seeded {len(LEVELS)} levels and final settings.")
    client.close()


if __name__ == "__main__":
    asyncio.run(main())
