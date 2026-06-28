import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Save, Download, RotateCcw, Lock, Unlock, X } from "lucide-react";
import NavBar from "../components/NavBar";
import { api, API } from "../lib/api";

export default function Admin() {
  const [tab, setTab] = useState("levels");
  return (
    <div className="relative z-10 min-h-screen">
      <NavBar />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <p className="font-accent text-xs tracking-[0.35em] text-[#D4AF37]/80">◆ KEEPER OF THE TREASURE</p>
        <h1 className="font-display text-5xl mt-2">Admin Dashboard</h1>

        <div className="flex gap-2 mt-8 border-b border-white/10">
          {[["levels", "Levels & Questions"], ["users", "Users"], ["final", "Final Reveal"]].map(([k, l]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              data-testid={`admin-tab-${k}`}
              className={`px-4 py-3 font-accent text-xs tracking-[0.25em] transition border-b-2 ${
                tab === k ? "border-[#D4AF37] text-[#D4AF37]" : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        <div className="mt-8">
          {tab === "levels" && <LevelsTab />}
          {tab === "users" && <UsersTab />}
          {tab === "final" && <FinalTab />}
        </div>
      </main>
    </div>
  );
}

function LevelsTab() {
  const [levels, setLevels] = useState([]);
  const [editing, setEditing] = useState(null); // question being edited

  const load = async () => {
    const r = await api.get("/admin/levels");
    setLevels(r.data.levels);
  };
  useEffect(() => { load(); }, []);

  const toggleLock = async (lvl) => {
    await api.put(`/admin/levels/${lvl.level_id}`, { is_locked_override: !lvl.is_locked_override });
    toast.success(lvl.is_locked_override ? "Level unlocked" : "Level locked");
    load();
  };
  const deleteLvl = async (lvl) => {
    if (!window.confirm(`Delete level ${lvl.number}?`)) return;
    await api.delete(`/admin/levels/${lvl.level_id}`);
    toast.success("Level deleted");
    load();
  };
  const addLvl = async () => {
    const next = (levels[levels.length - 1]?.number || 0) + 1;
    await api.post("/admin/levels", { number: next, title: `Level ${next}`, subtitle: "" });
    load();
  };
  const updateLevelMeta = async (lvl, patch) => {
    await api.put(`/admin/levels/${lvl.level_id}`, patch);
    load();
  };
  const addQuestion = (lvl) => setEditing({ levelId: lvl.level_id, q: { type: "text", prompt: "", answer: "", options: [], order: lvl.questions?.length || 0, is_draft: true } });
  const editQuestion = (lvl, q) => setEditing({ levelId: lvl.level_id, q: { ...q } });
  const saveQuestion = async () => {
    const { levelId, q } = editing;
    try {
      if (q.question_id) {
        await api.put(`/admin/levels/${levelId}/questions/${q.question_id}`, q);
      } else {
        await api.post(`/admin/levels/${levelId}/questions`, q);
      }
      toast.success("Question saved");
      setEditing(null);
      load();
    } catch (e) {
      toast.error("Failed to save");
    }
  };
  const deleteQuestion = async (lvl, q) => {
    if (!window.confirm("Delete this question?")) return;
    await api.delete(`/admin/levels/${lvl.level_id}/questions/${q.question_id}`);
    toast.success("Question deleted");
    load();
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button className="btn-gold flex items-center gap-2" onClick={addLvl} data-testid="add-level-btn">
          <Plus size={16} /> Add Level
        </button>
      </div>
      <div className="space-y-6">
        {levels.map((lvl) => (
          <div key={lvl.level_id} className="glass rounded-2xl p-6" data-testid={`admin-level-${lvl.number}`}>
            <div className="flex flex-wrap items-start gap-4 justify-between">
              <div className="flex-1 min-w-[260px]">
                <p className="font-accent text-[10px] tracking-[0.35em] text-[#D4AF37]/80">LEVEL {lvl.number}</p>
                <input
                  defaultValue={lvl.title}
                  onBlur={(e) => updateLevelMeta(lvl, { title: e.target.value })}
                  className="tt-input mt-2 font-display text-2xl"
                  data-testid={`level-title-${lvl.number}`}
                />
                <input
                  defaultValue={lvl.subtitle}
                  onBlur={(e) => updateLevelMeta(lvl, { subtitle: e.target.value })}
                  className="tt-input mt-2 text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleLock(lvl)} className="btn-ghost flex items-center gap-2" title="Toggle lock" data-testid={`toggle-lock-${lvl.number}`}>
                  {lvl.is_locked_override ? <Lock size={14} /> : <Unlock size={14} />} {lvl.is_locked_override ? "Locked" : "Open"}
                </button>
                <button onClick={() => deleteLvl(lvl)} className="text-red-400 hover:text-red-300 p-2"><Trash2 size={16} /></button>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              {(lvl.questions || []).sort((a, b) => a.order - b.order).map((q, i) => (
                <div key={q.question_id} className={`flex items-center gap-3 bg-black/30 rounded-lg px-4 py-3 border ${q.is_draft ? "border-yellow-500/30" : "border-white/5"}`}>
                  <span className="text-xs text-[#D4AF37] font-accent tracking-widest">#{i + 1}</span>
                  <span className="text-xs uppercase tracking-wider text-gray-400">{q.type}</span>
                  {q.is_draft && (
                    <span className="text-[10px] font-accent tracking-widest px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-300 border border-yellow-500/30" data-testid={`draft-badge-${lvl.number}-${i}`}>
                      DRAFT
                    </span>
                  )}
                  <span className="text-sm text-gray-200 flex-1 truncate">{q.prompt}</span>
                  <button onClick={() => editQuestion(lvl, q)} className="text-xs text-[#D4AF37] hover:text-[#FDE047]" data-testid={`edit-q-${lvl.number}-${i}`}>Edit</button>
                  <button onClick={() => deleteQuestion(lvl, q)} className="text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
                </div>
              ))}
              <button onClick={() => addQuestion(lvl)} className="text-sm text-[#D4AF37] hover:text-[#FDE047] flex items-center gap-1" data-testid={`add-q-${lvl.number}`}>
                <Plus size={14} /> Add question
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <QuestionEditor editing={editing} setEditing={setEditing} saveQuestion={saveQuestion} />
      )}
    </div>
  );
}

function QuestionEditor({ editing, setEditing, saveQuestion }) {
  const { q } = editing;
  const set = (patch) => setEditing({ ...editing, q: { ...editing.q, ...patch } });
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md grid place-items-center p-4">
      <div className="glass rounded-2xl p-6 max-w-xl w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-2xl">{q.question_id ? "Edit Question" : "Add Question"}</h3>
          <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-white"><X size={18} /></button>
        </div>
        <label className="text-xs text-gray-400 uppercase tracking-wider">Type</label>
        <select value={q.type} onChange={(e) => set({ type: e.target.value })} className="tt-input mt-1" data-testid="q-type">
          {["multiple_choice", "text", "image", "puzzle", "riddle"].map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <label className="text-xs text-gray-400 uppercase tracking-wider mt-4 block">Prompt</label>
        <textarea value={q.prompt} onChange={(e) => set({ prompt: e.target.value })} rows={3} className="tt-input mt-1" data-testid="q-prompt" />
        {q.type === "image" && (
          <>
            <label className="text-xs text-gray-400 uppercase tracking-wider mt-4 block">Image URL</label>
            <input value={q.image_url || ""} onChange={(e) => set({ image_url: e.target.value })} className="tt-input mt-1" />
          </>
        )}
        {q.type === "multiple_choice" && (
          <>
            <label className="text-xs text-gray-400 uppercase tracking-wider mt-4 block">Options (one per line)</label>
            <textarea
              value={(q.options || []).join("\n")}
              onChange={(e) => set({ options: e.target.value.split("\n").filter(Boolean) })}
              rows={4}
              className="tt-input mt-1"
              data-testid="q-options"
            />
          </>
        )}
        <label className="text-xs text-gray-400 uppercase tracking-wider mt-4 block">Correct Answer</label>
        <input value={q.answer} onChange={(e) => set({ answer: e.target.value })} className="tt-input mt-1" data-testid="q-answer" />
        <label className="text-xs text-gray-400 uppercase tracking-wider mt-4 block">Order</label>
        <input type="number" value={q.order ?? 0} onChange={(e) => set({ order: parseInt(e.target.value, 10) || 0 })} className="tt-input mt-1" />
        <label className="flex items-center gap-3 mt-5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={!!q.is_draft}
            onChange={(e) => set({ is_draft: e.target.checked })}
            className="w-4 h-4 accent-[#D4AF37]"
            data-testid="q-is-draft"
          />
          <span className="text-sm text-gray-200">
            <span className="font-medium">Draft</span>
            <span className="text-gray-500 ml-2 text-xs">— hidden from players until unchecked</span>
          </span>
        </label>
        <div className="flex gap-3 justify-end mt-6">
          <button onClick={() => setEditing(null)} className="btn-ghost">Cancel</button>
          <button onClick={saveQuestion} className="btn-gold flex items-center gap-2" data-testid="save-q-btn"><Save size={14} /> Save</button>
        </div>
      </div>
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState([]);
  const load = async () => {
    const r = await api.get("/admin/users");
    setUsers(r.data.users);
  };
  useEffect(() => { load(); }, []);
  const reset = async (u) => {
    if (!window.confirm(`Reset progress for ${u.name}?`)) return;
    await api.post(`/admin/users/${u.user_id}/reset`);
    toast.success("Progress reset");
    load();
  };
  return (
    <div>
      <div className="flex justify-end mb-4">
        <a href={`${API}/admin/users.csv`} className="btn-ghost flex items-center gap-2" data-testid="export-csv-btn">
          <Download size={16} /> Export CSV
        </a>
      </div>
      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-white/10">
            <tr className="text-left text-xs uppercase tracking-wider text-gray-400">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Level</th>
              <th className="px-4 py-3">Cleared</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.user_id} className="border-b border-white/5 hover:bg-white/5" data-testid={`user-row-${u.user_id}`}>
                <td className="px-4 py-3 flex items-center gap-3">
                  {u.picture && <img src={u.picture} alt="" className="w-8 h-8 rounded-full" />}
                  <span>{u.name} {u.is_admin && <span className="text-[10px] text-[#D4AF37] font-accent tracking-widest ml-2">ADMIN</span>}</span>
                </td>
                <td className="px-4 py-3 text-gray-400">{u.email}</td>
                <td className="px-4 py-3">{u.current_level}</td>
                <td className="px-4 py-3">{(u.completed_levels || []).length}</td>
                <td className="px-4 py-3 text-[#D4AF37] font-medium">{u.score}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => reset(u)} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 ml-auto">
                    <RotateCcw size={12} /> Reset
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={6} className="text-center py-10 text-gray-500">No users yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FinalTab() {
  const [final, setFinal] = useState({ final_answer: "", secret_message: "" });
  useEffect(() => {
    api.get("/admin/settings/final").then((r) => setFinal({ final_answer: r.data.final_answer || "", secret_message: r.data.secret_message || "" }));
  }, []);
  const save = async () => {
    await api.put("/admin/settings/final", final);
    toast.success("Final reveal updated");
  };
  return (
    <div className="glass rounded-2xl p-6 max-w-xl">
      <label className="text-xs text-gray-400 uppercase tracking-wider">Final Answer (displayed at end)</label>
      <input value={final.final_answer} onChange={(e) => setFinal({ ...final, final_answer: e.target.value })} className="tt-input mt-1" data-testid="final-answer-input" />
      <label className="text-xs text-gray-400 uppercase tracking-wider mt-4 block">Secret Message</label>
      <textarea value={final.secret_message} onChange={(e) => setFinal({ ...final, secret_message: e.target.value })} rows={5} className="tt-input mt-1" data-testid="secret-message-input" />
      <button onClick={save} className="btn-gold mt-5 flex items-center gap-2" data-testid="save-final-btn"><Save size={14} /> Save</button>
    </div>
  );
}
