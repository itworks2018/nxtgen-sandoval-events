import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Plus, Pencil, Trash2, X, ChevronLeft, ChevronRight, MapPin, Users, Clock, StickyNote, ShieldCheck, Eye, CalendarDays, Loader2, Megaphone, AlertTriangle, Link2, ExternalLink } from "lucide-react";
import { supabase } from "./supabaseClient.js";

const LOGO_SRC = "data:image/png;base64,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";

// ---------- helpers ----------
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const STORAGE_KEY = "nxtgen-sandoval-events:events";
const ANNOUNCEMENTS_KEY = "nxtgen-sandoval-events:announcements";

// quick-access links shown only in teacher mode
const TEACHER_RESOURCES = [
  { label: "Hub 1 NxtGen 2026 Attendance", url: "https://docs.google.com/spreadsheets/d/1K2Aarh3y_wuguiPtW-x0M7mJ-EAb_pwO8vyiOO4D-_A/edit?gid=976444217#gid=976444217" },
  { label: "NxtGen Linktree for Teaching Materials", url: "https://linktr.ee/nxtgensatellites" },
  { label: "NxtGen Main YouTube Channel", url: "https://www.youtube.com/channel/UCvwgPJDBklbnyMVsnNlMqbQ" },
  { label: "NxtGen Linktree Family Resources", url: "https://linktr.ee/NXTGENFamilyResources" },
];

function pad(n) { return String(n).padStart(2, "0"); }
function toDateKey(y, m, d) { return `${y}-${pad(m + 1)}-${pad(d)}`; }
function todayKey() {
  const t = new Date();
  return toDateKey(t.getFullYear(), t.getMonth(), t.getDate());
}
function uid() { return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; }

function keyToDate(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// expand an event's start/end into every dateKey it should appear on
function expandDateKeys(ev) {
  const start = ev.startDate;
  const end = ev.endDate && ev.endDate >= ev.startDate ? ev.endDate : ev.startDate;
  if (start === end) return [start];
  const keys = [];
  let cur = keyToDate(start);
  const endDate = keyToDate(end);
  let guard = 0;
  while (cur <= endDate && guard < 366) {
    keys.push(toDateKey(cur.getFullYear(), cur.getMonth(), cur.getDate()));
    cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 1);
    guard++;
  }
  return keys;
}

// hash a venue name to one of a fixed accent palette so recurring venues cluster visually
const VENUE_PALETTE = ["#FB7503", "#30CEE4", "#5EEAD4", "#A78BFA", "#F472B6", "#60A5FA"];function venueColor(venue) {
  if (!venue) return VENUE_PALETTE[0];
  let h = 0;
  for (let i = 0; i < venue.length; i++) h = (h * 31 + venue.charCodeAt(i)) % VENUE_PALETTE.length;
  return VENUE_PALETTE[Math.abs(h) % VENUE_PALETTE.length];
}

