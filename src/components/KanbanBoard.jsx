import React from "react";
import { Plus } from "lucide-react";

export function KanbanBoard({ columns, items, getStatus, renderCard, onAddToColumn, addLabel }) {
  return (
    <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 12 }}>
      {columns.map((col) => {
        const colItems = items.filter((it) => getStatus(it) === col.key);
        return (
          <div
            key={col.key}
            style={{
              flex: "0 0 280px",
              width: 280,
              background: "#FAFBFC",
              border: "1px solid #E3E6EC",
              borderRadius: 10,
              padding: 12,
              display: "flex",
              flexDirection: "column",
              gap: 10,
              maxHeight: 560,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: col.color, display: "inline-block" }} />
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 600, color: "#1B2438", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                  {col.label}
                </span>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#8992A6" }}>
                  {colItems.length}
                </span>
              </div>
              <button
                onClick={() => onAddToColumn(col.key)}
                title={addLabel}
                className="ccib-icon-btn-neutral"
                style={{ background: "transparent", border: "none", borderRadius: 5, color: "#8992A6", cursor: "pointer", padding: 4, display: "flex" }}
              >
                <Plus size={15} />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, overflowY: "auto" }}>
              {colItems.length === 0 && (
                <div style={{ fontSize: 12, color: "#B7BEC9", padding: "8px 2px" }}>Nenhum item aqui.</div>
              )}
              {colItems.map((it) => renderCard(it, col))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
