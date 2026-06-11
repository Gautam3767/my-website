import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
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
import {
  loadCaseStudies,
  loadSite,
  loadPosts,
  KIND_META,
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

const CAPS = SITE.capabilities || [];
const BELIEFS = SITE.philosophy?.beliefs || [];

export default function PortfolioPage() {
  const [active, setActive] = useState("hero");
  const [openSystem, setOpenSystem] = useState(null);

  useEffect(() => {
    const ids = [
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
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
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

  const jumpTo = useCallback((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 60;
    window.scrollTo({ top: y, behavior: "smooth" });
  }, []);

  // honour hash deep-link on landing or hash change (e.g. "/#about")
  useEffect(() => {
    const handle = () => {
      if (!window.location.hash) return;
      const id = window.location.hash.replace("#", "");
      const el = document.getElementById(id);
      if (el) jumpTo(id);
    };
    const t = setTimeout(handle, 250);
    window.addEventListener("hashchange", handle);
    return () => {
      clearTimeout(t);
      window.removeEventListener("hashchange", handle);
    };
  }, [jumpTo]);

  const system = useMemo(
    () => SYSTEMS.find((s) => s.id === openSystem) || null,
    [openSystem]
  );

  const navActive =
    ({
      hero: "hero",
      build: "systems",
      systems: "systems",
      "object-study": "systems",
      process: "process",
      capabilities: "capabilities",
      notes: "writing",
      philosophy: "about",
      about: "about",
      contact: "contact",
    })[active] || active;

  return (
    <>
      <GridOverlay />
      <div style={{ position: "relative", zIndex: 1 }}>
        <TopNav active={navActive} onJump={jumpTo} />
        <Hero onJump={jumpTo} />
        <Marquee />
        <WhatIBuild />
        <SelectedSystems onOpen={setOpenSystem} />
        <ObjectStudy />
        <Process />
        <Capabilities />
        <WritingTeaser />
        <Philosophy />
        <About />
        <Contact />
        <Footer />
      </div>

      <CaseStudyOverlay system={system} onClose={() => setOpenSystem(null)} />
    </>
  );
}

function Hero({ onJump }) {
  const hero = SITE.hero || {};
  const rawHeadline = hero.headline || "End-to-end AI Engineer &";
  const rawAccent = hero.headlineAccent || "Solutions Architect";
  // a trailing "&" reads better leading the serif line than orphaned in caps
  const endsWithAmp = /\s*&\s*$/.test(rawHeadline);
  const headline = rawHeadline.replace(/\s*&\s*$/, "");
  const headlineAccent = endsWithAmp ? `& ${rawAccent}` : rawAccent;
  const kicker = hero.kicker || "AI Engineer · Solutions Architect · End-to-end";
  const subhead = hero.subhead || "";

  return (
    <section
      id="hero"
      data-screen-label="hero"
      style={{
        minHeight: "100svh",
        padding: "150px var(--pad-x) 96px",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <div
        className="wrap grid-2"
        style={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.25fr) minmax(0, 1fr)",
          gap: 56,
          alignItems: "center",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 30,
              animation: "fadeIn 1s var(--ease) both",
            }}
          >
            <span style={{ width: 30, height: 1, background: "var(--accent)" }} />
            <MonoLabel>{kicker}</MonoLabel>
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "clamp(42px, 5.6vw, 92px)",
            }}
          >
            <span className="hero-line t-display" style={{ lineHeight: 0.95 }}>
              <span>{headline}</span>
            </span>
            <span
              className="hero-line t-serif"
              style={{
                lineHeight: 1.02,
                color: "var(--accent)",
                fontSize: "1.02em",
              }}
            >
              <span>{headlineAccent}.</span>
            </span>
          </h1>

          <p
            className="t-body"
            style={{
              marginTop: 34,
              marginBottom: 0,
              maxWidth: 560,
              fontSize: 17.5,
              animation: "fadeUp 0.9s var(--ease) 0.35s both",
            }}
          >
            {linkifyTwyn(subhead)}
          </p>

          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: 42,
              flexWrap: "wrap",
              animation: "fadeUp 1s var(--ease) 0.45s both",
            }}
          >
            <button onClick={() => onJump("systems")} className="btn btn--primary">
              <span>View Selected Systems</span>
              <span className="btn-arrow">→</span>
            </button>
            <button onClick={() => onJump("process")} className="btn">
              <span>Explore My Process</span>
            </button>
            <Link to="/writing" className="btn">
              <span>Notes from the Floor</span>
              <span className="btn-arrow" style={{ color: "var(--accent)" }}>
                →
              </span>
            </Link>
          </div>
        </div>

        <div
          className="hero-side"
          style={{
            position: "relative",
            justifySelf: "end",
            width: "100%",
            display: "flex",
            justifyContent: "flex-end",
            animation: "fadeIn 1.6s var(--ease) 0.3s both",
          }}
        >
          <SystemCube3D ambientMotion />
        </div>
      </div>

      <div
        className="hero-meta"
        style={{
          position: "absolute",
          left: "var(--pad-x)",
          bottom: 26,
          display: "flex",
          gap: 36,
          alignItems: "center",
        }}
      >
        <div className="scroll-hint" style={{ display: "inline-flex" }}>
          <MonoLabel>Scroll ↓</MonoLabel>
        </div>
        <div style={{ width: 80, height: 1, background: "var(--line-2)" }} />
      </div>
      <div
        className="hero-meta"
        style={{
          position: "absolute",
          right: "var(--pad-x)",
          bottom: 26,
          width: 280,
        }}
      >
        <Telemetry />
      </div>
    </section>
  );
}