function formatTime12(t) {
  if (!t) return "";
  const [hStr, m] = t.split(":");
  let h = parseInt(hStr, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

function formatShortDate(key) {
  const d = keyToDate(key);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// returns the existing event that collides with `candidate` on the same day,
// start time, and venue (ignoring `excludeId`, e.g. the event being edited).
// Venue and start time both must be set for a conflict to be flagged.
function findEventConflict(candidate, events, excludeId) {
  const venue = (candidate.venue || "").trim().toLowerCase();
  if (!venue || !candidate.startTime) return null;
  const candidateDays = expandDateKeys(candidate);
  for (const ev of events) {
    if (ev.id === excludeId) continue;
    const evVenue = (ev.venue || "").trim().toLowerCase();
    if (evVenue !== venue || ev.startTime !== candidate.startTime) continue;
    const evDays = expandDateKeys(ev);
    if (evDays.some((d) => candidateDays.includes(d))) return ev;
  }
  return null;
}

// human-friendly "when" line for an event, aware of multi-day spans
function formatWhen(ev) {
  const spansDays = ev.endDate && ev.endDate !== ev.startDate;
  if (!spansDays) {
    if (ev.startTime && ev.endTime) return `${formatTime12(ev.startTime)} – ${formatTime12(ev.endTime)}`;
    if (ev.startTime) return formatTime12(ev.startTime);
    return "";
  }
  const startPart = `${formatShortDate(ev.startDate)}${ev.startTime ? ` ${formatTime12(ev.startTime)}` : ""}`;
  const endPart = `${formatShortDate(ev.endDate)}${ev.endTime ? ` ${formatTime12(ev.endTime)}` : ""}`;
  return `${startPart} → ${endPart}`;
}

// ---------- main component ----------
export default function App() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null); // object or "new" shape
  const [confirmDeleteAnnouncement, setConfirmDeleteAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null); // dateKey string
  const [teacherMode, setTeacherMode] = useState(false);
  const [showGate, setShowGate] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [gateError, setGateError] = useState("");
  const [gateBusy, setGateBusy] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null); // single event object being edited
  const [addDrafts, setAddDrafts] = useState(null); // array of draft objects when adding new event(s)
  const [confirmDelete, setConfirmDelete] = useState(null); // event id
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // load events and announcements from shared storage
  useEffect(() => {
    (async () => {
      try {
        const result = await window.storage.get(STORAGE_KEY, true);
        if (result && result.value) {
          setEvents(JSON.parse(result.value));
        }
      } catch (e) {
        // key not found yet — fine, start empty
      }
      try {
        const result = await window.storage.get(ANNOUNCEMENTS_KEY, true);
        if (result && result.value) {
          setAnnouncements(JSON.parse(result.value));
        }
      } catch (e) {
        // key not found yet — fine, start empty
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // restore/track the signed-in teacher session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setTeacherMode(!!data.session);
    });
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setTeacherMode(!!session);
    });
    return () => subscription.subscription.unsubscribe();
  }, []);

  const persistAnnouncements = useCallback(async (next) => {
    setAnnouncements(next);
    try {
      await window.storage.set(ANNOUNCEMENTS_KEY, JSON.stringify(next), true);
    } catch (e) {
      showToast("Couldn't save announcement — try again", true);
    }
  }, []);

  async function saveAnnouncement(form) {
    const clean = {
      id: form.id || uid(),
      title: form.title.trim(),
      text: form.text.trim(),
      urgent: !!form.urgent,
      createdAt: form.id ? form.createdAt : Date.now(),
    };
    let next;
    if (form.id) {
      next = announcements.map((a) => (a.id === form.id ? clean : a));
    } else {
      next = [clean, ...announcements];
    }
    await persistAnnouncements(next);
    setEditingAnnouncement(null);
    showToast(form.id ? "Announcement updated" : "Announcement posted");
  }

  async function deleteAnnouncement(id) {
    const next = announcements.filter((a) => a.id !== id);
    await persistAnnouncements(next);
    setConfirmDeleteAnnouncement(null);
    showToast("Announcement removed");
  }

  const persist = useCallback(async (next) => {
    setEvents(next);
    setSaving(true);
    try {
      await window.storage.set(STORAGE_KEY, JSON.stringify(next), true);
    } catch (e) {
      showToast("Couldn't save — try again", true);
    } finally {
      setSaving(false);
    }
  }, []);

  function showToast(msg, isError) {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 2600);
  }

  // ---------- calendar grid math ----------
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells = useMemo(() => {
    const arr = [];
    for (let i = 0; i < startWeekday; i++) {
      const d = daysInPrevMonth - startWeekday + 1 + i;
      const m = month === 0 ? 11 : month - 1;
      const y = month === 0 ? year - 1 : year;
      arr.push({ day: d, dateKey: toDateKey(y, m, d), inMonth: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      arr.push({ day: d, dateKey: toDateKey(year, month, d), inMonth: true });
    }
    const rem = (7 - (arr.length % 7)) % 7;
    for (let d = 1; d <= rem; d++) {
      const m = month === 11 ? 0 : month + 1;
      const y = month === 11 ? year + 1 : year;
      arr.push({ day: d, dateKey: toDateKey(y, m, d), inMonth: false });
    }
    return arr;
  }, [year, month, startWeekday, daysInMonth, daysInPrevMonth]);

  const eventsByDate = useMemo(() => {
    const map = {};
    for (const ev of events) {
      for (const key of expandDateKeys(ev)) {
        if (!map[key]) map[key] = [];
        map[key].push(ev);
      }
    }
    for (const k in map) map[k].sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));
    return map;
  }, [events]);

  function goToMonth(delta) {
    let m = month + delta;
    let y = year;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setMonth(m); setYear(y);
  }
  function goToday() {
    const t = new Date();
    setYear(t.getFullYear()); setMonth(t.getMonth());
    setSelectedDate(todayKey());
  }

  // ---------- teacher gate ----------
  async function attemptUnlock() {
    setGateError("");
    setGateBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: emailInput.trim(),
        password: passwordInput,
      });
      if (error) {
        setGateError("Invalid email or password.");
      } else {
        setShowGate(false);
        setEmailInput("");
        setPasswordInput("");
        showToast("Teacher mode on");
      }
    } catch (e) {
      setGateError("Couldn't reach the server. Try again.");
    } finally {
      setGateBusy(false);
    }
  }

  function exitTeacherMode() {
    supabase.auth.signOut();
    setTeacherMode(false);
    setEditingEvent(null);
    setAddDrafts(null);
    setConfirmDelete(null);
  }

  function makeDraft(dateKey) {
    return {
      draftId: uid(),
      name: "",
      startDate: dateKey,
      startTime: "",
      endDate: dateKey,
      endTime: "",
      participants: "",
      venue: "",
      notes: "",
    };
  }

  // ---------- CRUD ----------
  async function saveEvent(form) {
    const clean = {
      id: form.id || uid(),
      name: form.name.trim(),
      startDate: form.startDate,
      startTime: form.startTime,
      endDate: form.endDate || form.startDate,
      endTime: form.endTime,
      participants: form.participants.trim(),
      venue: form.venue.trim(),
      notes: form.notes.trim(),
    };
    const next = events.map((e) => (e.id === form.id ? clean : e));
    await persist(next);
    setEditingEvent(null);
    showToast("Event updated");
  }

  async function saveMultipleEvents(drafts) {
    const clean = drafts.map((form) => ({
      id: uid(),
      name: form.name.trim(),
      startDate: form.startDate,
      startTime: form.startTime,
      endDate: form.endDate || form.startDate,
      endTime: form.endTime,
      participants: form.participants.trim(),
      venue: form.venue.trim(),
      notes: form.notes.trim(),
    }));
    const next = [...events, ...clean];
    await persist(next);
    setAddDrafts(null);
    showToast(clean.length > 1 ? `${clean.length} events added` : "Event added");
  }

  async function deleteEvent(id) {
    const next = events.filter((e) => e.id !== id);
    await persist(next);
    setConfirmDelete(null);
    showToast("Event deleted");
  }

  const selectedEvents = selectedDate ? (eventsByDate[selectedDate] || []) : [];

  return (
    <div style={styles.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        ::selection { background: #FB750355; }
        button { font-family: inherit; cursor: pointer; }
        input, textarea { font-family: inherit; }
        @keyframes pulseDot {
          0% { box-shadow: 0 0 0 0 rgba(255,107,74,0.55); }
          70% { box-shadow: 0 0 0 8px rgba(255,107,74,0); }
          100% { box-shadow: 0 0 0 0 rgba(255,107,74,0); }
        }
        @keyframes slideIn { from { transform: translateX(24px); opacity:0; } to { transform: translateX(0); opacity:1; } }
        @keyframes fadeUp { from { transform: translateY(8px); opacity:0; } to { transform: translateY(0); opacity:1; } }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition: none !important; }
        }
        .nxg-cell:focus-visible, .nxg-btn:focus-visible, .nxg-input:focus-visible {
          outline: 2px solid #FB7503; outline-offset: 2px;
        }
        .nxg-scroll::-webkit-scrollbar { width: 6px; }
        .nxg-scroll::-webkit-scrollbar-thumb { background: #2A2F52; border-radius: 4px; }
      `}</style>

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.brandRow}>
          <div style={styles.brandMark}>
            <img src={LOGO_SRC} alt="NxtGen logo" style={styles.brandLogoImg} />
          </div>
          <div>
            <h1 style={styles.brandTitle}>NxtGen <span style={{ color: "#FB7503" }}>Sandoval</span> Events</h1>
            <p style={styles.brandSub}>NxtGen Sandoval Calendar of Events</p>
          </div>
        </div>

        <div style={styles.modeRow}>
          {saving && <Loader2 size={16} color="#8B90B3" style={{ animation: "spin 1s linear infinite" }} />}
          {teacherMode ? (
            <button className="nxg-btn" onClick={exitTeacherMode} style={styles.modePillActive}>
              <ShieldCheck size={15} /> Teacher mode <X size={14} style={{ marginLeft: 2 }} />
            </button>
          ) : (
            <button className="nxg-btn" onClick={() => setShowGate(true)} style={styles.modePill}>
              <Eye size={15} /> Viewing only
            </button>
          )}
        </div>
      </header>

      {/* Announcements */}
      <div style={styles.announceBox}>
        <div style={styles.announceHead}>
          <span style={styles.announceEyebrow}><Megaphone size={13} /> ANNOUNCEMENTS</span>
          {teacherMode && (
            <button
              className="nxg-btn"
              style={styles.announceAddBtn}
              onClick={() => setEditingAnnouncement({ id: null, title: "", text: "", urgent: false })}
            >
              <Plus size={13} /> Post
            </button>
          )}
        </div>
        {announcements.length === 0 ? (
          <p style={styles.announceEmpty}>No announcements right now.</p>
        ) : (
          <div style={styles.announceList} className="nxg-scroll">
            {announcements.map((a) => (
              <div key={a.id} style={{ ...styles.announceCard, borderLeftColor: a.urgent ? "#FB7503" : "#5EEAD4" }}>
                {a.urgent && <AlertTriangle size={13} color="#FB7503" style={{ flexShrink: 0, marginTop: 1 }} />}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={styles.announceCardHead}>
                    <h4 style={styles.announceTitle}>{a.title}</h4>
                    {teacherMode && (
                      <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                        <button className="nxg-btn" style={styles.iconBtnSm} onClick={() => setEditingAnnouncement(a)} aria-label="Edit announcement">
                          <Pencil size={12} />
                        </button>
                        <button className="nxg-btn" style={{ ...styles.iconBtnSm, color: "#FB7503" }} onClick={() => setConfirmDeleteAnnouncement(a.id)} aria-label="Delete announcement">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                  <p style={styles.announceText}>{a.text}</p>
                  <p style={styles.announceMeta}>Posted {formatAnnouncementDateTime(a.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Teacher resource links */}
      {teacherMode && (
        <div style={styles.resourceBox}>
          <div style={styles.announceHead}>
            <span style={styles.announceEyebrow}><Link2 size={13} /> TEACHER RESOURCES</span>
          </div>
          <div style={styles.resourceList}>
            {TEACHER_RESOURCES.map((r) => (
              <a key={r.url} href={r.url} target="_blank" rel="noopener noreferrer" style={styles.resourceLink}>
                <span>{r.label}</span>
                <ExternalLink size={13} style={{ flexShrink: 0 }} />
              </a>
            ))}
          </div>
        </div>
      )}
      {/* Month nav */}
      <div style={styles.navRow}>
        <div style={styles.navLeft}>
          <button className="nxg-btn" style={styles.navBtn} onClick={() => goToMonth(-1)} aria-label="Previous month">
            <ChevronLeft size={18} />
          </button>
          <h2 style={styles.monthLabel}>{MONTH_NAMES[month]} {year}</h2>
          <button className="nxg-btn" style={styles.navBtn} onClick={() => goToMonth(1)} aria-label="Next month">
            <ChevronRight size={18} />
          </button>
        </div>
        <button className="nxg-btn" style={styles.todayBtn} onClick={goToday}>Today</button>
      </div>

      {/* Calendar grid */}
      <div style={styles.main}>
        <div style={styles.weekHeader}>
          {DAY_NAMES.map((d) => <div key={d} style={styles.weekHeaderCell}>{d}</div>)}
        </div>

        {loading ? (
          <div style={styles.loadingBox}><Loader2 size={22} color="#8B90B3" style={{ animation: "spin 1s linear infinite" }} /></div>
        ) : (
          <div style={styles.grid}>
            {cells.map((cell, i) => {
              const dayEvents = eventsByDate[cell.dateKey] || [];
              const isToday = cell.dateKey === todayKey();
              return (
                <button
                  key={i}
                  className="nxg-cell"
                  onClick={() => setSelectedDate(cell.dateKey)}
                  style={{
                    ...styles.cell,
                    opacity: cell.inMonth ? 1 : 0.35,
                    background: selectedDate === cell.dateKey ? "#202547" : "#171B33",
                    border: isToday ? "1px solid #FB7503" : "1px solid #2A2F52",
                  }}
                >
                  <div style={styles.cellTop}>
                    <span style={{ ...styles.cellDay, color: isToday ? "#FB7503" : "#F4F3FA" }}>{cell.day}</span>
                    {isToday && <span style={styles.todayDot} />}
                  </div>
                  <div style={styles.chipStack}>
                    {dayEvents.slice(0, 3).map((ev) => (
                      <div key={ev.id} style={{ ...styles.chip, borderLeftColor: venueColor(ev.venue) }}>
                        {ev.startTime && <span style={styles.chipTime}>{formatTime12(ev.startTime)}</span>}
                        <span style={styles.chipName}>{ev.name}</span>
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div style={styles.moreLabel}>+{dayEvents.length - 3} more</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Day rail (slide-over) */}
      {selectedDate && (
        <div style={styles.overlay} onClick={() => setSelectedDate(null)}>
          <div style={styles.railPanel} onClick={(e) => e.stopPropagation()}>
            <div style={styles.railHeader}>
              <div>
                <p style={styles.railEyebrow}>SCHEDULE</p>
                <h3 style={styles.railTitle}>{formatDateHeading(selectedDate)}</h3>
              </div>
              <button className="nxg-btn" style={styles.iconBtn} onClick={() => setSelectedDate(null)} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <div style={styles.railBody} className="nxg-scroll">
              {selectedEvents.length === 0 && (
                <p style={styles.emptyText}>Nothing scheduled yet for this day.</p>
              )}
              {selectedEvents.map((ev) => (
                <div key={ev.id} style={{ ...styles.eventCard, borderLeftColor: venueColor(ev.venue) }}>
                  <div style={styles.eventCardHead}>
                    <h4 style={styles.eventName}>{ev.name}</h4>
                    {teacherMode && (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="nxg-btn" style={styles.iconBtnSm} onClick={() => setEditingEvent(ev)} aria-label="Edit event">
                          <Pencil size={14} />
                        </button>
                        <button className="nxg-btn" style={{ ...styles.iconBtnSm, color: "#FB7503" }} onClick={() => setConfirmDelete(ev.id)} aria-label="Delete event">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                  <div style={styles.eventMetaRow}>
                    {formatWhen(ev) && <span style={styles.metaItem}><Clock size={12} /> {formatWhen(ev)}</span>}
                    {ev.venue && <span style={styles.metaItem}><MapPin size={12} /> {ev.venue}</span>}
                    {ev.participants && <span style={styles.metaItem}><Users size={12} /> {ev.participants}</span>}
                  </div>
                  {ev.notes && (
                    <p style={styles.eventNotes}><StickyNote size={12} style={{ marginRight: 5, flexShrink: 0 }} />{ev.notes}</p>
                  )}
                </div>
              ))}
            </div>

            {teacherMode && (
              <button
                className="nxg-btn"
                style={styles.addBtn}
                onClick={() => setAddDrafts([makeDraft(selectedDate)])}
              >
                <Plus size={16} /> Add event
              </button>
            )}
          </div>
        </div>
      )}

      {/* Teacher gate modal */}
      {showGate && (
        <div style={styles.overlay} onClick={() => setShowGate(false)}>
          <div style={styles.gateModal} onClick={(e) => e.stopPropagation()}>
            <ShieldCheck size={22} color="#30CEE4" />
            <h3 style={styles.gateTitle}>Teacher sign-in</h3>
            <p style={styles.gateSub}>Ask your ministry lead if you don't have an account.</p>
            <input
              className="nxg-input"
              autoFocus
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && attemptUnlock()}
              placeholder="Email"
              style={styles.gateInput}
            />
            <input
              className="nxg-input"
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && attemptUnlock()}
              placeholder="Password"
              style={{ ...styles.gateInput, marginTop: 8 }}
            />
            {gateError && <p style={styles.gateError}>{gateError}</p>}
            <div style={styles.gateActions}>
              <button className="nxg-btn" style={styles.secondaryBtn} onClick={() => { setShowGate(false); setEmailInput(""); setPasswordInput(""); setGateError(""); }}>Cancel</button>
              <button className="nxg-btn" style={styles.primaryBtn} onClick={attemptUnlock} disabled={gateBusy}>{gateBusy ? "Signing in…" : "Sign in"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Announcement form modal */}
      {editingAnnouncement && (
        <AnnouncementForm
          initial={editingAnnouncement}
          onCancel={() => setEditingAnnouncement(null)}
          onSave={saveAnnouncement}
        />
      )}

      {/* Announcement delete confirm */}
      {confirmDeleteAnnouncement && (
        <div style={styles.overlay} onClick={() => setConfirmDeleteAnnouncement(null)}>
          <div style={styles.gateModal} onClick={(e) => e.stopPropagation()}>
            <Trash2 size={22} color="#FB7503" />
            <h3 style={styles.gateTitle}>Remove this announcement?</h3>
            <p style={styles.gateSub}>This can't be undone.</p>
            <div style={styles.gateActions}>
              <button className="nxg-btn" style={styles.secondaryBtn} onClick={() => setConfirmDeleteAnnouncement(null)}>Keep it</button>
              <button className="nxg-btn" style={{ ...styles.primaryBtn, background: "#FB7503" }} onClick={() => deleteAnnouncement(confirmDeleteAnnouncement)}>Remove</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal (single event) */}
      {editingEvent && (
        <EventEditForm
          initial={editingEvent}
          events={events}
          onCancel={() => setEditingEvent(null)}
          onSave={saveEvent}
        />
      )}

      {/* Add modal (one or more events at once) */}
      {addDrafts && (
        <EventAddForm
          drafts={addDrafts}
          events={events}
          makeDraft={() => makeDraft(selectedDate)}
          onCancel={() => setAddDrafts(null)}
          onSaveAll={saveMultipleEvents}
        />
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <div style={styles.overlay} onClick={() => setConfirmDelete(null)}>
          <div style={styles.gateModal} onClick={(e) => e.stopPropagation()}>
            <Trash2 size={22} color="#FB7503" />
            <h3 style={styles.gateTitle}>Delete this event?</h3>
            <p style={styles.gateSub}>This can't be undone.</p>
            <div style={styles.gateActions}>
              <button className="nxg-btn" style={styles.secondaryBtn} onClick={() => setConfirmDelete(null)}>Keep it</button>
              <button className="nxg-btn" style={{ ...styles.primaryBtn, background: "#FB7503" }} onClick={() => deleteEvent(confirmDelete)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ ...styles.toast, borderColor: toast.isError ? "#FB7503" : "#5EEAD4" }}>
          {toast.msg}
        </div>
      )}

      <footer style={styles.footer}>CCF NextGen Sandoval 2026. All Rights Reserved.</footer>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function formatDateHeading(dateKey) {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}

// human-friendly "posted on" timestamp for an announcement
function formatAnnouncementDateTime(ts) {
  const date = new Date(ts);
  return date.toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

// ---------- single event edit form ----------
function EventEditForm({ initial, events, onCancel, onSave }) {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function submit() {
    if (!form.name.trim()) { setError("Give the event a name."); return; }
    if (!form.startDate) { setError("Pick a start date."); return; }
    const conflict = findEventConflict(form, events, form.id);
    if (conflict) {
      setError(`Already booked: "${conflict.name}" is at the same day, time, and venue.`);
      return;
    }
    setError("");
    onSave(form);
  }

  return (
    <div style={styles.overlay} onClick={onCancel}>
      <div style={styles.formModal} onClick={(e) => e.stopPropagation()} className="nxg-scroll">
        <div style={styles.railHeader}>
          <h3 style={styles.railTitle}>Edit event</h3>
          <button className="nxg-btn" style={styles.iconBtn} onClick={onCancel} aria-label="Close"><X size={18} /></button>
        </div>

        <EventFieldSet form={form} update={update} />

        {error && <p style={styles.gateError}>{error}</p>}

        <div style={styles.gateActions}>
          <button className="nxg-btn" style={styles.secondaryBtn} onClick={onCancel}>Cancel</button>
          <button className="nxg-btn" style={styles.primaryBtn} onClick={submit}>Save changes</button>
        </div>
      </div>
    </div>
  );
}

// ---------- multi-event quick add form ----------
function EventAddForm({ drafts: initialDrafts, events, makeDraft, onCancel, onSaveAll }) {
  const [drafts, setDrafts] = useState(initialDrafts);
  const [error, setError] = useState("");

  function updateDraft(draftId, field, value) {
    setDrafts((list) => list.map((d) => (d.draftId === draftId ? { ...d, [field]: value } : d)));
  }

  function addAnother() {
    setDrafts((list) => [...list, makeDraft()]);
  }

  function removeDraft(draftId) {
    setDrafts((list) => list.filter((d) => d.draftId !== draftId));
  }

  function submit() {
    for (const d of drafts) {
      if (!d.name.trim()) { setError("Every event needs a name."); return; }
      if (!d.startDate) { setError("Every event needs a start date."); return; }
    }
    const checked = [...events];
    for (const d of drafts) {
      const conflict = findEventConflict(d, checked);
      if (conflict) {
        setError(`"${d.name.trim()}" conflicts with "${conflict.name}" — same day, time, and venue.`);
        return;
      }
      checked.push(d);
    }
    setError("");
    onSaveAll(drafts);
  }

  return (
    <div style={styles.overlay} onClick={onCancel}>
      <div style={styles.formModal} onClick={(e) => e.stopPropagation()} className="nxg-scroll">
        <div style={styles.railHeader}>
          <h3 style={styles.railTitle}>{drafts.length > 1 ? `New events (${drafts.length})` : "New event"}</h3>
          <button className="nxg-btn" style={styles.iconBtn} onClick={onCancel} aria-label="Close"><X size={18} /></button>
        </div>

        {drafts.map((d, i) => (
          <div key={d.draftId} style={i > 0 ? styles.draftCard : styles.draftCardFirst}>
            {drafts.length > 1 && (
              <div style={styles.draftCardHead}>
                <span style={styles.draftLabel}>Event {i + 1}</span>
                <button className="nxg-btn" style={styles.iconBtnSm} onClick={() => removeDraft(d.draftId)} aria-label="Remove this event">
                  <Trash2 size={13} />
                </button>
              </div>
            )}
            <EventFieldSet form={d} update={(field, value) => updateDraft(d.draftId, field, value)} />
          </div>
        ))}

        <button className="nxg-btn" style={styles.addAnotherBtn} onClick={addAnother}>
          <Plus size={15} /> Add another event
        </button>

        {error && <p style={styles.gateError}>{error}</p>}

        <div style={styles.gateActions}>
          <button className="nxg-btn" style={styles.secondaryBtn} onClick={onCancel}>Cancel</button>
          <button className="nxg-btn" style={styles.primaryBtn} onClick={submit}>
            {drafts.length > 1 ? `Add ${drafts.length} events` : "Add event"}
          </button>
        </div>
      </div>
    </div>
  );
}

// shared field layout used by both the edit and add forms
function EventFieldSet({ form, update }) {
  return (
    <>
      <label style={styles.label}>Name of event</label>
      <input className="nxg-input" style={styles.input} value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Youth Night: Fire and Fellowship" />

      <div style={styles.formRow}>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Start date</label>
          <input className="nxg-input" style={styles.input} type="date" value={form.startDate} onChange={(e) => update("startDate", e.target.value)} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Start time</label>
          <input className="nxg-input" style={styles.input} type="time" value={form.startTime} onChange={(e) => update("startTime", e.target.value)} />
        </div>
      </div>

      <div style={styles.formRow}>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>End date</label>
          <input className="nxg-input" style={styles.input} type="date" value={form.endDate} onChange={(e) => update("endDate", e.target.value)} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>End time</label>
          <input className="nxg-input" style={styles.input} type="time" value={form.endTime} onChange={(e) => update("endTime", e.target.value)} />
        </div>
      </div>

      <label style={styles.label}>Participants</label>
      <input className="nxg-input" style={styles.input} value={form.participants} onChange={(e) => update("participants", e.target.value)} placeholder="High school fellowship, worship team" />

      <label style={styles.label}>Venue</label>
      <input className="nxg-input" style={styles.input} value={form.venue} onChange={(e) => update("venue", e.target.value)} placeholder="Main sanctuary" />

      <label style={styles.label}>Notes</label>
      <textarea className="nxg-input" style={{ ...styles.input, minHeight: 70, resize: "vertical" }} value={form.notes} onChange={(e) => update("notes", e.target.value)} placeholder="Bring guitars, extra chairs from the annex" />
    </>
  );
}

// ---------- announcement form ----------
function AnnouncementForm({ initial, onCancel, onSave }) {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function submit() {
    if (!form.title.trim()) { setError("Give the announcement a title."); return; }
    if (!form.text.trim()) { setError("Write the announcement first."); return; }
    setError("");
    onSave(form);
  }

  return (
    <div style={styles.overlay} onClick={onCancel}>
      <div style={styles.formModal} onClick={(e) => e.stopPropagation()} className="nxg-scroll">
        <div style={styles.railHeader}>
          <h3 style={styles.railTitle}>{form.id ? "Edit announcement" : "New announcement"}</h3>
          <button className="nxg-btn" style={styles.iconBtn} onClick={onCancel} aria-label="Close"><X size={18} /></button>
        </div>

        <label style={styles.label}>Title</label>
        <input
          className="nxg-input"
          style={styles.input}
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="No fellowship this Friday"
        />

        <label style={styles.label}>Description</label>
        <textarea
          className="nxg-input"
          style={{ ...styles.input, minHeight: 90, resize: "vertical" }}
          value={form.text}
          onChange={(e) => update("text", e.target.value)}
          placeholder="We're resuming next week at the usual time and venue."
        />

        <label style={styles.checkboxRow}>
          <input
            type="checkbox"
            checked={!!form.urgent}
            onChange={(e) => update("urgent", e.target.checked)}
          />
          Mark as urgent
        </label>

        {error && <p style={styles.gateError}>{error}</p>}

        <div style={styles.gateActions}>
          <button className="nxg-btn" style={styles.secondaryBtn} onClick={onCancel}>Cancel</button>
          <button className="nxg-btn" style={styles.primaryBtn} onClick={submit}>{form.id ? "Save changes" : "Post announcement"}</button>
        </div>
      </div>
    </div>
  );
}

// ---------- styles ----------
const styles = {
  app: {
    minHeight: "100vh",
    background: "#0F1224",
    color: "#F4F3FA",
    fontFamily: "'Inter', sans-serif",
    padding: "clamp(14px, 2vw, 28px) clamp(12px, 3vw, 32px) 0",
    width: "100%",
    maxWidth: 1600,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
  },
  main: { flex: 1, display: "flex", flexDirection: "column", minHeight: 0 },
  footer: { textAlign: "center", color: "#8B90B3", fontSize: 12, padding: "18px 0 20px", marginTop: 24, borderTop: "1px solid #2A2F52" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 20 },
  brandRow: { display: "flex", alignItems: "center", gap: 12 },
  brandMark: { width: 42, height: 42, borderRadius: 10, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden", padding: 3 },
  brandLogoImg: { width: "100%", height: "100%", objectFit: "contain" },
  brandTitle: { fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 700, margin: 0, letterSpacing: "-0.02em" },
  brandSub: { margin: "2px 0 0", fontSize: 12.5, color: "#8B90B3" },
  modeRow: { display: "flex", alignItems: "center", gap: 10 },
  modePill: { display: "flex", alignItems: "center", gap: 6, background: "#171B33", border: "1px solid #2A2F52", color: "#8B90B3", padding: "8px 12px", borderRadius: 20, fontSize: 12.5, fontWeight: 500 },
  modePillActive: { display: "flex", alignItems: "center", gap: 6, background: "#30CEE422", border: "1px solid #30CEE4", color: "#30CEE4", padding: "8px 12px", borderRadius: 20, fontSize: 12.5, fontWeight: 600 },
  announceBox: { background: "#171B33", border: "1px solid #2A2F52", borderRadius: 12, padding: "14px 16px", marginBottom: 18 },
  announceHead: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  announceEyebrow: { display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#30CEE4" },
  announceAddBtn: { display: "flex", alignItems: "center", gap: 4, background: "transparent", border: "1px solid #2A2F52", color: "#F4F3FA", padding: "5px 10px", borderRadius: 7, fontSize: 11.5, fontWeight: 600 },
  announceEmpty: { color: "#8B90B3", fontSize: 12.5, margin: "8px 0 2px" },
  announceList: { display: "flex", flexDirection: "column", gap: 8, marginTop: 8, maxHeight: 180, overflowY: "auto", paddingRight: 4 },
  announceCard: { display: "flex", alignItems: "flex-start", gap: 8, background: "#202547", borderLeft: "3px solid", borderRadius: 8, padding: "9px 11px", animation: "fadeUp 0.2s ease-out" },
  announceCardHead: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 },
  announceTitle: { fontFamily: "'Sora', sans-serif", fontSize: 13, fontWeight: 700, margin: 0, color: "#F4F3FA" },
  announceText: { flex: 1, fontSize: 12.5, lineHeight: 1.45, margin: "3px 0 0", color: "#F4F3FA" },
  announceMeta: { fontSize: 10.5, color: "#8B90B3", margin: "6px 0 0" },
  resourceBox: { background: "#171B33", border: "1px solid #2A2F52", borderRadius: 12, padding: "14px 16px", marginBottom: 18 },
  resourceList: { display: "flex", flexDirection: "column", gap: 8, marginTop: 8 },
  resourceLink: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, background: "#202547", borderRadius: 8, padding: "9px 12px", fontSize: 12.5, fontWeight: 500, color: "#F4F3FA", textDecoration: "none" },
  checkboxRow: { display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "#B4B8D4", marginTop: 12 },
  navRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  navLeft: { display: "flex", alignItems: "center", gap: 10 },
  navBtn: { background: "#171B33", border: "1px solid #2A2F52", color: "#F4F3FA", width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" },
  monthLabel: { fontFamily: "'Sora', sans-serif", fontSize: 17, fontWeight: 600, margin: 0, minWidth: 150, textAlign: "center" },
  todayBtn: { background: "transparent", border: "1px solid #2A2F52", color: "#8B90B3", padding: "7px 14px", borderRadius: 8, fontSize: 12.5, fontWeight: 500 },
  weekHeader: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, marginBottom: 6 },
  weekHeaderCell: { textAlign: "center", fontSize: 11, fontWeight: 600, color: "#8B90B3", letterSpacing: "0.05em", padding: "4px 0" },
  grid: { flex: 1, display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gridAutoRows: "1fr", gap: 6, minHeight: 0 },
  cell: {
    minHeight: 78, borderRadius: 10, padding: "6px 6px", textAlign: "left",
    display: "flex", flexDirection: "column", gap: 4, position: "relative", overflow: "hidden",
  },
  cellTop: { display: "flex", alignItems: "center", gap: 5 },
  cellDay: { fontSize: 12.5, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" },
  todayDot: { width: 5, height: 5, borderRadius: "50%", background: "#FB7503", animation: "pulseDot 2s infinite" },
  chipStack: { display: "flex", flexDirection: "column", gap: 3, overflow: "hidden" },
  chip: { background: "#0F1224", borderLeft: "3px solid", borderRadius: 4, padding: "2px 5px", fontSize: 10, lineHeight: 1.25, display: "flex", flexDirection: "column", gap: 0 },
  chipTime: { color: "#8B90B3", fontSize: 8.5, fontFamily: "'JetBrains Mono', monospace" },
  chipName: { color: "#F4F3FA", fontSize: 10, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  moreLabel: { fontSize: 9, color: "#8B90B3", paddingLeft: 2 },
  loadingBox: { display: "flex", justifyContent: "center", padding: 60 },

  overlay: { position: "fixed", inset: 0, background: "rgba(10,11,22,0.6)", backdropFilter: "blur(2px)", display: "flex", justifyContent: "flex-end", zIndex: 50 },
  railPanel: { width: "min(400px, 92vw)", background: "#171B33", height: "100%", borderLeft: "1px solid #2A2F52", padding: 22, display: "flex", flexDirection: "column", animation: "slideIn 0.22s ease-out" },
  railHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  railEyebrow: { fontSize: 10.5, letterSpacing: "0.1em", color: "#FB7503", fontWeight: 700, margin: 0 },
  railTitle: { fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 700, margin: "4px 0 0" },
  railBody: { flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 },
  emptyText: { color: "#8B90B3", fontSize: 13.5 },
  eventCard: { background: "#202547", borderLeft: "3px solid", borderRadius: 8, padding: "12px 14px", animation: "fadeUp 0.2s ease-out" },
  eventCardHead: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 },
  eventName: { fontFamily: "'Sora', sans-serif", fontSize: 14.5, fontWeight: 600, margin: 0 },
  eventMetaRow: { display: "flex", flexWrap: "wrap", gap: "6px 14px", marginTop: 8 },
  metaItem: { display: "flex", alignItems: "center", gap: 4, fontSize: 11.5, color: "#8B90B3" },
  eventNotes: { display: "flex", alignItems: "flex-start", fontSize: 12, color: "#B4B8D4", marginTop: 8, lineHeight: 1.4 },
  iconBtn: { background: "transparent", border: "none", color: "#8B90B3", width: 30, height: 30, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" },
  iconBtnSm: { background: "#0F1224", border: "1px solid #2A2F52", color: "#8B90B3", width: 26, height: 26, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" },
  addBtn: { marginTop: 14, background: "#FB7503", color: "#0F1224", border: "none", borderRadius: 8, padding: "11px 16px", fontWeight: 700, fontSize: 13.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 },

  gateModal: { background: "#171B33", border: "1px solid #2A2F52", borderRadius: 14, padding: 26, width: "min(340px, 88vw)", margin: "auto", display: "flex", flexDirection: "column", gap: 4, animation: "fadeUp 0.2s ease-out" },
  gateTitle: { fontFamily: "'Sora', sans-serif", fontSize: 16.5, fontWeight: 700, margin: "10px 0 0" },
  gateSub: { fontSize: 12.5, color: "#8B90B3", margin: "2px 0 14px" },
  gateInput: { background: "#0F1224", border: "1px solid #2A2F52", borderRadius: 8, padding: "10px 12px", color: "#F4F3FA", fontSize: 13.5, width: "100%" },
  gateError: { color: "#FB7503", fontSize: 12, marginTop: 8 },
  gateActions: { display: "flex", gap: 10, marginTop: 16, justifyContent: "flex-end" },
  secondaryBtn: { background: "transparent", border: "1px solid #2A2F52", color: "#8B90B3", padding: "9px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500 },
  primaryBtn: { background: "#30CEE4", color: "#0F1224", border: "none", padding: "9px 18px", borderRadius: 8, fontSize: 13, fontWeight: 700 },

  formModal: { background: "#171B33", border: "1px solid #2A2F52", borderRadius: 14, padding: 24, width: "min(440px, 92vw)", margin: "auto", maxHeight: "88vh", overflowY: "auto", animation: "fadeUp 0.2s ease-out" },
  formRow: { display: "flex", gap: 12 },
  label: { fontSize: 11.5, fontWeight: 600, color: "#8B90B3", marginTop: 12, marginBottom: 5, display: "block", letterSpacing: "0.02em" },
  input: { width: "100%", background: "#0F1224", border: "1px solid #2A2F52", borderRadius: 8, padding: "9px 11px", color: "#F4F3FA", fontSize: 13.5 },
  draftCardFirst: { paddingBottom: 6 },
  draftCard: { borderTop: "1px dashed #2A2F52", marginTop: 18, paddingTop: 14 },
  draftCardHead: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  draftLabel: { fontSize: 11.5, fontWeight: 700, color: "#30CEE4", letterSpacing: "0.05em" },
  addAnotherBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%", background: "transparent", border: "1px dashed #2A2F52", color: "#8B90B3", padding: "10px 14px", borderRadius: 8, fontSize: 12.5, fontWeight: 600, marginTop: 16 },

  toast: { position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", background: "#171B33", border: "1px solid", borderRadius: 10, padding: "10px 18px", fontSize: 13, zIndex: 60, animation: "fadeUp 0.2s ease-out" },
};
