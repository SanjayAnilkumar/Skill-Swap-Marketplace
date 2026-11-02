import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./Sessions.css";

const API = "https://skillswap-backend-jjao.onrender.com/api";
function getSavedUser() { try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; } }
function Sessions() {
  const user = getSavedUser();
  const [sessions, setSessions] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ partner: "", skill: "", scheduledAt: "", mode: "Online", notes: "" });
  const [feedback, setFeedback] = useState({});
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!user?.id) { setLoading(false); return; }
    try {
      const [sessionRes, requestRes] = await Promise.all([fetch(`${API}/sessions/${user.id}`), fetch(`${API}/requests/${user.id}`)]);
      const sessionData = await sessionRes.json(); const requestData = await requestRes.json();
      if (!sessionRes.ok) throw new Error(sessionData.message || "Could not load sessions");
      setSessions(Array.isArray(sessionData) ? sessionData : []);
      const accepted = Array.isArray(requestData) ? requestData.filter(r => r.status === "Accepted") : [];
      const map = new Map();
      accepted.forEach(r => { const other = String(r.sender?._id) === String(user.id) ? r.receiver : r.sender; if (other?._id) map.set(String(other._id), other); });
      setConnections([...map.values()]);
    } catch (e) { setMessage(e.message || "Unable to load sessions."); } finally { setLoading(false); }
  }, [user?.id]);
  useEffect(() => { load(); }, [load]);

  const updateForm = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const schedule = async e => {
    e.preventDefault(); setMessage(""); setBusy(true);
    try {
      const res = await fetch(`${API}/sessions`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, requester: user.id, scheduledAt: new Date(form.scheduledAt).toISOString() }) });
      const data = await res.json(); if (!res.ok) throw new Error(data.message || "Could not schedule session");
      setMessage(data.message); setForm({ partner: "", skill: "", scheduledAt: "", mode: "Online", notes: "" }); await load();
    } catch (e) { setMessage(e.message || "Unable to connect to server."); } finally { setBusy(false); }
  };
  const complete = async id => {
    setMessage(""); try { const res = await fetch(`${API}/sessions/${id}/complete`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: user.id }) }); const data = await res.json(); if (!res.ok) throw new Error(data.message); setMessage(data.message); await load(); } catch (e) { setMessage(e.message || "Could not update session."); }
  };
  const submitFeedback = async id => {
    const value = feedback[id] || { rating: "5", comment: "" }; setMessage("");
    try { const res = await fetch(`${API}/sessions/${id}/feedback`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: user.id, rating: value.rating, comment: value.comment }) }); const data = await res.json(); if (!res.ok) throw new Error(data.message); setMessage(data.message); await load(); } catch (e) { setMessage(e.message || "Could not submit feedback."); }
  };
  const dateLabel = value => new Date(value).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
  const myFeedback = session => (session.feedback || []).some(f => String(f.from?._id || f.from) === String(user?.id));
  const myCompletion = session => (session.completedBy || []).some(p => String(p?._id || p) === String(user?.id));
  const sorted = useMemo(() => [...sessions].sort((a,b) => new Date(a.scheduledAt)-new Date(b.scheduledAt)), [sessions]);

  if (!user) return <main className="sessions-page"><section className="sessions-hero"><h1>My Learning Sessions</h1><p>Please log in to schedule and manage sessions.</p><Link className="sessions-primary-link" to="/login">Log in</Link></section></main>;
  return <main className="sessions-page">
    <header className="sessions-hero"><p className="sessions-eyebrow">LEARN TOGETHER</p><h1>My Learning Sessions</h1><p>Plan your skill exchange, keep track of upcoming sessions, and share feedback after learning together.</p></header>
    {message && <div className="sessions-message" role="status">{message}</div>}
    <section className="sessions-panel"><div className="sessions-panel-heading"><div><h2>Schedule a session</h2><p>Choose someone whose swap request has been accepted.</p></div><span aria-hidden="true">📅</span></div>
      {connections.length === 0 ? <p className="sessions-empty">You need an accepted connection first. Visit <Link to="/requests">Requests</Link> to check your connections.</p> : <form className="session-form" onSubmit={schedule}>
        <label>Connection<select name="partner" value={form.partner} onChange={e => { const partner=e.target.value; setForm(p=>({...p,partner,skill:""})); }} required><option value="">Choose a connection</option>{connections.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}</select></label>
        <label>Skill to learn / session topic<input name="skill" value={form.skill} onChange={updateForm} placeholder="e.g. React basics" maxLength="120" required /></label>
        <label>Date and time<input type="datetime-local" name="scheduledAt" value={form.scheduledAt} onChange={updateForm} min={new Date(Date.now()+60000).toISOString().slice(0,16)} required /></label>
        <label>Session mode<select name="mode" value={form.mode} onChange={updateForm}><option>Online</option><option>In person</option></select></label>
        <label className="session-notes">Notes (optional)<textarea name="notes" value={form.notes} onChange={updateForm} placeholder="What would you like to cover?" maxLength="1000" rows="3" /></label>
        <button className="sessions-primary" disabled={busy}>{busy ? "Scheduling…" : "Schedule session"}</button>
      </form>}
    </section>
    <section className="sessions-panel"><div className="sessions-panel-heading"><div><h2>Your sessions</h2><p>Upcoming and completed learning sessions.</p></div><span aria-hidden="true">📚</span></div>
      {loading ? <p>Loading sessions…</p> : sorted.length === 0 ? <p className="sessions-empty">No sessions yet. Schedule one with an accepted connection above.</p> : <div className="sessions-list">{sorted.map(s=>{const other=String(s.requester?._id)===String(user.id)?s.partner:s.requester; const hasFeedback=myFeedback(s); return <article className="session-card" key={s._id}>
        <div className="session-card-top"><div><span className={`session-status status-${s.status.toLowerCase()}`}>{s.status}</span><h3>{s.skill}</h3><p>With <strong>{other?.name || "Connection"}</strong></p></div><div className="session-date"><strong>{dateLabel(s.scheduledAt)}</strong><span>{s.mode}</span></div></div>
        {s.notes && <p className="session-notes-display">{s.notes}</p>}
        {s.status !== "Completed" && s.status !== "Cancelled" && <button className="sessions-secondary" onClick={()=>complete(s._id)}>{myCompletion(s) ? "Marked completed by you" : "Mark as completed"}</button>}
        {s.status === "Completed" && <div className="session-feedback"><h4>Completion & feedback</h4>{hasFeedback ? <p className="feedback-done">✓ You have submitted feedback for this session.</p> : <><p>How was your learning experience?</p><label>Rating<select value={(feedback[s._id]?.rating)||"5"} onChange={e=>setFeedback(p=>({...p,[s._id]:{rating:e.target.value,comment:p[s._id]?.comment||""}}))}>{[5,4,3,2,1].map(n=><option key={n} value={n}>{"★".repeat(n)} ({n}/5)</option>)}</select></label><label>Feedback<textarea rows="2" maxLength="1000" placeholder="Share a helpful comment (optional)" value={feedback[s._id]?.comment||""} onChange={e=>setFeedback(p=>({...p,[s._id]:{rating:p[s._id]?.rating||"5",comment:e.target.value}}))}/></label><button className="sessions-primary" onClick={()=>submitFeedback(s._id)}>Submit feedback</button></>}</div>}
        {(s.feedback||[]).length>0 && <div className="session-feedback-list"><strong>Feedback received</strong>{s.feedback.filter(f=>String(f.from?._id||f.from)!==String(user.id)).map((f,i)=><p key={f._id||i}>{"★".repeat(f.rating)}{"☆".repeat(5-f.rating)} {f.comment || "No written comment."}</p>)}</div>}
      </article>})}</div>}
    </section>
  </main>;
}
export default Sessions;
