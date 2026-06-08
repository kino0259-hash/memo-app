import { useState, useEffect, useRef } from "react";

const STORAGE_KEY = "memo_app_notes";

const COLORS = [
  { bg: "#1a1a2e", accent: "#e94560" },
  { bg: "#0f3460", accent: "#e94560" },
  { bg: "#16213e", accent: "#f5a623" },
  { bg: "#1b262c", accent: "#00b4d8" },
];

function formatDate(ts) {
  const d = new Date(ts);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${mm}/${dd} ${hh}:${min}`;
}

function NoteCard({ note, onOpen, onDelete }) {
  const color = COLORS[note.id % COLORS.length];
  const preview = note.body.slice(0, 80) + (note.body.length > 80 ? "…" : "");
  return (
    <div
      onClick={() => onOpen(note)}
      style={{
        background: `linear-gradient(135deg, ${color.bg}ee, ${color.bg}cc)`,
        border: `1px solid ${color.accent}33`,
        borderLeft: `3px solid ${color.accent}`,
        borderRadius: "12px",
        padding: "48px 16px 14px",
        marginBottom: "10px",
        cursor: "pointer",
        position: "relative",
        backdropFilter: "blur(10px)",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
        boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
      }}
      onTouchStart={e => e.currentTarget.style.transform = "scale(0.98)"}
      onTouchEnd={e => e.currentTarget.style.transform = "scale(1)"}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: "'Noto Sans JP', sans-serif",
            fontWeight: 600,
            fontSize: "15px",
            color: "#f0f0f0",
            marginBottom: "5px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}>
            {note.title || "（無題）"}
          </div>
          <div style={{
            fontFamily: "'Noto Sans JP', sans-serif",
            fontSize: "12px",
            color: "#aaa",
            lineHeight: 1.5,
            wordBreak: "break-all",
          }}>
            {preview || "内容なし"}
          </div>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onDelete(note.id); }}
          style={{
            background: "none",
            border: "none",
            color: "#666",
            fontSize: "18px",
            cursor: "pointer",
            padding: "2px 4px",
            lineHeight: 1,
            flexShrink: 0,
          }}
        >×</button>
      </div>
      <div style={{
        marginTop: "8px",
        fontSize: "10px",
        color: color.accent + "99",
        fontFamily: "monospace",
        letterSpacing: "0.05em",
      }}>
        {formatDate(note.updatedAt)}
      </div>
    </div>
  );
}
export default function App() {
  const [notes, setNotes] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });
  const [view, setView] = useState("list");
  const [current, setCurrent] = useState(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [search, setSearch] = useState("");
  const [idCounter, setIdCounter] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return arr.length > 0 ? Math.max(...arr.map(n => n.id)) + 1 : 1;
    } catch { return 1; }
  });
  const bodyRef = useRef(null);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(notes)); } catch {}
  }, [notes]);

  const filtered = notes.filter(n =>
    n.title.includes(search) || n.body.includes(search)
  ).sort((a, b) => b.updatedAt - a.updatedAt);

  function openNew() {
    setCurrent(null);
    setTitle("");
    setBody("");
    setView("new");
    setTimeout(() => bodyRef.current?.focus(), 100);
  }

  function openEdit(note) {
    setCurrent(note);
    setTitle(note.title);
    setBody(note.body);
    setView("edit");
  }

  function saveNote() {
    const now = Date.now();
    if (current) {
      setNotes(prev => prev.map(n =>
        n.id === current.id ? { ...n, title: title.trim(), body, updatedAt: now } : n
      ));
    } else {
      const newNote = { id: idCounter, title: title.trim(), body, createdAt: now, updatedAt: now };
      setNotes(prev => [newNote, ...prev]);
      setIdCounter(c => c + 1);
    }
    setView("list");
  }

  function deleteNote(id) {
    if (window.confirm("このメモを削除しますか？")) {
      setNotes(prev => prev.filter(n => n.id !== id));
    }
  }

  const accentColor = "#00b4d8";

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a14",
      fontFamily: "'Noto Sans JP', sans-serif",
      maxWidth: "430px",
      margin: "0 auto",
      position: "relative",
    }}>
      <div style={{
        position: "fixed", top: "-80px", right: "-80px",
        width: "220px", height: "220px",
        borderRadius: "50%",
        background: `radial-gradient(circle, ${accentColor}22, transparent 70%)`,
        pointerEvents: "none", zIndex: 0,
      }} />

      {view === "list" && (
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{
            padding: "20px 20px 12px",
            background: "linear-gradient(180deg, #0a0a14 80%, transparent)",
            position: "sticky", top: 0, zIndex: 10,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <div>
                <div style={{ fontSize: "22px", fontWeight: 700, color: "#f0f0f0", letterSpacing: "-0.5px" }}>
                  📝 メモ
                </div>
                <div style={{ fontSize: "11px", color: "#555", marginTop: "2px" }}>
                  {notes.length}件
                </div>
              </div>
              <button
                onClick={openNew}
                style={{
                  background: `linear-gradient(135deg, ${accentColor}, #0090c0)`,
                  border: "none",
                  borderRadius: "50%",
                  width: "46px", height: "46px",
                  fontSize: "24px",
                  color: "#fff",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: `0 4px 16px ${accentColor}44`,
                }}
              >＋</button>
            </div>
            <div style={{ position: "relative" }}>
              <span style={{
                position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)",
                fontSize: "14px", color: "#555",
              }}>🔍</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="検索..."
                style={{
                  width: "100%",
                  background: "#1a1a28",
                  border: "1px solid #2a2a3a",
                  borderRadius: "10px",
                  padding: "9px 12px 9px 34px",
                  color: "#ddd",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>
          <div style={{ padding: "4px 20px 100px" }}>
            {filtered.length === 0 ? (
              <div style={{
                textAlign: "center", color: "#444", marginTop: "60px",
                fontSize: "14px", lineHeight: 2,
              }}>
                <div style={{ fontSize: "40px", marginBottom: "12px" }}>📄</div>
                {search ? "該当するメモがありません" : "メモがまだありません\n＋ボタンで追加しましょう"}
              </div>
            ) : filtered.map(n => (
              <NoteCard key={n.id} note={n} onOpen={openEdit} onDelete={deleteNote} />
            ))}
          </div>
        </div>
      )}

      {(view === "edit" || view === "new") && (
        <div style={{
          position: "fixed", inset: 0, background: "#0a0a14",
          zIndex: 100, display: "flex", flexDirection: "column",
          maxWidth: "430px", margin: "0 auto",
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "14px 16px",
            borderBottom: "1px solid #1e1e2e",
            background: "#0d0d1a",
          }}>
            <button
              onClick={() => setView("list")}
              style={{
                background: "none", border: "none",
                color: "#aaa", fontSize: "22px",
                cursor: "pointer", padding: "4px 8px 4px 0",
              }}
            >‹</button>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="タイトル（任意）"
              style={{
                flex: 1, background: "none", border: "none",
                color: "#f0f0f0", fontSize: "16px", fontWeight: 600,
                fontFamily: "'Noto Sans JP', sans-serif", outline: "none",
              }}
            />
            <button
              onClick={saveNote}
              style={{
                background: `linear-gradient(135deg, ${accentColor}, #0090c0)`,
                border: "none", borderRadius: "8px",
                padding: "8px 16px", color: "#fff",
                fontSize: "13px", fontWeight: 600,
                cursor: "pointer", fontFamily: "'Noto Sans JP', sans-serif",
              }}
            >保存</button>
          </div>
          <textarea
            ref={bodyRef}
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="ここにメモを入力..."
            style={{
              flex: 1, background: "#0a0a14", border: "none",
              color: "#ddd", fontSize: "15px", lineHeight: 1.8,
              padding: "18px 20px", resize: "none", outline: "none",
              fontFamily: "'Noto Sans JP', sans-serif", boxSizing: "border-box",
            }}
          />
          <div style={{
            padding: "8px 20px", fontSize: "11px", color: "#444",
            borderTop: "1px solid #1a1a28", background: "#0d0d1a", textAlign: "right",
          }}>
            {body.length} 文字
          </div>
        </div>
      )}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;600;700&display=swap');
        * { -webkit-tap-highlight-color: transparent; }
        textarea::placeholder, input::placeholder { color: #444; }
        body { margin: 0; }
      `}</style>
    </div>
  );
}
