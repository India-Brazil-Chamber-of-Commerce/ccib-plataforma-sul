import React from "react";
import { Plus, Trash2, Check } from "lucide-react";
import { filterInputStyle } from "../styles";

export default function RotinaTab({
  addRotinaTask,
  newRotinaText,
  removeRotinaTask,
  rotina,
  setNewRotinaText,
  toggleRotinaToday,
}) {
  return (
      <div>
        {(() => {
          const todayStr = new Date().toISOString().slice(0, 10);
          const total = rotina.tasks.length;
          const doneCount = rotina.tasks.filter((t) => rotina.completions[t.id] === todayStr).length;
          return (
            <>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 20 }}>
                <h3 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 18, margin: 0, color: "#1B2438" }}>
                  Rotina de hoje
                </h3>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: "#8992A6" }}>
                  {doneCount} de {total} feitas
                </span>
              </div>

              <div style={{ background: "#F6F7F9", borderRadius: 4, height: 6, overflow: "hidden", marginBottom: 24 }}>
                <div
                  style={{
                    width: total ? `${(doneCount / total) * 100}%` : "0%",
                    background: "#0E7C3A",
                    height: "100%",
                    transition: "width 0.2s ease",
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                {rotina.tasks.length === 0 && (
                  <div style={{ color: "#8992A6", fontSize: 13 }}>Nenhuma tarefa de rotina ainda. Adicione abaixo.</div>
                )}
                {rotina.tasks.map((t) => {
                  const isDone = rotina.completions[t.id] === todayStr;
                  return (
                    <div
                      key={t.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 12px",
                        background: "#FFFFFF",
                        border: `1px solid ${isDone ? "#0E7C3A" : "#E3E6EC"}`,
                        borderRadius: 8,
                      }}
                    >
                      <button
                        onClick={() => toggleRotinaToday(t.id)}
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 5,
                          border: `1.5px solid ${isDone ? "#0E7C3A" : "#C7CCD6"}`,
                          background: isDone ? "#0E7C3A" : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          flexShrink: 0,
                        }}
                      >
                        {isDone && <Check size={13} color="#FFFFFF" />}
                      </button>
                      <span
                        style={{
                          flex: 1,
                          fontSize: 14,
                          color: isDone ? "#8992A6" : "#1B2438",
                          textDecoration: isDone ? "line-through" : "none",
                        }}
                      >
                        {t.text}
                      </span>
                      <button
                        onClick={() => removeRotinaTask(t.id)}
                        title="Remover tarefa de rotina"
                        style={{ background: "transparent", border: "none", color: "#8992A6", cursor: "pointer", padding: 4, flexShrink: 0 }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <input
                  value={newRotinaText}
                  onChange={(e) => setNewRotinaText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addRotinaTask()}
                  placeholder="Nova tarefa de rotina..."
                  style={{ ...filterInputStyle, flex: 1 }}
                />
                <button
                  onClick={addRotinaTask}
                  className="ccib-btn ccib-btn-outline"
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    background: "transparent", color: "#0B2545", border: "1px solid #0B2545",
                    borderRadius: 7, padding: "8px 16px", fontWeight: 500, fontSize: 13, cursor: "pointer",
                  }}
                >
                  <Plus size={15} /> Adicionar
                </button>
              </div>

              <div style={{ marginTop: 24, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#B7BEC9" }}>
                As marcações reiniciam sozinhas todo dia — o que foi feito ontem não conta para hoje.
              </div>
            </>
          );
        })()}
      </div>
  );
}
