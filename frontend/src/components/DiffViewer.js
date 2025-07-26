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
  added:   { background: "rgba(0,255,255,0.15)", color: "#00ffff" }, // cyan
  removed: { background: "rgba(255,0,60,0.15)", color: "#ff3c3c" },  // red
  unchanged: { background: "transparent", color: "#eee" },
  hunk_header: { background: "rgba(0,0,0,0.2)", color: "#888", fontStyle: "italic" },
  info: { background: "rgba(0,0,0,0.1)", color: "#888" },
};

export default function DiffViewer({ visualDiff }) {
  if (!visualDiff || !visualDiff.length) return <div style={{color:'#888'}}>No differences found.</div>;

  return (
    <div style={{ background: "#181c1f", borderRadius: 8, padding: 12, minHeight: 100 }}>
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