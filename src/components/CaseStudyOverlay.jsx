import { useEffect, useRef } from "react";
import MonoLabel from "./MonoLabel.jsx";
import { SystemPreviewMotif } from "./Motifs.jsx";
import linkifyTwyn from "../utils/linkifyTwyn.jsx";

function ListBlock({ items, bullet = "—" }) {
  return (
    <ul
      style={{
        margin: 0,
        padding: 0,
        listStyle: "none",
        display: "grid",
        gap: 12,
      }}
    >
      {items.map((it, i) => (
        <li
          key={i}
          style={{
            display: "grid",
            gridTemplateColumns: "20px 1fr",
            gap: 10,
            color: "var(--ink-2)",
            fontSize: 15.5,
            lineHeight: 1.55,
          }}
        >
          <span
            style={{
              color: "var(--accent)",
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              paddingTop: 2,
            }}
          >
            {bullet}
          </span>
          <span>{linkifyTwyn(it)}</span>
        </li>
      ))}
    </ul>
  );
}

function ArchFlow({ items, color }) {
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {items.map((it, i) => (
        <div
          key={i}
          className="arch-row"
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            gap: 14,
            alignItems: "center",
            padding: "12px 14px",
            border: "1px solid var(--line-2)",
            background: "var(--paper-1)",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: color || "var(--accent)",
              letterSpacing: "0.12em",
              minWidth: 28,
            }}
          >
            {String(i + 1).padStart(2, "0")}
          </span>
          <span style={{ color: "var(--ink)", fontSize: 15 }}>
            {linkifyTwyn(it)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function CaseStudyOverlay({ system, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!system) return;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    if (ref.current) ref.current.scrollTop = 0;
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [system, onClose]);

  if (!system) return null;
  const s = system;

  const rows = [
    {
      k: "01",
      t: "Organisational Problem",
      c: (
        <p
          style={{
            margin: 0,
            color: "var(--ink-2)",
            fontSize: 16,
            lineHeight: 1.65,
            textWrap: "pretty",
          }}
        >
          {linkifyTwyn(s.problem)}
        </p>
      ),
    },
    { k: "02", t: "AI Opportunity", c: <ListBlock items={s.opportunity} /> },
    {
      k: "03",
      t: "System Architecture",
      c: <ArchFlow items={s.architecture} color={s.palette} />,
    },
    { k: "04", t: "Engineering Decisions", c: <ListBlock items={s.decisions} /> },
    { k: "05", t: "Product Experience", c: <ListBlock items={s.experience} /> },
    { k: "06", t: "Impact", c: <ListBlock items={s.impact} bullet="◆" /> },
    {
      k: "07",
      t: "Reflection",
      c: (
        <p
          className="t-serif"
          style={{
            margin: 0,
            color: "var(--ink)",
            fontSize: 21,
            lineHeight: 1.45,
          }}
        >
          “{linkifyTwyn(s.reflection)}”
        </p>
      ),
    },
  ];

  return (
    <div
      className="overlay-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        onClick={(e) => e.stopPropagation()}
        className="case-overlay overlay-panel"
        style={{
          width: "min(1180px, 96vw)",
          height: "92vh",
          marginTop: "4vh",
        }}
      >
        <div
          className="overlay-head"
          style={{
            padding: "16px 28px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ width: 9, height: 9, background: s.palette }} />
            <span
              className="t-label"
              style={{ letterSpacing: "0.14em", color: "var(--ink-2)" }}
            >
              Drawing / {s.id}
            </span>
          </div>
          <button onClick={onClose} className="stamp">
            CLOSE <span style={{ color: "var(--accent)" }}>ESC</span>
          </button>
        </div>

        <div
          style={{
            padding: "44px 44px 28px",
            borderBottom: "1px solid var(--line)",
          }}
        >
          <MonoLabel>System</MonoLabel>
          <h2
            className="t-display"
            style={{
              margin: "18px 0 12px",
              fontSize: "clamp(32px, 4.2vw, 58px)",
            }}
          >
            {s.name}
          </h2>
          <div
            className="t-body"
            style={{ fontSize: 16, maxWidth: 720 }}
          >
            {linkifyTwyn(s.short)}
          </div>

          <div
            className="grid-4"
            style={{
              marginTop: 32,
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 14,
              fontFamily: "var(--font-mono)",
            }}
          >
            {[
              ["Domain", s.domain],
              ["Role", s.role],
              ["Timeline", s.timeline],
              ["Type", s.type],
            ].map(([k, v]) => (
              <div
                key={k}
                style={{
                  borderTop: "1px solid var(--line-2)",
                  paddingTop: 12,
                }}
              >
                <div className="t-label" style={{ fontSize: 9.5 }}>
                  {k}
                </div>
                <div
                  style={{
                    marginTop: 6,
                    color: "var(--ink)",
                    fontSize: 12.5,
                    letterSpacing: "0.02em",
                  }}
                >
                  {linkifyTwyn(v)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            height: 280,
            borderBottom: "1px solid var(--line)",
            background: "var(--paper-2)",
            position: "relative",
            overflow: "hidden",
            cursor: "crosshair",
          }}
        >
          <SystemPreviewMotif kind={s.motif} color={s.palette} />
          <div className="plate-caption" style={{ left: 24, bottom: 18 }}>
            Fig · Abstracted system preview
          </div>
          <div
            className="plate-caption"
            style={{ right: 24, top: 16, color: s.palette }}
          >
            Client work — abstracted
          </div>
        </div>

        <div
          className="case-rows"
          style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 0 }}
        >
          {rows.map((row) => (
            <FragmentRow key={row.k} row={row} />
          ))}
        </div>

        <div
          style={{
            padding: "28px 44px 44px",
            borderTop: "1px solid var(--line)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <div className="t-label">End of drawing · {s.id}</div>
          <button onClick={onClose} className="btn">
            <span>← Back to Systems</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function FragmentRow({ row }) {
  return (
    <>
      <div
        className="case-row-label"
        style={{
          padding: "32px 24px 32px 44px",
          borderTop: "1px solid var(--line)",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--accent)",
            letterSpacing: "0.14em",
          }}
        >
          {row.k}
        </div>
        <div
          style={{
            marginTop: 10,
            fontFamily: "var(--font-display)",
            fontStretch: "112%",
            fontWeight: 640,
            textTransform: "uppercase",
            fontSize: 14.5,
            letterSpacing: "0.02em",
            color: "var(--ink)",
          }}
        >
          {row.t}
        </div>
      </div>
      <div
        className="case-row-content"
        style={{
          padding: "32px 44px 32px 24px",
          borderTop: "1px solid var(--line)",
        }}
      >
        {row.c}
      </div>
    </>
  );
}