function Marquee() {
  const items = SITE.hero?.whatIDo || [];
  if (!items.length) return null;
  const track = (
    <div className="marquee-track" aria-hidden>
      {[...items, ...items].map((d, i) => (
        <span key={i} className="marquee-item">
          {d}
        </span>
      ))}
    </div>
  );
  return (
    <div className="marquee" aria-label={items.join(", ")}>
      {track}
      {track}
    </div>
  );
}

function WhatIBuild() {
  return (
    <Section id="build" num={1} tab="What I Build">
      <SectionHead
        title="AI systems that ship to production."
        lead="Each card maps to systems shipped in the last two years — not a service line. Real-time CV running on a live automotive floor, voice copilots in three enterprise plants, a full-stack factory ops platform, and a consumer health app shipped end-to-end as a single engineer."
      />
      <div
        className="grid-4"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0,1fr))",
          gap: 1,
          border: "1px solid var(--line)",
          background: "var(--line)",
        }}
      >
        {CAPABILITY_CARDS.map((c, i) => (
          <Reveal key={c.code} delay={i * 80}>
            <div className="cap-card">
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <span className="cap-num">{c.code}</span>
                  <span
                    style={{ width: 7, height: 7, background: "var(--accent)" }}
                  />
                </div>
                <h3
                  style={{
                    margin: "32px 0 14px",
                    fontFamily: "var(--font-display)",
                    fontStretch: "112%",
                    fontWeight: 660,
                    textTransform: "uppercase",
                    fontSize: 19,
                    letterSpacing: "0.005em",
                    lineHeight: 1.15,
                  }}
                >
                  {c.title}
                </h3>
                <p
                  className="t-body"
                  style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}
                >
                  {c.body}
                </p>
              </div>
              <div style={{ marginTop: 28, opacity: 0.85 }}>
                <ModuleGlyph kind={c.glyph} />
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function SelectedSystems({ onOpen }) {
  return (
    <Section id="systems" num={2} tab="Selected Systems">
      <SectionHead
        title="Four systems, shipped & running."
        lead="Two from my work at Twyn (described at the level of detail my client agreement allows), and two personal projects shown in full. Real numbers — 97–98% live accuracy, 99% object counting, 3 enterprise clients, 6-week first deploy — are noted where they belong."
      />

      <div>
        {SYSTEMS.map((s, i) => (
          <Reveal key={s.id} delay={40}>
            <button className="sys-row" onClick={() => onOpen(s.id)}>
              <span className="sys-num">{String(i + 1).padStart(2, "0")}</span>
              <span style={{ minWidth: 0 }}>
                <h3 className="sys-name">{s.name}</h3>
                <span
                  className="t-label"
                  style={{ letterSpacing: "0.1em", color: "var(--ink-3)" }}
                >
                  {s.domain} · {linkifyTwyn(s.timeline)}
                </span>
              </span>
              <span
                className="sys-desc t-body"
                style={{ fontSize: 14.5, lineHeight: 1.55, paddingRight: 56 }}
              >
                {linkifyTwyn(s.short)}
              </span>
              <span className="sys-fig">
                <SystemPreviewMotif kind={s.motif} color={s.palette} />
                <span
                  className="plate-caption"
                  style={{ left: 12, top: 10 }}
                >
                  <span>FIG.{String(i + 1).padStart(2, "0")}</span>
                  <span>{s.motif}</span>
                </span>
                <span
                  className="plate-caption"
                  style={{ right: 12, bottom: 10, color: s.palette }}
                >
                  CLIENT WORK — ABSTRACTED
                </span>
              </span>
              <span className="sys-open">OPEN →</span>
            </button>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function ObjectStudy() {
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
          <h2
            className="t-display"
            style={{ margin: 0, fontSize: "clamp(36px, 4.2vw, 62px)" }}
          >
            How I think
            <br />
            about{" "}
            <span className="serif" style={{ color: "var(--blue)" }}>
              an AI system.
            </span>
          </h2>
          <p className="t-body" style={{ marginTop: 28, maxWidth: 460 }}>
            Most production AI projects break at the seams between layers — not
            inside the model. Before I write code, I map the whole topology:
            where data enters, where it transforms, where the model fits, where
            a human takes over, and where the feedback closes the loop. Move
            your cursor to inspect.
          </p>

          <dl style={{ margin: "36px 0 0", maxWidth: 420 }}>
            {[
              ["Figure", "02 · system flow"],
              ["Stages", "data → model → human"],
              ["Return", "feedback · retraining queue"],
              ["Drawn", "in code · cursor-reactive"],
            ].map(([k, v]) => (
              <div key={k} className="spec">
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="plate plate--graph">
          <div className="plate-caption" style={{ left: 16, top: 14 }}>
            <span>Fig. 02</span>
            <span>System Flow</span>
            <span style={{ color: "var(--blue)" }}>● live</span>
          </div>
          <div className="plate-caption" style={{ right: 16, top: 14 }}>
            Projection · 30° tilt
          </div>

          <SystemFlow3D ambientMotion accent="var(--blue)" />

          <div
            className="plate-caption"
            style={{
              left: 16,
              bottom: 14,
              right: 16,
              justifyContent: "space-between",
            }}
          >
            <span>closed loop · human-in-the-loop</span>
            <span>dots ≈ live data</span>
            <span>cursor → tilt</span>
          </div>
        </div>
      </div>
    </Section>
  );
}

function Process() {
  return (
    <Section id="process" num={4} tab="How I Work">
      <SectionHead
        title="From messy workflows to intelligent systems."
        lead="I start by mapping how work actually happens — people, processes, data, decisions, bottlenecks. Then I identify where AI creates leverage and engineer the system around it."
      />

      <div>
        {PROCESS_STEPS.map((s, i) => (
          <Reveal key={s.code} delay={i * 60}>
            <div className="process-row">
              <span className="process-num">{s.code}</span>
              <h3
                style={{
                  margin: 0,
                  fontFamily: "var(--font-display)",
                  fontStretch: "114%",
                  fontWeight: 680,
                  textTransform: "uppercase",
                  fontSize: "clamp(20px, 2.2vw, 30px)",
                  letterSpacing: "-0.005em",
                  lineHeight: 1.05,
                  paddingTop: 6,
                }}
              >
                {s.title}
              </h3>
              <div className="process-body">
                <p className="t-body" style={{ margin: 0, fontSize: 15.5 }}>
                  {s.body}
                </p>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "6px 8px",
                    marginTop: 16,
                  }}
                >
                  {s.detail.map((d) => (
                    <span key={d} className="stamp">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <div
        style={{
          marginTop: 72,
          border: "1px solid var(--line-2)",
          padding: "30px 28px 34px",
          background: "var(--paper-1)",
          position: "relative",
        }}
      >
        <MonoLabel>Fig. 03 / System Flow — continuous loop</MonoLabel>
        <div
          className="grid-4"
          style={{
            marginTop: 24,
            display: "grid",
            gridTemplateColumns: "repeat(6, minmax(0,1fr))",
            gap: 10,
            alignItems: "center",
          }}
        >
          {[
            "Workflow",
            "Data",
            "AI Layer",
            "Product Interface",
            "Decision",
            "Feedback Loop",
          ].map((n, i) => (
            <div
              key={n}
              style={{
                padding: "16px 12px",
                border:
                  i === 2
                    ? "1px solid var(--accent)"
                    : "1px solid var(--line-2)",
                background: i === 2 ? "var(--accent-soft)" : "var(--paper-0)",
                color: i === 2 ? "var(--accent)" : "var(--ink)",
                fontFamily: "var(--font-mono)",
                fontSize: 11.5,
                textAlign: "center",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              {n}
            </div>
          ))}
        </div>
        <div
          style={{
            marginTop: 12,
            color: "var(--ink-3)",
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.2em",
            textAlign: "center",
          }}
        >
          ← · · · · · · · · · · · · · · · FEEDBACK RETURNS · · · · · · · · · ·
          · · · · →
        </div>
      </div>
    </Section>
  );
}

function Capabilities() {
  return (
    <Section id="capabilities" num={5} tab="Technical Capabilities">
      <SectionHead
        title="Every tool I ship production AI with."
        lead="Grouped by where each piece sits in a real system. Solutions architecture sets the strategy. The AI / ML / voice layer builds the intelligence. The product layer ships the interface. The backend carries everything underneath."
      />

      <div>
        {CAPS.map((L, i) => (
          <Reveal key={L.layer} delay={i * 60}>
            <div className="caps-row">
              <div>
                <div
                  className="t-label"
                  style={{ color: "var(--accent)", letterSpacing: "0.2em" }}
                >
                  Layer · {L.layer}
                </div>
                <div
                  style={{
                    marginTop: 12,
                    fontFamily: "var(--font-display)",
                    fontStretch: "114%",
                    fontWeight: 680,
                    textTransform: "uppercase",
                    fontSize: 22,
                    lineHeight: 1.05,
                    letterSpacing: "-0.005em",
                  }}
                >
                  {L.name}
                </div>
                <div
                  className="t-label"
                  style={{ marginTop: 14, display: "block" }}
                >
                  {String(L.items.length).padStart(2, "0")} entries
                </div>
              </div>
              <p className="caps-items">
                {L.items.map((it, k) => (
                  <span key={it}>
                    <b>{it}</b>
                    {k < L.items.length - 1 && (
                      <span className="caps-sep">/</span>
                    )}
                  </span>
                ))}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function WritingTeaser() {
  return (
    <Section id="notes" num={6} tab="From the Notes">
      <SectionHead
        title="Written between deployments."
        lead="Essays, field notes, and lab entries from shipping production AI — the longer version of how I think about the work, and a deeper look at what sits behind each case study."
      />
      <div
        className="grid-3"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0,1fr))",
          gap: 1,
          border: "1px solid var(--line)",
          background: "var(--line)",
        }}
      >
        {RECENT_POSTS.map((n, i) => (
          <Reveal key={n.id} delay={i * 80}>
            <Link to={`/writing#${n.id}`} className="note-card">
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <span className="stamp">
                    {KIND_META[n.kind]?.tag || String(n.kind || "").toUpperCase()}
                  </span>
                  <span
                    className="t-label"
                    style={{ letterSpacing: "0.1em" }}
                  >
                    {n.date} · {n.read}
                  </span>
                </div>
                <h3
                  style={{
                    margin: "26px 0 14px",
                    fontFamily: "var(--font-display)",
                    fontStretch: "110%",
                    fontWeight: 650,
                    fontSize: 21,
                    letterSpacing: "-0.01em",
                    lineHeight: 1.18,
                    color: "var(--ink)",
                    textWrap: "balance",
                  }}
                >
                  {n.title}
                </h3>
                <p className="t-body" style={{ margin: 0, fontSize: 14 }}>
                  {n.dek}
                </p>
              </div>
              <div
                style={{
                  marginTop: 26,
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--accent)",
                  letterSpacing: "0.16em",
                }}
              >
                READ <span className="note-card-arrow">→</span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>

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
        <div className="t-label">
          {String(ALL_POSTS.length).padStart(2, "0")} entries · updated monthly
        </div>
        <Link to="/writing" className="btn">
          <span>Read all notes</span>
          <span className="btn-arrow" style={{ color: "var(--accent)" }}>
            →
          </span>
        </Link>
      </div>
    </Section>
  );
}

function Philosophy() {
  const p = SITE.philosophy || {};
  const headline = p.headline || "Anyone can build the demo.";
  const headlineAccent =
    p.headlineAccent || "I build what runs on Monday morning.";
  const body = p.body || "";
  const principles = p.principles || "";

  return (
    <Section
      id="philosophy"
      num={7}
      tab="Belief"
      plate
      style={{ paddingTop: 150, paddingBottom: 150 }}
    >
      <h2
        style={{
          margin: 0,
          maxWidth: 1320,
          fontSize: "clamp(44px, 6.6vw, 116px)",
        }}
      >
        <span
          className="t-display"
          style={{ display: "block", color: "var(--plate-text)" }}
        >
          {headline}
        </span>
        <span
          className="t-serif"
          style={{
            display: "block",
            color: "var(--accent)",
            lineHeight: 1.04,
            fontSize: "0.92em",
            marginTop: 10,
          }}
        >
          {headlineAccent}
        </span>
      </h2>

      <div
        className="grid-2"
        style={{
          marginTop: 64,
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.05fr) minmax(0, 0.95fr)",
          gap: 80,
          alignItems: "start",
        }}
      >
        <p
          style={{
            margin: 0,
            color: "var(--plate-text)",
            fontSize: 21,
            lineHeight: 1.5,
            letterSpacing: "-0.01em",
            textWrap: "pretty",
            maxWidth: 620,
          }}
        >
          {linkifyTwyn(body)}
        </p>
        <div>
          <div
            className="t-label"
            style={{ color: "var(--plate-text-2)", marginBottom: 16 }}
          >
            Working principles
          </div>
          <p
            style={{
              margin: 0,
              color: "var(--plate-text-2)",
              fontSize: 15.5,
              lineHeight: 1.65,
              textWrap: "pretty",
            }}
          >
            {linkifyTwyn(principles)}
          </p>
        </div>
      </div>

      <div
        className="grid-4"
        style={{
          marginTop: 96,
          borderTop: "1px solid var(--plate-line)",
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0,1fr))",
        }}
      >
        {BELIEFS.map((b, i) => (
          <Reveal key={b.code} delay={i * 70}>
            <div
              style={{
                padding: "30px 26px 36px",
                borderRight:
                  i < BELIEFS.length - 1
                    ? "1px solid var(--plate-line)"
                    : "none",
                display: "flex",
                flexDirection: "column",
                gap: 30,
                minHeight: 200,
                height: "100%",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10.5,
                  color: "var(--accent)",
                  letterSpacing: "0.2em",
                }}
              >
                BELIEF · {b.code}
              </span>
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
      </div>
    </Section>
  );
}

function About() {
  const about = SITE.about || {};
  return (
    <Section id="about" num={8} tab="About">
      <SectionHead title="Engineer of record." />
      <div
        className="grid-2"
        style={{
          display: "grid",
          gridTemplateColumns: "1.05fr 1fr",
          gap: 64,
          alignItems: "start",
        }}
      >
        <div>
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
          <p className="t-body" style={{ marginTop: 22, fontSize: 16.5 }}>
            {linkifyTwyn(about.bio)}
          </p>

          <dl style={{ margin: "44px 0 0" }}>
            {[
              ["Focus", about.focus],
              ["Based", about.based],
              ["Working with", about.workingWith],
              ["Status", about.status],
            ].map(([k, v]) => (
              <div key={k} className="spec">
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="plate">
          <div
            style={{
              aspectRatio: "1 / 1.15",
              background:
                "repeating-linear-gradient(135deg, rgba(28,26,19,0.03) 0 1px, transparent 1px 12px), var(--paper-2)",
              position: "relative",
              display: "grid",
              placeItems: "center",
            }}
          >
            <div className="t-label" style={{ letterSpacing: "0.2em" }}>
              [ Portrait — to follow ]
            </div>
            <div className="plate-caption" style={{ left: 14, top: 12 }}>
              Operator · G.G — 001
            </div>
            <div
              className="plate-caption"
              style={{ right: 14, top: 12, color: "var(--accent)" }}
            >
              <span className="pulse-dot">●</span> on site
            </div>
            <div
              className="plate-caption"
              style={{
                left: 14,
                bottom: 12,
                right: 14,
                justifyContent: "space-between",
              }}
            >
              <span>New Delhi · IN</span>
              <span>Aspect 1:1.15</span>
            </div>
          </div>
          <div
            style={{
              borderTop: "1px solid var(--line-2)",
              padding: "14px 16px",
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              fontFamily: "var(--font-mono)",
              fontSize: 10.5,
              color: "var(--ink-2)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            <span>Name · Gautam Girdhar</span>
            <span>Role · Applied AI / Sys</span>
          </div>
        </div>
      </div>
    </Section>
  );
}

function Contact() {
  const c = SITE.contact || {};
  const linkedinDisplay = (c.linkedin || "").replace(/^https?:\/\/(www\.)?/, "");
  const githubDisplay = (c.github || "").replace(/^https?:\/\/(www\.)?/, "");
  const rows = [
    { label: "Email", value: c.email, href: c.email ? `mailto:${c.email}` : "#" },
    { label: "LinkedIn", value: linkedinDisplay, href: c.linkedin || "#" },
    { label: "GitHub", value: githubDisplay, href: c.github || "#" },
    {
      label: "Phone",
      value: c.phone,
      href: c.phone ? `tel:${String(c.phone).replace(/[^\d+]/g, "")}` : "#",
    },
  ];
  return (
    <Section id="contact" num={9} tab="Contact" style={{ paddingBottom: 110 }}>
      <h2
        style={{
          margin: 0,
          maxWidth: 1240,
          fontSize: "clamp(42px, 6.6vw, 110px)",
        }}
      >
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

      <div style={{ marginTop: 64 }}>
        {rows.map((r) => (
          <a
            key={r.label}
            href={r.href}
            className="contact-row"
            target={r.href.startsWith("http") ? "_blank" : undefined}
            rel={r.href.startsWith("http") ? "noreferrer" : undefined}
          >
            <span className="t-label contact-label">{r.label}</span>
            <span className="contact-value">{r.value}</span>
            <span className="contact-arrow">↗</span>
          </a>
        ))}
      </div>
    </Section>
  );
}
