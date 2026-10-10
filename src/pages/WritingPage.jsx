import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import GridOverlay from "../components/GridOverlay.jsx";
import TopNav from "../components/TopNav.jsx";
import MonoLabel from "../components/MonoLabel.jsx";
import Footer from "../components/Footer.jsx";
import Reveal from "../components/Reveal.jsx";
import RichText from "../components/RichText.jsx";
import Dialog from "../components/Dialog.jsx";
import usePageMeta from "../hooks/usePageMeta.js";
import { useLastDefined } from "../hooks/useLastDefined.js";
import { supportsScrollTimeline } from "../hooks/useMedia.js";
import linkifyTwyn from "../utils/linkifyTwyn.jsx";
import { loadPosts, KIND_META, FILTERS, countLabel } from "../data/loaders.js";

const ENTRIES = loadPosts();
const LATEST = ENTRIES[0]?.date || "";
const AVG_READ = (() => {
  const mins = ENTRIES.map((e) => e.readMinutes).filter(Boolean);
  return mins.length ? Math.round(mins.reduce((a, b) => a + b, 0) / mins.length) : 0;
})();

const LIST_TITLE = "Notes from the shop floor — Gautam Girdhar";
const LIST_DESCRIPTION =
  "Essays, field notes, and lab entries from shipping production AI — computer vision on live lines, multimodal plant copilots, and full-stack ops software.";

