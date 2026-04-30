import React from "react";

const lineStyle = {
  fontFamily: "JetBrains Mono, Consolas, monospace",
  fontSize: "1rem",
  padding: "2px 8px",
  whiteSpace: "pre",
  borderRadius: "4px",
  margin: "1px 0",
  transition: "background 0.2s",
};

const typeStyles = {
  added: { background: "rgba(74, 222, 128, 0.12)", color: "#86efac" },
  removed: { background: "rgba(248, 113, 113, 0.12)", color: "#fca5a5" },
  unchanged: { background: "transparent", color: "#fde68a" },
  hunk_header: { background: "rgba(250, 204, 21, 0.08)", color: "#a89446", fontStyle: "italic" },
  info: { background: "rgba(250, 204, 21, 0.06)", color: "#a89446" },
};

export default function DiffViewer({ visualDiff }) {
  if (!visualDiff || !visualDiff.length) return <div style={{color:'#a89446'}}>No differences found.</div>;

  return (
    <div style={{ background: "#101010", border: "1px solid #2a2a2a", borderRadius: 12, padding: 14, minHeight: 100 }}>
      {visualDiff.map((item, idx) => (
        <div
          key={idx}
          style={{
            ...lineStyle,
            ...typeStyles[item.type] || {},
            textDecoration: item.type === "removed" ? "line-through" : "none",
          }}
        >
          {item.type === "added" && <span style={{ marginRight: 6 }}>+</span>}
          {item.type === "removed" && <span style={{ marginRight: 6 }}>-</span>}
          {item.type === "hunk_header" && <span>...</span>}
          {item.content}
        </div>
      ))}
    </div>
  );
}
