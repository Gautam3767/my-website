import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import GridOverlay from "../components/GridOverlay.jsx";
import TopNav from "../components/TopNav.jsx";
import MonoLabel from "../components/MonoLabel.jsx";
import Footer from "../components/Footer.jsx";
import Reveal from "../components/Reveal.jsx";
import RichText from "../components/RichText.jsx";
import linkifyTwyn from "../utils/linkifyTwyn.jsx";
import { loadPosts, KIND_META, FILTERS } from "../data/loaders.js";

const ENTRIES = loadPosts();

export default function WritingPage() {
  const [filter, setFilter] = useState("all");
  const [openId, setOpenId] = useState(null);

  // open from URL hash
  useEffect(() => {
    const fromHash = () => {
      const h = window.location.hash.replace("#", "");
      if (h && ENTRIES.find((e) => e.id === h)) setOpenId(h);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  const counts = useMemo(() => {
    const c = { all: ENTRIES.length };
    ENTRIES.forEach((e) => {
      c[e.kind] = (c[e.kind] || 0) + 1;
    });
    return c;
  }, []);

  const filtered = useMemo(
    () =>
      filter === "all" ? ENTRIES : ENTRIES.filter((e) => e.kind === filter),
    [filter]
  );

  const featured = useMemo(
    () => filtered.find((e) => e.featured) || filtered[0],
    [filtered]
  );
  const rest = useMemo(
    () => filtered.filter((e) => e.id !== featured?.id),
    [filtered, featured]
  );

  const open = useMemo(
    () => ENTRIES.find((e) => e.id === openId) || null,
    [openId]
  );

  const handleOpen = useCallback((id) => setOpenId(id), []);
  const handleClose = useCallback(() => {
    setOpenId(null);
    // clear the hash so re-opening works
    if (window.location.hash) {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }, []);

  return (
    <>
      <GridOverlay />
      <div style={{ position: "relative", zIndex: 1 }}>
        <TopNav variant="writing" />
        <Masthead count={ENTRIES.length} />
        <FilterBar active={filter} onChange={setFilter} counts={counts} />

        <section style={{ padding: "0 clamp(24px, 6vw, 96px) 60px" }}>
          <div style={{ maxWidth: 1440, margin: "0 auto" }}>
            {featured && (
              <Reveal>
                <FeaturedEntry entry={featured} onOpen={handleOpen} />
              </Reveal>
            )}
            <div
              style={{
                marginTop: 28,
                border: "1px solid var(--border)",
                borderBottom: 0,
              }}
            >
              <div
                className="entry-row"
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "80px minmax(0,1fr) minmax(0,1.2fr) 140px 60px",
                  gap: 28,
                  padding: "14px 24px",
                  background: "var(--bg-2)",
                  borderBottom: "1px solid var(--border)",
                  pointerEvents: "none",
                }}
              >
                {["№", "Title", "Description", "Tags", "Read"].map((h, i) => (
                  <span
                    key={i}
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10.5,
                      color: "var(--text-3)",
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      textAlign: i === 4 ? "right" : "left",
                    }}
                  >
                    {h}
                  </span>
                ))}
              </div>
              {rest.map((e, idx) => (
                <Reveal key={e.id} delay={idx * 40}>
                  <EntryRow entry={e} index={idx + 2} onOpen={handleOpen} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section
          style={{
            padding: "80px clamp(24px, 6vw, 96px)",
            borderTop: "1px solid var(--border)",
            background: "var(--bg-1)",
          }}
        >
          <div
            className="grid-2"
            style={{
              maxWidth: 1440,
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: 36,
              alignItems: "center",
            }}
          >
            <div>
              <MonoLabel>Subscribe</MonoLabel>
              <h3
                style={{
                  margin: "16px 0 0",
                  fontSize: "clamp(28px, 3.4vw, 44px)",
                  fontWeight: 500,
                  letterSpacing: "-0.025em",
                  lineHeight: 1.1,
                  textWrap: "balance",
                  maxWidth: 760,
                }}
              >
                Roughly one piece a month, written between deployments.
              </h3>
            </div>
            <Link
              to="/#contact"
              className="cta-btn"
              style={{
                padding: "14px 22px",
                border: "1px solid var(--accent-line)",
                background: "var(--accent-soft)",
                color: "var(--text)",
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                borderRadius: 3,
                display: "inline-flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              Subscribe / Get in touch
              <span style={{ color: "var(--accent)" }}>→</span>
            </Link>
          </div>
        </section>

        <Footer variant="writing" />
      </div>

      <ReadingOverlay entry={open} onClose={handleClose} />
    </>
  );
}

function Masthead({ count }) {
  return (
    <section
      style={{
        padding: "160px clamp(24px, 6vw, 96px) 60px",
        position: "relative",
      }}
    >
      <div style={{ maxWidth: 1440, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 28,
          }}
        >
          <span
            style={{ width: 28, height: 1, background: "var(--accent)" }}
          />
          <MonoLabel>Writing · field notes · lab</MonoLabel>
        </div>
        <h1
          style={{
            margin: 0,
            maxWidth: 1280,
            fontFamily: "var(--font-sans)",
            fontWeight: 500,
            fontSize: "clamp(48px, 7vw, 116px)",
            lineHeight: 0.96,
            letterSpacing: "-0.05em",
            textWrap: "balance",
            animation: "fadeUp .8s cubic-bezier(0.2,0.7,0.3,1) both",
          }}
        >
          Notes from the <span style={{ color: "var(--accent)" }}>shop floor</span>.
        </h1>
        <div
          className="grid-2"
          style={{
            marginTop: 36,
            display: "grid",
            gridTemplateColumns: "minmax(0,1.1fr) minmax(0,0.9fr)",
            gap: 56,
            alignItems: "end",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "var(--text-2)",
              fontSize: 18,
              lineHeight: 1.6,
              maxWidth: 620,
              textWrap: "pretty",
              animation: "fadeUp .9s cubic-bezier(0.2,0.7,0.3,1) .1s both",
            }}
          >
            Essays, field notes, and lab entries from shipping production AI —
            computer vision on live automotive lines, multimodal voice
            copilots in plants, and full-stack ops software. Written between
            deployments.
          </p>
          <div
            style={{
              display: "flex",
              gap: 28,
              alignItems: "flex-end",
              justifyContent: "flex-end",
              flexWrap: "wrap",
            }}
          >
            {[
              ["Entries", String(count).padStart(2, "0")],
              ["Updated", "monthly"],
              ["RSS", "available"],
            ].map(([k, v]) => (
              <div key={k} style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
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
                    fontSize: 15,
                    color: "var(--text)",
                  }}
                >
                  {v}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FilterBar({ active, onChange, counts }) {
  return (
    <div
      style={{
        padding: "0 clamp(24px, 6vw, 96px)",
        margin: "20px 0 32px",
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div
        style={{
          maxWidth: 1440,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
          padding: "18px 0",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {FILTERS.map((f) => {
            const isOn = active === f.id;
            const c = counts[f.id] ?? 0;
            return (
              <button
                key={f.id}
                onClick={() => onChange(f.id)}
                style={{
                  padding: "8px 14px",
                  background: isOn ? "var(--accent-soft)" : "transparent",
                  border: isOn
                    ? "1px solid var(--accent-line)"
                    : "1px solid var(--border)",
                  color: isOn ? "var(--text)" : "var(--text-2)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11.5,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  borderRadius: 2,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  transition:
                    "background .2s ease, border-color .2s ease, color .2s ease",
                }}
              >
                {f.label}
                <span
                  style={{
                    color: isOn ? "var(--accent)" : "var(--text-3)",
                  }}
                >
                  {String(c).padStart(2, "0")}
                </span>
              </button>
            );
          })}
        </div>
        <div
          className="filter-bar-meta"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--text-3)",
            letterSpacing: "0.12em",
          }}
        >
          SORTED · NEWEST FIRST
        </div>
      </div>
    </div>
  );
}

function FeaturedEntry({ entry, onOpen }) {
  return (
    <button
      onClick={() => onOpen(entry.id)}
      className="feat-card"
      style={{
        textAlign: "left",
        display: "grid",
        gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr)",
        gap: 0,
        background: "var(--bg-1)",
        border: "1px solid var(--border)",
        width: "100%",
        padding: 0,
      }}
    >
      <div
        style={{
          padding: "36px 40px 40px",
          borderRight: "1px solid var(--border)",
        }}
      >
        <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
          <span
            style={{
              padding: "5px 10px",
              border: "1px solid var(--accent-line)",
              color: "var(--accent)",
              fontFamily: "var(--font-mono)",
              fontSize: 10.5,
              letterSpacing: "0.16em",
            }}
          >
            FEATURED · {KIND_META[entry.kind].tag}
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--text-3)",
              letterSpacing: "0.1em",
            }}
          >
            {entry.date} · {entry.read}
          </span>
        </div>
        <h2
          style={{
            margin: "24px 0 18px",
            fontSize: "clamp(34px, 4vw, 56px)",
            lineHeight: 1.04,
            letterSpacing: "-0.035em",
            fontWeight: 500,
            textWrap: "balance",
          }}
        >
          {linkifyTwyn(entry.title)}
        </h2>
        <p
          style={{
            margin: 0,
            color: "var(--text-2)",
            fontSize: 17,
            lineHeight: 1.55,
            maxWidth: 600,
            textWrap: "pretty",
          }}
        >
          {linkifyTwyn(entry.dek)}
        </p>
        <div
          style={{
            marginTop: 28,
            display: "flex",
            flexWrap: "wrap",
            gap: "6px 10px",
          }}
        >
          {entry.tags.map((t) => (
            <span
              key={t}
              style={{
                padding: "4px 10px",
                border: "1px solid var(--border)",
                fontFamily: "var(--font-mono)",
                fontSize: 10.5,
                color: "var(--text-2)",
                letterSpacing: "0.06em",
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
      <div
        style={{
          padding: "36px 32px 40px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "var(--bg-2)",
        }}
      >
        <div>
          <MonoLabel>From the piece</MonoLabel>
          <p
            style={{
              marginTop: 18,
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: 26,
              lineHeight: 1.25,
              color: "var(--text)",
              letterSpacing: "-0.005em",
              textWrap: "balance",
            }}
          >
            “Six weeks isn’t a build budget. It’s a discipline.”
          </p>
        </div>
        <div
          style={{
            marginTop: 28,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--text-3)",
              letterSpacing: "0.12em",
            }}
          >
            EST. READ · {entry.read.toUpperCase()}
          </span>
          <span
            style={{
              color: "var(--accent)",
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              letterSpacing: "0.16em",
            }}
          >
            READ →
          </span>
        </div>
      </div>
    </button>
  );
}

function EntryRow({ entry, index, onOpen }) {
  return (
    <button
      onClick={() => onOpen(entry.id)}
      className="entry-row"
      style={{
        textAlign: "left",
        display: "grid",
        gridTemplateColumns: "80px minmax(0,1fr) minmax(0,1.2fr) 140px 60px",
        gap: 28,
        padding: "28px 24px",
        borderTop: "1px solid var(--border)",
        width: "100%",
        background: "transparent",
        alignItems: "start",
      }}
    >
      <div
        className="entry-row-num"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: "var(--text-3)",
          letterSpacing: "0.14em",
          paddingTop: 4,
        }}
      >
        {String(index).padStart(2, "0")}
      </div>
      <div>
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <span
            style={{
              padding: "3px 8px",
              border: "1px solid var(--border-2)",
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--text-2)",
              letterSpacing: "0.16em",
            }}
          >
            {KIND_META[entry.kind].tag}
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--text-3)",
              letterSpacing: "0.08em",
            }}
          >
            {entry.date}
          </span>
        </div>
        <h3
          style={{
            margin: 0,
            fontSize: 24,
            fontWeight: 500,
            letterSpacing: "-0.025em",
            lineHeight: 1.12,
            color: "var(--text)",
            textWrap: "balance",
          }}
        >
          {linkifyTwyn(entry.title)}
        </h3>
      </div>
      <p
        className="entry-row-desc"
        style={{
          margin: 0,
          color: "var(--text-2)",
          fontSize: 15,
          lineHeight: 1.55,
          paddingTop: 2,
          textWrap: "pretty",
        }}
      >
        {linkifyTwyn(entry.dek)}
      </p>
      <div
        className="entry-row-tags"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "6px 8px",
          paddingTop: 2,
        }}
      >
        {entry.tags.slice(0, 2).map((t) => (
          <span
            key={t}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10.5,
              color: "var(--text-3)",
              letterSpacing: "0.06em",
            }}
          >
            · {t}
          </span>
        ))}
      </div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: "var(--text-3)",
          letterSpacing: "0.1em",
          textAlign: "right",
          paddingTop: 4,
        }}
      >
        {entry.read}
      </div>
    </button>
  );
}

