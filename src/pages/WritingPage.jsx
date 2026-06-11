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
    if (window.location.hash) {
      history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search
      );
    }
  }, []);

  return (
    <>
      <GridOverlay />
      <div style={{ position: "relative", zIndex: 1 }}>
        <TopNav variant="writing" />
        <Masthead count={ENTRIES.length} />
        <FilterBar active={filter} onChange={setFilter} counts={counts} />

        <section style={{ padding: "0 var(--pad-x) 60px" }}>
          <div className="wrap">
            {featured && (
              <Reveal>
                <FeaturedEntry entry={featured} onOpen={handleOpen} />
              </Reveal>
            )}
            <div style={{ marginTop: 36 }}>
              <div
                className="entry-head-row"
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "80px minmax(0,1fr) minmax(0,1.2fr) 140px 60px",
                  gap: 28,
                  padding: "12px 20px",
                  borderBottom: "1px solid var(--line-2)",
                }}
              >
                {["№", "Title", "Description", "Tags", "Read"].map((h, i) => (
                  <span
                    key={i}
                    className="t-label"
                    style={{
                      fontSize: 9.5,
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
            padding: "80px var(--pad-x)",
            borderTop: "1px solid var(--line)",
            background: "var(--paper-1)",
          }}
        >
          <div
            className="grid-2"
            style={{
              maxWidth: 1480,
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
                className="t-display"
                style={{
                  margin: "18px 0 0",
                  fontSize: "clamp(26px, 3.2vw, 42px)",
                  maxWidth: 820,
                }}
              >
                Roughly one piece a month,{" "}
                <span className="serif" style={{ color: "var(--accent)" }}>
                  written between deployments.
                </span>
              </h3>
            </div>
            <Link to="/#contact" className="btn btn--primary">
              <span>Subscribe / Get in touch</span>
              <span className="btn-arrow">→</span>
            </Link>
          </div>
        </section>

        <Footer variant="writing" />
      </div>

      <ReadingOverlay key={open?.id || "closed"} entry={open} onClose={handleClose} />
    </>
  );
}

function Masthead({ count }) {
  return (
    <section style={{ padding: "160px var(--pad-x) 60px", position: "relative" }}>
      <div className="wrap">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 28,
          }}
        >
          <span style={{ width: 30, height: 1, background: "var(--accent)" }} />
          <MonoLabel>Writing · field notes · lab</MonoLabel>
        </div>
        <h1 style={{ margin: 0, maxWidth: 1280, fontSize: "clamp(44px, 7vw, 116px)" }}>
          <span className="hero-line t-display">
            <span>Notes from</span>
          </span>
          <span
            className="hero-line t-serif"
            style={{
              color: "var(--accent)",
              lineHeight: 1.04,
            }}
          >
            <span>the shop floor.</span>
          </span>
        </h1>
        <div
          className="grid-2"
          style={{
            marginTop: 40,
            display: "grid",
            gridTemplateColumns: "minmax(0,1.1fr) minmax(0,0.9fr)",
            gap: 56,
            alignItems: "end",
          }}
        >
          <p
            className="t-body"
            style={{
              margin: 0,
              fontSize: 17.5,
              maxWidth: 620,
              animation: "fadeUp .9s var(--ease) .15s both",
            }}
          >
            Essays, field notes, and lab entries from shipping production AI —
            computer vision on live automotive lines, multimodal voice copilots
            in plants, and full-stack ops software. Written between
            deployments.
          </p>
          <div
            style={{
              display: "flex",
              gap: 32,
              alignItems: "flex-end",
              justifyContent: "flex-end",
              flexWrap: "wrap",
            }}
          >
            {[
              ["Entries", String(count).padStart(2, "0")],
              ["Updated", "monthly"],
              ["Reading", "free"],
            ].map(([k, v]) => (
              <div key={k} style={{ textAlign: "right" }}>
                <div className="t-label" style={{ fontSize: 9.5 }}>
                  {k}
                </div>
                <div
                  style={{
                    marginTop: 6,
                    fontFamily: "var(--font-mono)",
                    fontSize: 14,
                    color: "var(--ink)",
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
        padding: "0 var(--pad-x)",
        margin: "20px 0 36px",
        borderTop: "1px solid var(--line)",
        borderBottom: "1px solid var(--line)",
      }}
    >
      <div
        className="wrap"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
          padding: "16px 0",
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
                className={`filter-pill ${isOn ? "on" : ""}`}
              >
                {f.label}
                <em
                  style={{
                    fontStyle: "normal",
                    color: isOn ? undefined : "var(--ink-3)",
                  }}
                >
                  {String(c).padStart(2, "0")}
                </em>
              </button>
            );
          })}
        </div>
        <div className="filter-bar-meta t-label">Sorted · newest first</div>
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
        background: "var(--paper-1)",
        border: "1px solid var(--line-2)",
        width: "100%",
        padding: 0,
      }}
    >
      <div
        style={{
          padding: "36px 40px 40px",
          borderRight: "1px solid var(--line)",
        }}
      >
        <div
          style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}
        >
          <span className="stamp stamp--accent">
            Featured · {KIND_META[entry.kind].tag}
          </span>
          <span className="t-label" style={{ letterSpacing: "0.1em" }}>
            {entry.date} · {entry.read}
          </span>
        </div>
        <h2
          className="t-display"
          style={{
            margin: "26px 0 18px",
            fontSize: "clamp(30px, 3.6vw, 52px)",
          }}
        >
          {linkifyTwyn(entry.title)}
        </h2>
        <p
          className="t-body"
          style={{ margin: 0, fontSize: 16.5, maxWidth: 600 }}
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
            <span key={t} className="stamp" style={{ fontSize: 9.5 }}>
              {t}
            </span>
          ))}
        </div>
      </div>
      <div
        className="feat-card-side"
        style={{
          padding: "36px 32px 40px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "var(--paper-2)",
          borderLeft: "1px solid var(--line)",
        }}
      >
        <div>
          <MonoLabel>From the piece</MonoLabel>
          <p
            className="t-serif"
            style={{
              marginTop: 18,
              marginBottom: 0,
              fontSize: 28,
              lineHeight: 1.25,
              color: "var(--ink)",
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
          <span className="t-label" style={{ letterSpacing: "0.12em" }}>
            Est. read · {entry.read}
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
        padding: "26px 20px",
        borderBottom: "1px solid var(--line)",
        width: "100%",
        background: "transparent",
        alignItems: "start",
      }}
    >
      <div className="entry-row-numcol">
        <span
          className="entry-row-num"
          style={{
            fontFamily: "var(--font-display)",
            fontStretch: "116%",
            fontWeight: 720,
            fontSize: 30,
            lineHeight: 1,
            color: "transparent",
            WebkitTextStroke: "1px var(--line-3)",
          }}
        >
          {String(index).padStart(2, "0")}
        </span>
      </div>
      <div>
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            marginBottom: 10,
            flexWrap: "wrap",
          }}
        >
          <span className="stamp" style={{ fontSize: 9.5 }}>
            {KIND_META[entry.kind].tag}
          </span>
          <span className="t-label" style={{ letterSpacing: "0.08em" }}>
            {entry.date}
          </span>
        </div>
        <h3
          style={{
            margin: 0,
            fontFamily: "var(--font-display)",
            fontStretch: "112%",
            fontWeight: 660,
            textTransform: "uppercase",
            fontSize: 22,
            letterSpacing: "-0.005em",
            lineHeight: 1.12,
            color: "var(--ink)",
            textWrap: "balance",
          }}
        >
          {linkifyTwyn(entry.title)}
        </h3>
      </div>
      <p
        className="entry-row-desc t-body"
        style={{ margin: 0, fontSize: 14.5, paddingTop: 2 }}
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
            className="t-label"
            style={{ letterSpacing: "0.06em", textTransform: "none" }}
          >
            · {t}
          </span>
        ))}
      </div>
      <div
        className="t-label"
        style={{ textAlign: "right", paddingTop: 4, letterSpacing: "0.08em" }}
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
      className="overlay-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        onScroll={onScroll}
        onClick={(e) => e.stopPropagation()}
        className="reading-overlay overlay-panel"
        style={{
          width: "min(960px, 96vw)",
          height: "94vh",
          marginTop: "3vh",
        }}
      >
        <div className="overlay-head">
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
              <span style={{ width: 8, height: 8, background: "var(--accent)" }} />
              <span
                className="t-label"
                style={{
                  letterSpacing: "0.12em",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {KIND_META[entry.kind].tag} · {entry.date} · {entry.read}
              </span>
            </div>
            <button onClick={onClose} className="stamp">
              CLOSE <span style={{ color: "var(--accent)" }}>ESC</span>
            </button>
          </div>
          <div style={{ height: 2, background: "var(--line)" }}>
            <div
              style={{
                width: `${progress * 100}%`,
                height: 2,
                background: "var(--accent)",
                transition: "width .08s linear",
              }}
            />
          </div>
        </div>

        <article
          style={{
            padding: "56px clamp(28px, 7vw, 96px) 96px",
            maxWidth: 820,
            margin: "0 auto",
          }}
        >
          <MonoLabel>{KIND_META[entry.kind].label}</MonoLabel>
          <h1
            className="t-display"
            style={{
              margin: "22px 0 18px",
              fontSize: "clamp(30px, 4.4vw, 52px)",
            }}
          >
            {linkifyTwyn(entry.title)}
          </h1>
          <p
            className="t-body"
            style={{ margin: 0, fontSize: 17.5 }}
          >
            {linkifyTwyn(entry.dek)}
          </p>

          <div
            style={{
              marginTop: 32,
              paddingTop: 20,
              paddingBottom: 20,
              borderTop: "1px solid var(--line)",
              borderBottom: "1px solid var(--line)",
              display: "flex",
              gap: 24,
              color: "var(--ink-3)",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              flexWrap: "wrap",
            }}
          >
            <span>By · Gautam Girdhar</span>
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
              borderTop: "1px solid var(--line)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div className="t-label">End · {entry.id}</div>
            <button onClick={onClose} className="btn">
              <span>← Back to Writing</span>
            </button>
          </div>
        </article>
      </div>
    </div>
  );
}
