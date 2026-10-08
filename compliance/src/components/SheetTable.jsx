import React from "react";
import { Trash2, Pencil } from "lucide-react";
import { tagColor } from "../constants";

// Planilha editável: cada célula é um campo. As alterações são salvas automaticamente.
// columns: [{ key, label, type: "text" | "textarea" | "date" | "select" | "tag" | "link", options, placeholder, width, linkLabel }]
export default function SheetTable({
  title,
  columns,
  rows,
  onChange,
  newRow,
  addLabel = "+ Adicionar linha",
  filter,
  emptyText = "Nenhum registro ainda.",
  minWidth,
  headerExtra,
  readOnly = false,
}) {
  const visible = filter ? rows.filter(filter) : rows;

  const updateCell = (rowId, key, value) => {
    onChange(rows.map((r) => (r.id === rowId ? { ...r, [key]: value } : r)));
  };

  const removeRow = (row) => {
    const nome = row[columns[0].key] || row[columns[1]?.key] || "esta linha";
    if (!window.confirm(`Remover "${nome}"?`)) return;
    onChange(rows.filter((r) => r.id !== row.id));
  };

  return (
    <div className="card">
      {(title || headerExtra) && (
        <div className="card-head">
          {title && <div className="section-title">{title}</div>}
          {headerExtra}
        </div>
      )}
      <div className="table-wrap">
        <table className="sheet-table" style={minWidth ? { minWidth } : undefined}>
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key} style={c.width ? { width: c.width } : undefined}>{c.label}</th>
              ))}
              {!readOnly && <th className="actions" aria-label="Ações"></th>}
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr className="empty-row">
                <td colSpan={columns.length + 1}>{emptyText}</td>
              </tr>
            )}
            {visible.map((row) => (
              <tr key={row.id}>
                {columns.map((c) => (
                  <td key={c.key}>
                    <Cell column={c} value={row[c.key] ?? ""} onChange={(v) => updateCell(row.id, c.key, v)} readOnly={readOnly} />
                  </td>
                ))}
                {!readOnly && (
                  <td className="actions">
                    <button className="icon-btn" title="Remover" onClick={() => removeRow(row)}>
                      <Trash2 size={14} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!readOnly && newRow && (
        <button className="btn ghost add-row-btn" onClick={() => onChange([...rows, newRow()])}>
          {addLabel}
        </button>
      )}
    </div>
  );
}

function Cell({ column, value, onChange, readOnly }) {
  const { type = "text", options = [], placeholder = "—" } = column;

  if (readOnly) {
    if (type === "tag") return <span className={`tag ${tagColor(value)}`}>{value || "—"}</span>;
    return <span>{value || "—"}</span>;
  }

  if (type === "select" || type === "tag") {
    const opts = value && !options.includes(value) ? [value, ...options] : options;
    return (
      <select
        className={`cell-input${type === "tag" ? ` tag-select ${tagColor(value)}` : ""}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {!value && <option value="">—</option>}
        {opts.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    );
  }

  if (type === "link") {
    const editar = () => {
      const novo = window.prompt("Link do arquivo (SharePoint, Google Drive ou outro endereço):", value);
      if (novo !== null) onChange(novo.trim());
    };
    return (
      <div className="link-cell">
        {value ? (
          <a className="dl-link" href={value} target="_blank" rel="noopener noreferrer">
            {column.linkLabel || "Abrir"}
          </a>
        ) : (
          <span style={{ color: "var(--ink-400)", fontStyle: "italic" }}>sem arquivo</span>
        )}
        <button className="icon-btn neutral" title="Trocar link" onClick={editar}>
          <Pencil size={12} />
        </button>
      </div>
    );
  }

  if (type === "textarea") {
    return <textarea className="cell-input" rows={1} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />;
  }

  return (
    <input
      className="cell-input"
      type={type === "date" ? "date" : "text"}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