export default function WritingPage() {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [filterTouched, setFilterTouched] = useState(false);

  // old links were /writing#slug — send them to the real URL
  useEffect(() => {
    const h = decodeURIComponent(location.hash.slice(1));
    if (!slug && h && ENTRIES.some((e) => e.id === h)) {
      navigate(`/writing/${h}`, { replace: true });
    }
  }, [location.hash, slug, navigate]);

  const open = slug ? ENTRIES.find((e) => e.id === slug) || null : null;
  const missing = !!slug && !open;
  const next = open ? ENTRIES[(ENTRIES.indexOf(open) + 1) % ENTRIES.length] : null;

  usePageMeta(
    open
      ? {
          title: `${open.title} — Gautam Girdhar`,
          description: open.dek || LIST_DESCRIPTION,
          path: `/writing/${open.id}`,
        }
      : {
          title: missing ? `Not found — ${LIST_TITLE}` : LIST_TITLE,
          description: LIST_DESCRIPTION,
          path: "/writing",
          noindex: missing,
        }
  );

  const counts = useMemo(() => {
    const c = { all: ENTRIES.length };
    ENTRIES.forEach((e) => {
      c[e.kind] = (c[e.kind] || 0) + 1;
    });
    return c;
  }, []);

  const filtered = useMemo(
    () => (filter === "all" ? ENTRIES : ENTRIES.filter((e) => e.kind === filter)),
    [filter]
  );
  // "Featured" only means something on the unfiltered list; a filtered
  // view leads with its newest entry and says so
  const pinned = filter === "all" ? filtered.find((e) => e.featured) : null;
  const lead = pinned || filtered[0] || null;
  const rest = filtered.filter((e) => e !== lead);

  // one close per open, however many times Close / Esc is pressed
  const closedFor = useRef(null);
  useEffect(() => {
    closedFor.current = null;
  }, [slug]);
  const close = () => {
    if (!open || closedFor.current === open.id) return;
    closedFor.current = open.id;
    if (location.state?.fromApp) navigate(-1);
    else navigate("/writing", { replace: true });
  };

  const changeFilter = (id) => {
    setFilter(id);
    setFilterTouched(true);
  };

  return (
    <>
      <GridOverlay />
      <div className="page">
        <TopNav variant="writing" />
        <main id="main" tabIndex={-1}>
          <Masthead />

          {missing && (
            <div className="wrap" style={{ padding: "0 var(--pad-x)" }}>
              <p className="empty-state t-body" role="status" style={{ marginBottom: 24 }}>
                That note isn’t in the set any more — here’s everything that is.
              </p>
            </div>
          )}

          <FilterBar active={filter} onChange={changeFilter} counts={counts} />
          <p className="sr-only" aria-live="polite">
            {filterTouched ? `${countLabel(filtered.length, "entry", "entries")} shown` : ""}
          </p>

          <section
            aria-label="Entries"
            style={{ padding: "0 var(--pad-x) 72px" }}
          >
            <div className="wrap">
              <div key={filter} className={filterTouched ? "fade-swap" : undefined}>
                {lead ? (
                  <Reveal immediate={filterTouched}>
                    <FeaturedEntry entry={lead} label={pinned ? "Featured" : "Latest"} />
                  </Reveal>
                ) : (
                  <p className="empty-state t-body">
                    Nothing filed under this yet.{" "}
                    <button
                      type="button"
                      className="text-link"
                      onClick={() => changeFilter("all")}
                    >
                      Show everything
                    </button>
                  </p>
                )}

                {rest.length > 0 && (
                  <div className="entry-list">
                    <div className="entry-grid entry-head-row" aria-hidden="true">
                      {["№", "Title", "Description", "Tags", "Read"].map((h, i) => (
                        <span
                          key={h}
                          className="t-label"
                          style={{ textAlign: i === 4 ? "right" : "left" }}
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                    <ol style={{ margin: 0, padding: 0, listStyle: "none" }}>
                      {rest.map((e, idx) => (
                        <Reveal as="li" key={e.id} immediate={filterTouched}>
                          <EntryRow entry={e} index={idx + 2} />
                        </Reveal>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </div>
          </section>

          <section
            aria-labelledby="follow-title"
            style={{
              padding: "80px var(--pad-x)",
              borderTop: "1px solid var(--line)",
              background: "var(--paper-1)",
            }}
          >
            <div
              className="wrap grid-2"
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1fr) auto",
                gap: 36,
                alignItems: "center",
              }}
            >
              <div>
                <MonoLabel>Follow along</MonoLabel>
                <h2
                  id="follow-title"
                  className="t-display"
                  style={{ margin: "18px 0 0", fontSize: "clamp(26px, 3.2vw, 42px)", maxWidth: 820 }}
                >
                  Roughly one piece a month,{" "}
                  <span className="serif accent">written between deployments.</span>
                </h2>
              </div>
              <div className="cta-row" style={{ marginTop: 0 }}>
                <a href="/rss.xml" className="btn">
                  <span>RSS feed</span>
                  <span className="btn-arrow accent-text" aria-hidden="true">
                    ↗
                  </span>
                </a>
                <Link to="/#contact" className="btn btn--primary">
                  <span>Get in touch</span>
                  <span className="btn-arrow" aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </section>
        </main>

        <Footer variant="writing" />
      </div>

      <ReadingDialog
        entry={open}
        next={next !== open ? next : null}
        fromApp={!!location.state?.fromApp}
        onClose={close}
      />
    </>
  );
}

function Masthead() {
  const stats = [
    ["Entries", String(ENTRIES.length).padStart(2, "0")],
    LATEST && ["Latest", LATEST],
    AVG_READ > 0 && ["Avg read", `${AVG_READ} min`],
  ].filter(Boolean);

  return (
    <section
      aria-labelledby="writing-title"
      style={{ padding: "calc(var(--nav-h) + 96px) var(--pad-x) 56px", position: "relative" }}
    >
      <div className="wrap">
        <div
          className="hero-fade hero-fade--still"
          style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}
        >
          <span aria-hidden="true" style={{ width: 30, height: 1, background: "var(--accent)" }} />
          <MonoLabel as="p">Writing · field notes · lab</MonoLabel>
        </div>
        <h1
          id="writing-title"
          style={{ margin: 0, maxWidth: 1280, fontSize: "clamp(42px, 7vw, 116px)" }}
        >
          <span className="hero-line t-display">
            <span>Notes from</span>
          </span>
          <span className="hero-line t-serif" style={{ color: "var(--accent)", lineHeight: 1.04 }}>
            <span>the shop floor.</span>
          </span>
        </h1>
        <div
          className="grid-2"
          style={{
            marginTop: 40,
            display: "grid",
            gridTemplateColumns: "minmax(0,1.1fr) minmax(0,0.9fr)",
            gap: "28px 56px",
            alignItems: "end",
          }}
        >
          <p
            className="t-body hero-fade"
            style={{ "--delay": "150ms", margin: 0, fontSize: 17.5, maxWidth: 620 }}
          >
            Essays, field notes, and lab entries from shipping production AI —
            computer vision on live automotive lines, multimodal voice copilots
            in plants, and full-stack ops software. Written between
            deployments.
          </p>
          <dl
            style={{
              margin: 0,
              display: "flex",
              gap: "16px 32px",
              alignItems: "flex-end",
              justifyContent: "flex-end",
              flexWrap: "wrap",
            }}
          >
            {stats.map(([k, v]) => (
              <div key={k} style={{ textAlign: "right" }}>
                <dt className="t-label">{k}</dt>
                <dd
                  style={{
                    margin: "6px 0 0",
                    fontFamily: "var(--font-mono)",
                    fontSize: 14,
                    color: "var(--ink)",
                  }}
                >
                  {v}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

function FilterBar({ active, onChange, counts }) {
  return (
    <div className="filter-bar">
      <div className="wrap filter-bar-inner">
        <div className="filter-group" role="group" aria-label="Filter by kind">
          {FILTERS.map((f) => {
            const c = counts[f.id] ?? 0;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => onChange(f.id)}
                className="filter-pill"
                aria-pressed={active === f.id}
              >
                {f.label}
                <em aria-label={`${c} ${c === 1 ? "entry" : "entries"}`}>
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

function FeaturedEntry({ entry, label }) {
  const quote = entry.pullQuote;
  return (
    <article className="feat-card">
      <div className="feat-card-main">
        <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
          <span className="stamp stamp--accent">
            {label} · {KIND_META[entry.kind].tag}
          </span>
          <span className="t-label" style={{ letterSpacing: "0.1em" }}>
            {[entry.date, entry.read].filter(Boolean).join(" · ")}
          </span>
        </div>
        <h2 className="t-title feat-card-title">
          <Link to={`/writing/${entry.id}`} state={{ fromApp: true }} className="stretched-link">
            {entry.title}
          </Link>
        </h2>
        {entry.dek && (
          <p className="t-body" style={{ margin: 0, fontSize: 16.5, maxWidth: 600 }}>
            {entry.dek}
          </p>
        )}
        {entry.tags.length > 0 && (
          <ul className="tag-row" aria-label="Tags">
            {entry.tags.map((t) => (
              <li key={t} className="stamp">
                {t}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="feat-card-side">
        {quote || !entry.excerpt ? (
          <div>
            <MonoLabel>From the piece</MonoLabel>
            <p className="t-serif feat-quote">{quote ? `“${quote}”` : entry.dek}</p>
          </div>
        ) : (
          <div>
            <MonoLabel>From the piece</MonoLabel>
            <p className="feat-excerpt">{entry.excerpt}</p>
          </div>
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span className="t-label" style={{ letterSpacing: "0.12em" }}>
            {entry.read && `Est. read · ${entry.read}`}
          </span>
          <span className="read-cue" style={{ marginTop: 0 }} aria-hidden="true">
            Read <span className="arrow">→</span>
          </span>
        </div>
      </div>
    </article>
  );
}

function EntryRow({ entry, index }) {
  return (
    <article className="entry-row entry-grid">
      <div className="entry-row-numcol" aria-hidden="true">
        <span className="entry-row-num t-outline-num">
          {String(index).padStart(2, "0")}
        </span>
      </div>
      <div>
        <div className="entry-row-meta">
          <span className="stamp">{KIND_META[entry.kind].tag}</span>
          <span className="t-label" style={{ letterSpacing: "0.08em" }}>
            {entry.date}
          </span>
        </div>
        <h3 className="t-title entry-row-title">
          <Link to={`/writing/${entry.id}`} state={{ fromApp: true }} className="stretched-link">
            {entry.title}
          </Link>
        </h3>
      </div>
      <p className="entry-row-desc t-body">{entry.dek}</p>
      <ul className="entry-row-tags" aria-label="Tags">
        {entry.tags.slice(0, 2).map((t) => (
          <li key={t} className="t-label">
            · {t}
          </li>
        ))}
      </ul>
      <div className="t-label" style={{ textAlign: "right", paddingTop: 4, letterSpacing: "0.08em" }}>
        {entry.read}
      </div>
    </article>
  );
}

function ReadingDialog({ entry: current, next, fromApp, onClose }) {
  const entry = useLastDefined(current);
  const titleId = useId();
  const progressRef = useRef(null);

  // fallback for browsers without scroll-driven animations
  useEffect(() => {
    if (supportsScrollTimeline || !current) return;
    const bar = progressRef.current;
    const scroller = bar?.closest("dialog");
    if (!scroller) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = scroller.scrollHeight - scroller.clientHeight;
      bar.style.transform = `scaleX(${max > 0 ? scroller.scrollTop / max : 0})`;
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    on();
    scroller.addEventListener("scroll", on, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      scroller.removeEventListener("scroll", on);
    };
  }, [current]);

  if (!entry) return null;
  const meta = [entry.date, entry.read].filter(Boolean);

  return (
    <Dialog
      open={!!current}
      onRequestClose={onClose}
      labelledBy={titleId}
      className="reading-dialog"
      contentKey={entry.id}
    >
      <div className="overlay-head">
        <div className="overlay-head-inner">
          <div className="overlay-crumb">
            <span aria-hidden="true" style={{ width: 8, height: 8, background: "var(--accent)", flexShrink: 0 }} />
            <span className="t-label">
              {[KIND_META[entry.kind].tag, ...meta].join(" · ")}
            </span>
          </div>
          <button type="button" onClick={onClose} className="stamp dialog-close">
            Close <kbd>Esc</kbd>
          </button>
        </div>
        <div className="read-progress" ref={progressRef} aria-hidden="true" />
      </div>

      <article className="reading-article">
        <MonoLabel>{KIND_META[entry.kind].label}</MonoLabel>
        <h2 id={titleId} className="t-title reading-title">
          {entry.title}
        </h2>
        {entry.dek && (
          <p className="t-body" style={{ margin: 0, fontSize: 17.5 }}>
            {linkifyTwyn(entry.dek)}
          </p>
        )}

        <div className="reading-meta">
          <span>By · Gautam Girdhar</span>
          {meta.map((m) => (
            <span key={m}>{m}</span>
          ))}
          {entry.tags.length > 0 && (
            <ul className="tags" aria-label="Tags">
              {entry.tags.map((t) => (
                <li key={t}>#{t.replace(/\s+/g, "")}</li>
              ))}
            </ul>
          )}
        </div>

        <RichText content={entry.body} />
      </article>

      <div className="reading-foot">
        <div className="dialog-foot">
          {next ? (
            <Link
              to={`/writing/${next.id}`}
              replace
              state={{ fromApp }}
              className="next-link"
            >
              <span className="t-label">Next piece →</span>
              <span className="t-title">{next.title}</span>
            </Link>
          ) : (
            <span className="t-label">End · {entry.id}</span>
          )}
          <button type="button" onClick={onClose} className="btn">
            <span>← Back to writing</span>
          </button>
        </div>
      </div>
    </Dialog>
  );
}
