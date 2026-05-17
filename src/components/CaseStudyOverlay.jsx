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
            color: "var(--text-2)",
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
            border: "1px solid var(--border)",
            background: "var(--bg-2)",
            borderRadius: 2,
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
          <span style={{ color: "var(--text)", fontSize: 15 }}>
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
            color: "var(--text-2)",
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
          style={{
            margin: 0,
            color: "var(--text)",
            fontSize: 18,
            lineHeight: 1.55,
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            letterSpacing: "-0.005em",
          }}
        >
          “{linkifyTwyn(s.reflection)}”
        </p>
      ),
    },
  ];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        background: "rgba(5,6,8,0.86)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        justifyContent: "center",
        animation: "fadeIn .25s ease",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        onClick={(e) => e.stopPropagation()}
        className="case-overlay"
        style={{
          width: "min(1180px, 96vw)",
          height: "92vh",
          marginTop: "4vh",
          background: "var(--bg-1)",
          border: "1px solid var(--border-2)",
          overflow: "auto",
          boxShadow: "0 40px 120px rgba(0,0,0,0.5)",
          animation: "fadeUp .35s cubic-bezier(0.2,0.7,0.3,1)",
        }}
      >
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 2,
            background: "rgba(11,15,20,0.92)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            borderBottom: "1px solid var(--border)",
            padding: "16px 28px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span
              style={{
                width: 8,
                height: 8,
                background: s.palette,
                borderRadius: 1,
                boxShadow: `0 0 10px ${s.palette}`,
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11.5,
                color: "var(--text-3)",
                letterSpacing: "0.12em",
              }}
            >
              CASE STUDY / {s.id.toUpperCase()}
            </span>
          </div>
          <button
            onClick={onClose}
            className="ghost-btn"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--text-2)",
              letterSpacing: "0.12em",
              border: "1px solid var(--border-2)",
              padding: "8px 12px",
              borderRadius: 2,
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            CLOSE <span style={{ fontSize: 12 }}>ESC</span>
          </button>
        </div>

        <div
          style={{
            padding: "44px 44px 28px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <MonoLabel>System</MonoLabel>
          <h2
            style={{
              margin: "16px 0 8px",
              fontSize: "clamp(36px, 4.4vw, 64px)",
              fontWeight: 500,
              letterSpacing: "-0.035em",
              lineHeight: 1.02,
              textWrap: "balance",
            }}
          >
            {s.name}
          </h2>
          <div
            style={{
              color: "var(--text-2)",
              fontSize: 16,
              maxWidth: 720,
              textWrap: "pretty",
            }}
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
                style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}
              >
                <div
                  style={{
                    fontSize: 10.5,
                    color: "var(--text-3)",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                  }}
                >
                  {k}
                </div>
                <div
                  style={{
                    marginTop: 6,
                    color: "var(--text)",
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
            borderBottom: "1px solid var(--border)",
            background: "var(--bg-2)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <SystemPreviewMotif kind={s.motif} color={s.palette} />
          <div
            style={{
              position: "absolute",
              left: 24,
              bottom: 18,
              fontFamily: "var(--font-mono)",
              fontSize: 10.5,
              color: "var(--text-3)",
              letterSpacing: "0.16em",
            }}
          >
            FIG · ABSTRACTED SYSTEM PREVIEW
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "200px 1fr",
            gap: 0,
          }}
        >
          {rows.map((row) => (
            <FragmentRow key={row.k} row={row} />
          ))}
        </div>

        <div
          style={{
            padding: "28px 44px 44px",
            borderTop: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--text-3)",
              letterSpacing: "0.12em",
            }}
          >
            END · {s.id.toUpperCase()} / RETURN TO INDEX
          </div>
          <button
            onClick={onClose}
            className="cta-btn"
            style={{
              padding: "12px 18px",
              border: "1px solid var(--accent-line)",
              background: "var(--accent-soft)",
              color: "var(--text)",
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              borderRadius: 2,
            }}
          >
            ← Back to Systems
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
        style={{
          padding: "32px 24px 32px 44px",
          borderTop: "1px solid var(--border)",
          background: "var(--bg-1)",
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
            fontSize: 16,
            letterSpacing: "-0.01em",
            color: "var(--text)",
          }}
        >
          {row.t}
        </div>
      </div>
      <div
        style={{
          padding: "32px 44px 32px 24px",
          borderTop: "1px solid var(--border)",
        }}
      >
        {row.c}
      </div>
    </>
  );
}
