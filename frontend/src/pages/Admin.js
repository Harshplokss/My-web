import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Save, Download, RotateCcw, Lock, Unlock, X, HelpCircle, Users, Award, Shield } from "lucide-react";
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
  const [confirmDel, setConfirmDel] = useState(null); // {levelId, questionId} pending confirm
  const [confirmLvlDel, setConfirmLvlDel] = useState(null);

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
    if (confirmLvlDel !== lvl.level_id) {
      setConfirmLvlDel(lvl.level_id);
      setTimeout(() => setConfirmLvlDel((cur) => (cur === lvl.level_id ? null : cur)), 4000);
      return;
    }
    try {
      await api.delete(`/admin/levels/${lvl.level_id}`);
      toast.success("Level deleted");
      setConfirmLvlDel(null);
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Delete failed");
    }
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
  const addQuestion = (lvl) => setEditing({ levelId: lvl.level_id, q: { type: "text", prompt: "", answer: "", hint: "", options: [], order: lvl.questions?.length || 0, is_draft: true } });
  const editQuestion = (lvl, q) => setEditing({ levelId: lvl.level_id, q: { ...q } });
  const togglePublish = async (lvl, q) => {
    try {
      const isDraftCurrent = Boolean(q.is_draft === true || String(q.is_draft).toLowerCase() === "true");
      await api.put(`/admin/levels/${lvl.level_id}/questions/${q.question_id}`, { is_draft: !isDraftCurrent });
      toast.success(!isDraftCurrent ? "Question set to draft" : "Question published");
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to toggle status");
    }
  };
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
      toast.error(e.response?.data?.detail || e.message || "Failed to save");
    }
  };
  const deleteQuestion = async (lvl, q) => {
    const key = `${lvl.level_id}:${q.question_id}`;
    if (confirmDel !== key) {
      setConfirmDel(key);
      setTimeout(() => setConfirmDel((cur) => (cur === key ? null : cur)), 4000);
      return;
    }
    try {
      await api.delete(`/admin/levels/${lvl.level_id}/questions/${q.question_id}`);
      toast.success("Question deleted");
      setConfirmDel(null);
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Delete failed");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-display text-2xl">All Chambers ({levels.length})</h2>
        <button onClick={addLvl} className="btn-gold flex items-center gap-2" data-testid="add-level-btn">
          <Plus size={16} /> Add Level
        </button>
      </div>

      <div className="space-y-6">
        {levels.map((lvl) => (
          <div key={lvl.level_id} className="glass rounded-2xl p-6" data-testid={`admin-level-${lvl.number}`}>
            <div className="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <span className="font-accent text-[#D4AF37] text-sm">LVL {lvl.number}</span>
                <input
                  value={lvl.title}
                  onChange={(e) => updateLevelMeta(lvl, { title: e.target.value })}
                  className="tt-input text-lg font-display py-1 px-3 w-48 sm:w-64"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleLock(lvl)}
                  className={`btn-ghost py-1.5 px-3 flex items-center gap-1.5 text-xs ${lvl.is_locked_override ? "text-red-400" : "text-emerald-400"}`}
                  data-testid={`lock-toggle-${lvl.number}`}
                >
                  {lvl.is_locked_override ? <Lock size={14} /> : <Unlock size={14} />}
                  {lvl.is_locked_override ? "Locked" : "Unlocked"}
                </button>
                <button
                  onClick={() => deleteLvl(lvl)}
                  className={`btn-ghost py-1.5 px-3 text-xs flex items-center gap-1.5 ${confirmLvlDel === lvl.level_id ? "bg-red-500 text-white" : "text-red-400"}`}
                  data-testid={`delete-level-${lvl.number}`}
                >
                  <Trash2 size={14} /> {confirmLvlDel === lvl.level_id ? "Confirm Delete" : "Delete"}
                </button>
              </div>
            </div>

            {/* Questions list */}
            <div className="mt-4 space-y-2">
              {(lvl.questions || []).map((q, qi) => {
                const isDraft = Boolean(q.is_draft === true || String(q.is_draft).toLowerCase() === "true");
                return (
                  <div key={q.question_id || qi} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition text-sm flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <span className="font-accent text-xs text-[#D4AF37]">Q{qi + 1}</span>
                      <span className="text-gray-200">{q.prompt || "Hidden prompt"}</span>
                      {isDraft ? (
                        <span className="text-[10px] bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded font-accent">DRAFT</span>
                      ) : (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-accent">PUBLISHED</span>
                      )}
                      {q.hint && <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-accent flex items-center gap-1"><HelpCircle size={10} /> HINT</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => togglePublish(lvl, q)}
                        className={`text-xs px-2 py-1 rounded ${isDraft ? "text-emerald-400 hover:bg-emerald-500/10" : "text-yellow-400 hover:bg-yellow-500/10"}`}
                        data-testid={`toggle-publish-q-${lvl.number}-${qi}`}
                      >
                        {isDraft ? "Publish" : "Unpublish"}
                      </button>
                      <button onClick={() => editQuestion(lvl, q)} className="text-xs text-gray-400 hover:text-white" data-testid={`edit-q-${lvl.number}-${qi}`}>
                        Edit
                      </button>
                      <button
                        onClick={() => deleteQuestion(lvl, q)}
                        className={`text-xs ${confirmDel === `${lvl.level_id}:${q.question_id}` ? "text-red-400 font-bold" : "text-gray-500 hover:text-red-400"}`}
                        data-testid={`delete-q-${lvl.number}-${qi}`}
                      >
                        {confirmDel === `${lvl.level_id}:${q.question_id}` ? "Confirm" : "Delete"}
                      </button>
                    </div>
                  </div>
                );
              })}
              <button onClick={() => addQuestion(lvl)} className="text-sm text-[#D4AF37] hover:text-[#FDE047] flex items-center gap-1 mt-2" data-testid={`add-q-${lvl.number}`}>
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
      <div className="glass rounded-2xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto">
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
        
        <label className="text-xs text-gray-400 uppercase tracking-wider mt-4 block">Clue / Hint Advice</label>
        <input
          value={q.hint || ""}
          onChange={(e) => set({ hint: e.target.value })}
          placeholder="Optional hint revealed when player clicks 'Reveal Clue'"
          className="tt-input mt-1"
          data-testid="q-hint"
        />

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
  const [confirmReset, setConfirmReset] = useState(null);
  const load = async () => {
    const r = await api.get("/admin/users");
    setUsers(r.data.users);
  };
  useEffect(() => { load(); }, []);
  const reset = async (u) => {
    if (confirmReset !== u.user_id) {
      setConfirmReset(u.user_id);
      setTimeout(() => setConfirmReset((cur) => (cur === u.user_id ? null : cur)), 4000);
      return;
    }
    try {
      await api.post(`/admin/users/${u.user_id}/reset`);
      toast.success(`${u.name}'s progress reset`);
      setConfirmReset(null);
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Reset failed");
    }
  };
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-400">Total Registered Players: {users.length}</div>
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
                  <button
                    onClick={() => reset(u)}
                    className={`text-xs flex items-center gap-1 ml-auto px-2 py-1 rounded transition ${
                      confirmReset === u.user_id ? "bg-red-500 text-white" : "text-red-400 hover:text-red-300"
                    }`}
                    data-testid={`reset-user-${u.user_id}`}
                  >
                    <RotateCcw size={12} /> {confirmReset === u.user_id ? "Confirm" : "Reset"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FinalTab() {
  const [data, setData] = useState({ final_answer: "", secret_message: "" });
  const load = async () => {
    const r = await api.get("/admin/settings/final");
    setData(r.data);
  };
  useEffect(() => { load(); }, []);
  const save = async () => {
    await api.put("/admin/settings/final", data);
    toast.success("Final settings saved");
  };
  return (
    <div className="glass rounded-2xl p-6 max-w-2xl">
      <h2 className="font-display text-2xl mb-4">Final Celebration Secret</h2>
      <label className="text-xs text-gray-400 uppercase tracking-wider block">Final Answer / Phrase</label>
      <input
        value={data.final_answer}
        onChange={(e) => setData({ ...data, final_answer: e.target.value })}
        className="tt-input mt-1"
        data-testid="final-answer-input"
      />
      <label className="text-xs text-gray-400 uppercase tracking-wider mt-4 block">Secret Message</label>
      <textarea
        value={data.secret_message}
        onChange={(e) => setData({ ...data, secret_message: e.target.value })}
        rows={4}
        className="tt-input mt-1"
        data-testid="final-secret-input"
      />
      <button onClick={save} className="btn-gold mt-6 flex items-center gap-2" data-testid="save-final-btn">
        <Save size={16} /> Save Final Secret
      </button>
    </div>
  );
}