function ReadingOverlay({ entry, onClose }) {
  const ref = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!entry) return;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    if (ref.current) ref.current.scrollTop = 0;
    setProgress(0);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [entry, onClose]);

  if (!entry) return null;

  const onScroll = (e) => {
    const el = e.currentTarget;
    const max = el.scrollHeight - el.clientHeight;
    setProgress(max <= 0 ? 0 : Math.max(0, Math.min(1, el.scrollTop / max)));
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        background: "rgba(5,6,8,0.92)",
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
        onScroll={onScroll}
        onClick={(e) => e.stopPropagation()}
        className="reading-overlay"
        style={{
          width: "min(960px, 96vw)",
          height: "94vh",
          marginTop: "3vh",
          background: "var(--bg-1)",
          border: "1px solid var(--border-2)",
          overflow: "auto",
          boxShadow: "0 40px 120px rgba(0,0,0,0.55)",
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
          }}
        >
          <div
            style={{
              padding: "14px 32px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                minWidth: 0,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  background: "var(--accent)",
                  borderRadius: 1,
                  boxShadow: "0 0 10px var(--accent)",
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--text-3)",
                  letterSpacing: "0.12em",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {KIND_META[entry.kind].tag} · {entry.date} · {entry.read}
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
          <div style={{ height: 1, background: "var(--border)" }}>
            <div
              style={{
                width: `${progress * 100}%`,
                height: 1,
                background: "var(--accent)",
                transition: "width .08s linear",
              }}
            />
          </div>
        </div>

        <article
          style={{
            padding: "56px clamp(28px, 7vw, 96px) 96px",
            maxWidth: 800,
            margin: "0 auto",
          }}
        >
          <MonoLabel>{KIND_META[entry.kind].label}</MonoLabel>
          <h1
            style={{
              margin: "20px 0 18px",
              fontSize: "clamp(34px, 4.6vw, 56px)",
              fontWeight: 500,
              letterSpacing: "-0.035em",
              lineHeight: 1.04,
              textWrap: "balance",
            }}
          >
            {linkifyTwyn(entry.title)}
          </h1>
          <p
            style={{
              margin: 0,
              color: "var(--text-2)",
              fontSize: 18,
              lineHeight: 1.55,
              textWrap: "pretty",
            }}
          >
            {linkifyTwyn(entry.dek)}
          </p>

          <div
            style={{
              marginTop: 32,
              paddingTop: 22,
              paddingBottom: 22,
              borderTop: "1px solid var(--border)",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              gap: 28,
              color: "var(--text-3)",
              fontFamily: "var(--font-mono)",
              fontSize: 11.5,
              letterSpacing: "0.06em",
              flexWrap: "wrap",
            }}
          >
            <span>BY · GAUTAM GIRDHAR</span>
            <span>·</span>
            <span>{entry.date}</span>
            <span>·</span>
            <span>{entry.read}</span>
            <span style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
              {entry.tags.map((t) => (
                <span key={t}>#{t.replace(/\s+/g, "")}</span>
              ))}
            </span>
          </div>

          <div style={{ marginTop: 36 }}>
            <RichText content={entry.body} />
          </div>

          <div
            style={{
              marginTop: 64,
              paddingTop: 28,
              borderTop: "1px solid var(--border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--text-3)",
                letterSpacing: "0.14em",
              }}
            >
              END · {entry.id.toUpperCase()}
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
              ← Back to Writing
            </button>
          </div>
        </article>
      </div>
    </div>
  );
}
