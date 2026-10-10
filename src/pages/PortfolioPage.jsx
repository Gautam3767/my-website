import { Fragment, memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import GridOverlay from "../components/GridOverlay.jsx";
import TopNav from "../components/TopNav.jsx";
import MonoLabel from "../components/MonoLabel.jsx";
import SectionHead from "../components/SectionHead.jsx";
import Section from "../components/Section.jsx";
import Telemetry from "../components/Telemetry.jsx";
import SystemCube3D from "../components/SystemCube3D.jsx";
import SystemFlow3D from "../components/SystemFlow3D.jsx";
import { ModuleGlyph, SystemPreviewMotif } from "../components/Motifs.jsx";
import CaseStudyOverlay from "../components/CaseStudyOverlay.jsx";
import Footer from "../components/Footer.jsx";
import Reveal from "../components/Reveal.jsx";
import usePageMeta from "../hooks/usePageMeta.js";
import { prefersReducedMotion } from "../hooks/useMedia.js";
import {
  loadCaseStudies,
  loadSite,
  loadPosts,
  KIND_META,
  SITE_TITLE,
  SITE_DESCRIPTION,
  countLabel,
  numberWord,
  externalHref,
} from "../data/loaders.js";
import linkifyTwyn from "../utils/linkifyTwyn.jsx";

const SYSTEMS = loadCaseStudies();
const SITE = loadSite();
const ALL_POSTS = loadPosts();
const RECENT_POSTS = ALL_POSTS.slice(0, 3);

const CAPABILITY_CARDS = [
  {
    code: "01",
    title: "Computer Vision on Live Lines",
    body: "Defect detection at 97–98% accuracy and object counting at 99% — deployed with near-real-time inference on live automotive, two-wheeler, and manufacturing lines. PyTorch · YOLO · PatchCore · OpenCV.",
    glyph: "workflow",
  },
  {
    code: "02",
    title: "Multimodal Plant Copilots",
    body: "Voice + chat AI assistants wired to live plant data — STT (Whisper / Deepgram), TTS (ElevenLabs / gTTS), and LLM reasoning for operational queries, diagnostics, and KPI monitoring. In production across 3 enterprise clients.",
    glyph: "llm",
  },
  {
    code: "03",
    title: "Factory & Operations Software",
    body: "Full-stack platforms for the shop floor and the C-suite — worker-facing apps, supervisor consoles, and CXO command dashboards. React · React Native · Three.js digital twins · Node.js · real-time data pipelines.",
    glyph: "dashboard",
  },
  {
    code: "04",
    title: "End-to-End AI Products",
    body: "Sole-engineer products taken from research to App Store — architecture, model integration, mobile app, backend, deployment. Built a multimodal health diagnostics platform end-to-end (React Native + Python + multi-model AI).",
    glyph: "decision",
  },
];

const PROCESS_STEPS = [
  {
    code: "01",
    title: "Map the Workflow",
    body: "Understand the organisation, process, actors, bottlenecks, and decision points before anything is built.",
    detail: [
      "process interviews",
      "actor + decision map",
      "data + tool inventory",
      "friction inventory",
    ],
  },
  {
    code: "02",
    title: "Identify the Intelligence Layer",
    body: "Decide where AI should assist, automate, classify, retrieve, forecast, or reason — and where it absolutely should not.",
    detail: [
      "leverage analysis",
      "model fit selection",
      "risk + reliability budget",
      "evaluation plan",
    ],
  },
  {
    code: "03",
    title: "Design the System Architecture",
    body: "Data inputs, model layer, retrieval layer, automation logic, APIs, UI, and human review — designed as one continuous system.",
    detail: ["data flow", "model + retrieval", "orchestration", "interfaces + review"],
  },
  {
    code: "04",
    title: "Build the Product Interface",
    body: "Make the AI usable through dashboards, copilots, alerts, and workflows — where the user already works.",
    detail: ["dashboards", "copilots", "alerting layer", "admin + ops console"],
  },
  {
    code: "05",
    title: "Deploy for Real Use",
    body: "Focus on reliability, explainability, feedback loops, and business impact. The system should improve as it is used.",
    detail: [
      "evaluation + monitoring",
      "feedback capture",
      "retraining queue",
      "ops runbook",
    ],
  },
];

const CAPS = SITE.capabilities;
const BELIEFS = SITE.philosophy.beliefs;

const SECTION_IDS = [
  "hero",
  "build",
  "systems",
  "object-study",
  "process",
  "capabilities",
  "notes",
  "philosophy",
  "about",
  "contact",
];

const NAV_FOR_SECTION = {
  build: "systems",
  systems: "systems",
  "object-study": "systems",
  process: "process",
  capabilities: "capabilities",
  notes: "writing",
  philosophy: "about",
  about: "about",
  contact: "contact",
};

export default function PortfolioPage() {
  const [active, setActive] = useState("hero");
  const [params] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  // the open case study lives in the URL: shareable, and Back closes it
  const openId = params.get("system");
  const system = useMemo(
    () => SYSTEMS.find((s) => s.id === openId) || null,
    [openId]
  );
  const nextSystem = system
    ? SYSTEMS[(SYSTEMS.indexOf(system) + 1) % SYSTEMS.length]
    : null;

  usePageMeta(
    system
      ? {
          title: `${system.name} — Gautam Girdhar`,
          description: system.short || SITE_DESCRIPTION,
          path: `/?system=${system.id}`,
        }
      : { title: SITE_TITLE, description: SITE_DESCRIPTION, path: "/" }
  );

  useEffect(() => {
    const els = SECTION_IDS.map((id) => document.getElementById(id)).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const jumpTo = useCallback((id, { smooth = true } = {}) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({
      behavior: smooth && !prefersReducedMotion() ? "smooth" : "auto",
      block: "start",
    });
    // move focus with the viewport so keyboard users land in the section
    el.focus({ preventScroll: true });
  }, []);

  // honour hash deep-links on landing (e.g. "/#about" from /writing)
  useEffect(() => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (!id) return;
    const t = setTimeout(() => jumpTo(id, { smooth: false }), 120);
    return () => clearTimeout(t);
  }, [location.hash, jumpTo]);

  const openSystem = useCallback(
    (id, { replace = false } = {}) => {
      navigate(
        { search: `?system=${encodeURIComponent(id)}` },
        {
          // "next drawing" replaces the entry but keeps how we got here,
          // so Close still returns to the right place
          state: replace ? window.history.state?.usr : { fromApp: true },
          replace,
          preventScrollReset: true,
        }
      );
    },
    [navigate]
  );

  // one close per open, however many times Close / Esc is pressed
  const closedFor = useRef(null);
  useEffect(() => {
    closedFor.current = null;
  }, [openId]);
  const closeSystem = useCallback(() => {
    if (!openId || closedFor.current === openId) return;
    closedFor.current = openId;
    if (location.state?.fromApp) navigate(-1);
    else navigate({ search: "" }, { replace: true, preventScrollReset: true });
  }, [openId, location.state, navigate]);

  return (
    <>
      <GridOverlay />
      <div className="page">
        <TopNav active={NAV_FOR_SECTION[active]} onJump={jumpTo} />
        <main id="main" tabIndex={-1}>
          <Hero onJump={jumpTo} paused={!!system} />
          <Marquee />
          <WhatIBuild />
          <SelectedSystems onOpen={openSystem} />
          <ObjectStudy paused={!!system} />
          <Process />
          <Capabilities />
          <WritingTeaser />
          <Philosophy />
          <About />
          <Contact />
        </main>
        <Footer />
      </div>

      <CaseStudyOverlay
        system={system}
        next={nextSystem !== system ? nextSystem : null}
        onClose={closeSystem}
        onOpen={openSystem}
      />
    </>
  );
}

function Hero({ onJump, paused }) {
  const hero = SITE.hero;
  const rawHeadline = hero.headline || "End-to-end AI Engineer &";
  const rawAccent = hero.headlineAccent || "Solutions Architect";
  // a trailing "&" reads better leading the serif line than orphaned in caps
  const endsWithAmp = /\s*&\s*$/.test(rawHeadline);
  const headline = rawHeadline.replace(/\s*&\s*$/, "");
  const headlineAccent = endsWithAmp ? `& ${rawAccent}` : rawAccent;
  const kicker = hero.kicker || "AI Engineer · Solutions Architect · End-to-end";

  const jump = (id) => (e) => {
    e.preventDefault();
    onJump(id);
  };

  return (
    <section id="hero" data-screen-label="hero" className="hero" tabIndex={-1}>
      <div className="wrap hero-grid">
        <div>
          <div
            className="hero-fade hero-fade--still"
            style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 30 }}
          >
            <span
              aria-hidden="true"
              style={{ width: 30, height: 1, background: "var(--accent)", flexShrink: 0 }}
            />
            <MonoLabel as="p">{kicker}</MonoLabel>
          </div>

          <h1 style={{ margin: 0, fontSize: "clamp(40px, 5.6vw, 92px)" }}>
            <span className="hero-line t-display" style={{ lineHeight: 0.95 }}>
              <span>{headline}</span>
            </span>
            <span
              className="hero-line t-serif"
              style={{ lineHeight: 1.02, color: "var(--accent)", fontSize: "1.02em" }}
            >
              <span>{headlineAccent}.</span>
            </span>
          </h1>

          {hero.subhead && (
            <p
              className="t-body hero-fade"
              style={{ "--delay": "200ms", marginTop: 34, marginBottom: 0, maxWidth: 560, fontSize: 17.5 }}
            >
              {linkifyTwyn(hero.subhead)}
            </p>
          )}

          <div className="cta-row hero-fade" style={{ "--delay": "280ms" }}>
            <a href="#systems" onClick={jump("systems")} className="btn btn--primary">
              <span>View selected systems</span>
              <span className="btn-arrow" aria-hidden="true">→</span>
            </a>
            <a href="#process" onClick={jump("process")} className="btn">
              <span>Explore my process</span>
            </a>
          </div>
          <p className="hero-fade" style={{ "--delay": "340ms", margin: "22px 0 0" }}>
            <Link to="/writing" className="text-link">
              Or read the notes from the floor
              <span className="arrow" aria-hidden="true">→</span>
            </Link>
          </p>
        </div>

        <div
          className="hero-side hero-fade hero-fade--still"
          style={{
            "--delay": "200ms",
            animationDuration: "0.8s",
            position: "relative",
            justifySelf: "end",
            width: "100%",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <SystemCube3D ambientMotion paused={paused} />
        </div>
      </div>

      <div className="hero-meta-left" aria-hidden="true">
        <div className="scroll-hint" style={{ display: "inline-flex" }}>
          <MonoLabel>Scroll ↓</MonoLabel>
        </div>
        <div style={{ width: 80, height: 1, background: "var(--line-2)" }} />
      </div>
      <div className="hero-meta-right">
        <Telemetry status={SITE.about.status ? SITE.about.status.split("&")[0].trim() : undefined} />
      </div>
    </section>
  );
}

const Marquee = memo(function Marquee() {
  const items = SITE.hero.whatIDo;
  if (!items.length) return null;
  const track = (
    <div className="marquee-track" aria-hidden="true">
      {[...items, ...items].map((d, i) => (
        <span key={i} className="marquee-item">
          {d}
        </span>
      ))}
    </div>
  );
  return (
    <div className="marquee">
      <ul className="sr-only" aria-label="What I do">
        {items.map((d) => (
          <li key={d}>{d}</li>
        ))}
      </ul>
      {track}
      {track}
    </div>
  );
});

const WhatIBuild = memo(function WhatIBuild() {
  return (
    <Section id="build" num={1} tab="What I Build">
      <SectionHead
        title="AI systems that ship to production."
        lead="Each card maps to systems shipped in the last two years — not a service line. Real-time CV running on a live automotive floor, voice copilots in three enterprise plants, a full-stack factory ops platform, and a consumer health app shipped end-to-end as a single engineer."
      />
      <ul className="grid-cards grid-cards--4" style={{ margin: 0, padding: 0, listStyle: "none" }}>
        {CAPABILITY_CARDS.map((c, i) => (
          <Reveal as="li" key={c.code} delay={i * 60}>
            <div className="cap-card">
              <div>
                <div className="cap-card-head">
                  <span className="cap-num t-outline-num" aria-hidden="true">
                    {c.code}
                  </span>
                  <span className="cap-card-dot" aria-hidden="true" />
                </div>
                <h3 className="t-caps cap-title">{c.title}</h3>
                <p className="t-body" style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>
                  {c.body}
                </p>
              </div>
              <div className="cap-glyph">
                <ModuleGlyph kind={c.glyph} />
              </div>
            </div>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
});

const SelectedSystems = memo(function SelectedSystems({ onOpen }) {
  const n = SYSTEMS.length;
  return (
    <Section id="systems" num={2} tab="Selected Systems">
      <SectionHead
        title={`${numberWord(n)} ${n === 1 ? "system" : "systems"}, shipped & running.`}
        lead="Two from my work at Twyn (described at the level of detail my client agreement allows), and two personal projects shown in full. Real numbers — 97–98% live accuracy, 99% object counting, 3 enterprise clients, 6-week first deploy — are noted where they belong."
      />

      <ol className="sys-list" style={{ margin: 0, padding: 0, listStyle: "none" }}>
        {SYSTEMS.map((s, i) => {
          const descId = `sys-desc-${s.id}`;
          return (
            <Reveal as="li" key={s.id}>
              <article className="sys-row">
                <span className="sys-num t-outline-num" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div style={{ minWidth: 0 }}>
                  <h3 className="sys-name">
                    <button
                      type="button"
                      className="sys-link"
                      onClick={() => onOpen(s.id)}
                      aria-describedby={descId}
                      aria-haspopup="dialog"
                    >
                      {s.name}
                    </button>
                  </h3>
                  <span className="t-label sys-meta">
                    {[s.domain, s.timeline].filter(Boolean).join(" · ")}
                  </span>
                  <span className="sys-open" aria-hidden="true">
                    Open drawing <span className="arrow">→</span>
                  </span>
                </div>
                <p id={descId} className="sys-desc t-body" style={{ margin: 0 }}>
                  {s.short}
                </p>
                <span className="sys-fig" aria-hidden="true">
                  <SystemPreviewMotif kind={s.motif} color={s.palette} />
                  <span
                    className="plate-caption plate-caption--chip"
                    style={{ left: 10, top: 10 }}
                  >
                    <span>
                      Fig.{String(i + 1).padStart(2, "0")} · {s.motif}
                    </span>
                  </span>
                  <span
                    className="plate-caption plate-caption--chip"
                    style={{ right: 10, bottom: 10 }}
                  >
                    <span>
                      <span className="swatch" style={{ background: s.palette }} />
                      Client work — abstracted
                    </span>
                  </span>
                </span>
              </article>
            </Reveal>
          );
        })}
      </ol>
    </Section>
  );
});

const ObjectStudy = memo(function ObjectStudy({ paused }) {
  return (
    <Section id="object-study" num={3} tab="Object Study">
      <div
        className="grid-2"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 0.95fr) minmax(0, 1.4fr)",
          gap: 64,
          alignItems: "center",
        }}
      >
        <div>
          <h2 className="t-display section-title">
            How I think
            <br />
            about <span className="serif accent">an AI system.</span>
          </h2>
          <p className="t-body" style={{ marginTop: 28, maxWidth: 460 }}>
            Most production AI projects break at the seams between layers — not
            inside the model. Before I write code, I map the whole topology:
            where data enters, where it transforms, where the model fits, where
            a human takes over, and where the feedback closes the loop.
            <span className="hover-only"> Move your cursor over the drawing to tilt it.</span>
          </p>

          <dl style={{ margin: "36px 0 0", maxWidth: 420 }}>
            {[
              ["Figure", "02 · system flow"],
              ["Stages", "data → model → human"],
              ["Return", "feedback · retraining queue"],
              ["Drawn", "in code · live"],
            ].map(([k, v]) => (
              <div key={k} className="spec">
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <figure className="plate plate--graph plate--interactive" style={{ margin: 0 }}>
          <div
            className="plate-caption"
            style={{ left: 16, top: 14 }}
            aria-hidden="true"
          >
            <span>Fig. 02</span>
            <span>System Flow</span>
            <span style={{ color: "var(--blue)" }}>● live</span>
          </div>
          <div
            className="plate-caption flow-caption-secondary"
            style={{ right: 16, top: 14 }}
            aria-hidden="true"
          >
            Projection · 30° tilt
          </div>

          <SystemFlow3D ambientMotion accent="var(--blue)" paused={paused} />

          <div
            className="plate-caption flow-caption-secondary"
            style={{ left: 16, bottom: 14, right: 16, justifyContent: "space-between" }}
            aria-hidden="true"
          >
            <span>closed loop · human-in-the-loop</span>
            <span>dots ≈ live data</span>
            <span className="hover-only">cursor → tilt</span>
          </div>
        </figure>
      </div>
    </Section>
  );
});

const Process = memo(function Process() {
  return (
    <Section id="process" num={4} tab="How I Work">
      <SectionHead
        title="From messy workflows to intelligent systems."
        lead="I start by mapping how work actually happens — people, processes, data, decisions, bottlenecks. Then I identify where AI creates leverage and engineer the system around it."
      />

      <ol className="process-list" style={{ margin: 0, padding: 0, listStyle: "none" }}>
        {PROCESS_STEPS.map((s) => (
          <Reveal as="li" key={s.code}>
            <div className="process-row">
              <span className="process-num t-outline-num" aria-hidden="true">
                {s.code}
              </span>
              <h3 className="t-caps process-title">{s.title}</h3>
              <div className="process-body">
                <p className="t-body" style={{ margin: 0, fontSize: 15.5 }}>
                  {s.body}
                </p>
                <ul className="process-tags" aria-label="Outputs">
                  {s.detail.map((d) => (
                    <li key={d} className="stamp">
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
});

const Capabilities = memo(function Capabilities() {
  if (!CAPS.length) return null;
  return (
    <Section id="capabilities" num={5} tab="Technical Capabilities">
      <SectionHead
        title="Every tool I ship production AI with."
        lead="Grouped by where each piece sits in a real system. Solutions architecture sets the strategy. The AI / ML / voice layer builds the intelligence. The product layer ships the interface. The backend carries everything underneath."
      />

      <div className="caps-list">
        {CAPS.map((L) => (
          <Reveal key={L.layer + L.name}>
            <div className="caps-row">
              <div>
                <div className="t-label caps-layer">Layer · {L.layer}</div>
                <h3 className="t-caps caps-name">{L.name}</h3>
                <div className="t-label" style={{ marginTop: 14 }}>
                  {countLabel(L.items.length, "entry", "entries")}
                </div>
              </div>
              {/* real spaces between items give the line somewhere to break;
                  short items never split across lines */}
              <ul className="caps-items" aria-label={L.name}>
                {L.items.map((it) => (
                  <Fragment key={it}>
                    <li className={it.length <= 26 ? "nw" : undefined}>{it}</li>{" "}
                  </Fragment>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
});

const WritingTeaser = memo(function WritingTeaser() {
  if (!RECENT_POSTS.length) return null;
  const latest = ALL_POSTS[0]?.date;
  return (
    <Section id="notes" num={6} tab="From the Notes">
      <SectionHead
        title="Written between deployments."
        lead="Essays, field notes, and lab entries from shipping production AI — the longer version of how I think about the work, and a deeper look at what sits behind each case study."
      />
      <ul
        className="grid-cards grid-cards--3"
        style={{ margin: 0, padding: 0, listStyle: "none", "--cols": RECENT_POSTS.length }}
      >
        {RECENT_POSTS.map((n, i) => (
          <Reveal as="li" key={n.id} delay={i * 60}>
            <article className="note-card">
              <div>
                <div className="note-card-meta">
                  <span className="stamp">{KIND_META[n.kind].tag}</span>
                  <span className="t-label" style={{ letterSpacing: "0.1em" }}>
                    {[n.date, n.read].filter(Boolean).join(" · ")}
                  </span>
                </div>
                <h3 className="t-title note-card-title">
                  <Link
                    to={`/writing/${n.id}`}
                    state={{ fromApp: true }}
                    className="stretched-link"
                  >
                    {n.title}
                  </Link>
                </h3>
                <p className="t-body" style={{ margin: 0, fontSize: 14 }}>
                  {n.dek}
                </p>
              </div>
              <div className="read-cue" aria-hidden="true">
                Read <span className="arrow">→</span>
              </div>
            </article>
          </Reveal>
        ))}
      </ul>

      <div
        style={{
          marginTop: 36,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 18,
          flexWrap: "wrap",
        }}
      >
        <p className="t-label" style={{ margin: 0 }}>
          {countLabel(ALL_POSTS.length, "entry", "entries")}
          {latest && ` · latest ${latest}`}
        </p>
        <Link to="/writing" className="btn">
          <span>Read all notes</span>
          <span className="btn-arrow accent-text" aria-hidden="true">
            →
          </span>
        </Link>
      </div>
    </Section>
  );
});

const Philosophy = memo(function Philosophy() {
  const p = SITE.philosophy;
  const headline = p.headline || "Anyone can build the demo.";
  const headlineAccent = p.headlineAccent || "I build what runs on Monday morning.";

  return (
    <Section id="philosophy" num={7} tab="Belief" plate>
      <h2 style={{ margin: 0, maxWidth: 1320, fontSize: "clamp(40px, 6.6vw, 116px)" }}>
        <span className="t-display" style={{ display: "block", color: "var(--plate-text)" }}>
          {headline}
        </span>
        <span
          className="t-serif"
          style={{
            display: "block",
            color: "var(--accent-on-dark)",
            lineHeight: 1.04,
            fontSize: "0.92em",
            marginTop: 10,
            textWrap: "balance",
          }}
        >
          {headlineAccent}
        </span>
      </h2>

      {(p.body || p.principles) && (
        <div
          className="grid-2"
          style={{
            marginTop: 64,
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.05fr) minmax(0, 0.95fr)",
            gap: "40px 80px",
            alignItems: "start",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "var(--plate-text)",
              fontSize: "clamp(18px, 1.6vw, 21px)",
              lineHeight: 1.5,
              letterSpacing: "-0.01em",
              textWrap: "pretty",
              maxWidth: 620,
            }}
          >
            {linkifyTwyn(p.body)}
          </p>
          {p.principles && (
            <div>
              <h3 className="t-label" style={{ color: "var(--plate-text-2)", margin: "0 0 16px", fontWeight: 400 }}>
                Working principles
              </h3>
              <p
                style={{
                  margin: 0,
                  color: "var(--plate-text-2)",
                  fontSize: 15.5,
                  lineHeight: 1.65,
                  textWrap: "pretty",
                }}
              >
                {linkifyTwyn(p.principles)}
              </p>
            </div>
          )}
        </div>
      )}

      {BELIEFS.length > 0 && (
        <ol className="belief-grid">
          {BELIEFS.map((b, i) => (
            <Reveal as="li" key={b.code + i} delay={i * 60}>
              <div className="belief-cell">
                <span className="belief-code">BELIEF · {b.code}</span>
                <p
                  style={{
                    margin: 0,
                    fontSize: 19,
                    lineHeight: 1.3,
                    color: "var(--plate-text)",
                    letterSpacing: "-0.01em",
                    textWrap: "balance",
                  }}
                >
                  {b.line}
                </p>
              </div>
            </Reveal>
          ))}
        </ol>
      )}
    </Section>
  );
});

const About = memo(function About() {
  const about = SITE.about;
  const facts = [
    ["Focus", about.focus],
    ["Based", about.based],
    ["Working with", about.workingWith],
    ["Status", about.status],
  ].filter(([, v]) => v);

  return (
    <Section id="about" num={8} tab="About">
      <SectionHead title="Engineer of record." />
      <div className="about-grid">
        <div>
          {about.intro && (
            <p
              style={{
                margin: 0,
                fontSize: 18,
                lineHeight: 1.65,
                color: "var(--ink)",
                textWrap: "pretty",
              }}
            >
              {linkifyTwyn(about.intro)}
            </p>
          )}
          {about.bio && (
            <p className="t-body" style={{ marginTop: 22, fontSize: 16.5 }}>
              {linkifyTwyn(about.bio)}
            </p>
          )}

          {facts.length > 0 && (
            <dl style={{ margin: "44px 0 0" }}>
              {facts.map(([k, v]) => (
                <div key={k} className="spec">
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        <figure className="plate" style={{ margin: 0 }}>
          <div className="portrait-frame">
            {about.portrait ? (
              <img
                src={about.portrait}
                alt={about.portraitAlt || "Portrait of Gautam Girdhar"}
                loading="lazy"
                decoding="async"
              />
            ) : (
              <span className="monogram" aria-hidden="true">
                GG<span>.</span>
              </span>
            )}
            <div
              className="plate-caption plate-caption--chip"
              style={{ left: 14, top: 12 }}
              aria-hidden="true"
            >
              <span>Operator · G.G — 001</span>
            </div>
            <div
              className="plate-caption plate-caption--chip"
              style={{ right: 14, top: 12, color: "var(--accent-text)" }}
              aria-hidden="true"
            >
              <span>
                <span className="pulse-dot">●</span> on site
              </span>
            </div>
            <div
              className="plate-caption plate-caption--chip"
              style={{ left: 14, bottom: 12 }}
              aria-hidden="true"
            >
              <span>{about.based || "New Delhi · India"}</span>
            </div>
          </div>
          <figcaption className="plate-foot">
            <span>Name · Gautam Girdhar</span>
            <span>Role · Applied AI / Systems</span>
          </figcaption>
        </figure>
      </div>
    </Section>
  );
});

const Contact = memo(function Contact() {
  const c = SITE.contact;
  const display = (url) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
  const rows = [
    { label: "Email", value: c.email, href: c.email && `mailto:${c.email}` },
    {
      label: "LinkedIn",
      value: c.linkedin && display(c.linkedin),
      href: externalHref(c.linkedin),
      external: true,
    },
    {
      label: "GitHub",
      value: c.github && display(c.github),
      href: externalHref(c.github),
      external: true,
    },
    {
      label: "Phone",
      value: c.phone,
      href: c.phone && `tel:${c.phone.replace(/[^\d+]/g, "")}`,
    },
  ].filter((r) => r.value && r.href);

  return (
    <Section id="contact" num={9} tab="Contact" style={{ paddingBottom: 110 }}>
      <h2 style={{ margin: 0, maxWidth: 1240, fontSize: "clamp(40px, 6.6vw, 110px)" }}>
        <span className="t-display" style={{ display: "block" }}>
          Let’s build systems
        </span>
        <span
          className="t-serif"
          style={{
            display: "block",
            color: "var(--accent)",
            fontSize: "0.94em",
            lineHeight: 1.05,
            marginTop: 8,
          }}
        >
          that actually work.
        </span>
      </h2>

      {rows.length > 0 && (
        <ul className="contact-list">
          {rows.map((r) => (
            <li key={r.label}>
              <a
                href={r.href}
                className="contact-row"
                target={r.external ? "_blank" : undefined}
                rel={r.external ? "noreferrer" : undefined}
              >
                <span className="t-label contact-label">{r.label}</span>
                <span className="contact-value">
                  <span className="sr-only">{r.label}: </span>
                  {r.value}
                  {r.external && <span className="sr-only"> (opens in a new tab)</span>}
                </span>
                <span className="contact-arrow" aria-hidden="true">
                  ↗
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
});
