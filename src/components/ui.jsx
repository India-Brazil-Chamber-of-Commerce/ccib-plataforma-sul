import React from "react";
import { Trash2, ChevronDown, DownloadCloud, ImagePlus } from "lucide-react";
import { labelStyle } from "../styles";

export function Field({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 120 }}>
      <span style={labelStyle}>{label}</span>
      {children}
    </div>
  );
}

export function EventPhotoBox({ imgUrl, alt }) {
  const [failed, setFailed] = React.useState(false);
  if (imgUrl && !failed) {
    return (
      <img
        src={imgUrl}
        alt={alt || "Foto do evento"}
        style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }}
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <div
      style={{
        width: "100%",
        height: 100,
        background: "#FAFBFC",
        borderBottom: "1px solid #E3E6EC",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        color: "#C7CCD6",
      }}
    >
      <ImagePlus size={22} />
      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: "0.04em" }}>
        {imgUrl ? "Não foi possível carregar a foto" : "Sem foto ainda"}
      </span>
    </div>
  );
}

export function ChakraIcon({ size = 18, color = "#0E7C3A" }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" style={{ width: size, height: size, flexShrink: 0, color }}>
      <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="6" />
      <circle cx="50" cy="50" r="6" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="5">
        <line x1="50" y1="8" x2="50" y2="92" />
        <line x1="8" y1="50" x2="92" y2="50" />
        <line x1="17" y1="17" x2="83" y2="83" />
        <line x1="83" y1="17" x2="17" y2="83" />
      </g>
    </svg>
  );
}

export function SectionTitle({ children, size = 15 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
      <ChakraIcon size={size + 3} />
      <h3 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: size, margin: 0, color: "#566175" }}>
        {children}
      </h3>
    </div>
  );
}

export function StatCard({ label, value, accent }) {
  return (
    <div style={{ flex: "1 1 140px", padding: "4px 0" }}>
      <div
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 10,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "#8992A6",
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "'Fraunces', serif",
          fontWeight: 500,
          fontSize: 30,
          color: accent || "#1B2438",
        }}
      >
        {value}
      </div>
    </div>
  );
}

export function CardShell({ isOpen, onToggleOpen, onDelete, title, subtitle, statusControl, children }) {
  return (
    <div
      className="ccib-card ccib-fade-in"
      style={{
        background: "#FFFFFF",
        border: "1px solid #E3E6EC",
        borderRadius: 8,
        padding: "10px 12px",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <div onClick={onToggleOpen} style={{ flex: 1, minWidth: 0, cursor: "pointer" }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: "#1B2438", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {title || "(sem nome)"}
          </div>
          {subtitle && (
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#8992A6", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {subtitle}
            </div>
          )}
        </div>
        <button onClick={onToggleOpen} className="ccib-icon-btn-neutral" style={{ background: "transparent", border: "none", borderRadius: 5, color: "#8992A6", cursor: "pointer", padding: 4, flexShrink: 0 }}>
          <ChevronDown size={14} style={{ transition: "transform 0.15s ease", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
        </button>
        <button onClick={onDelete} title="Remover" className="ccib-icon-btn" style={{ background: "transparent", border: "none", borderRadius: 5, color: "#8992A6", cursor: "pointer", padding: 4, flexShrink: 0 }}>
          <Trash2 size={13} />
        </button>
      </div>
      {statusControl && <div style={{ marginTop: 8 }}>{statusControl}</div>}
      {isOpen && <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 10 }} className="ccib-fade-in">{children}</div>}
    </div>
  );
}

export function HubspotSyncBar({ busy, onPull, pullKey, pullLabel, message, error }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <button
          onClick={onPull}
          disabled={!!busy}
          className="ccib-btn"
          style={{
            display: "flex", alignItems: "center", gap: 7,
            background: "transparent", color: "#FF7A59", border: "1px solid #FF7A59",
            borderRadius: 7, padding: "8px 16px", fontWeight: 500, fontSize: 13,
            cursor: busy ? "default" : "pointer", opacity: busy ? 0.6 : 1,
          }}
        >
          <DownloadCloud size={14} className={busy === pullKey ? "animate-spin" : ""} />
          {busy === pullKey ? "Puxando…" : (pullLabel || "Puxar do HubSpot")}
        </button>
      </div>
      <div style={{ marginTop: 6, fontSize: 11, color: "#B7BEC9" }}>
        Usa a conta HubSpot conectada a quem estiver logado e clicar aqui.
      </div>
      {message && <div style={{ marginTop: 8, fontSize: 12, color: "#0E7C3A" }}>{message}</div>}
      {error && <div style={{ marginTop: 8, fontSize: 12, color: "#C1502E" }}>{error}</div>}
    </div>
  );
}
