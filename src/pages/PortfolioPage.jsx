import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import GridOverlay from "../components/GridOverlay.jsx";
import TopNav from "../components/TopNav.jsx";
import MonoLabel from "../components/MonoLabel.jsx";
import SectionHead from "../components/SectionHead.jsx";
import Section from "../components/Section.jsx";
import Telemetry from "../components/Telemetry.jsx";
import SystemCube3D from "../components/SystemCube3D.jsx";
import TopologyMesh3D from "../components/TopologyMesh3D.jsx";
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
    detail: [
      "data flow",
      "model + retrieval",
      "orchestration",
      "interfaces + review",
    ],
  },
  {
    code: "04",
    title: "Build the Product Interface",
    body: "Make the AI usable through dashboards, copilots, alerts, and workflows — where the user already works.",
    detail: [
      "dashboards",
      "copilots",
      "alerting layer",
      "admin + ops console",
    ],
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
    const els = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean);
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

      <CaseStudyOverlay
        system={system}
        onClose={() => setOpenSystem(null)}
      />
    </>
  );
}

function Hero({ onJump }) {
  const hero = SITE.hero || {};
  const headline = hero.headline || "End-to-end AI Engineer &";
  const headlineAccent = hero.headlineAccent || "Solutions Architect";
  const kicker = hero.kicker || "AI Engineer · Solutions Architect · End-to-end";
  const subhead = hero.subhead || "";
  const whatIDo = hero.whatIDo || [];

  return (
    <section
      id="hero"
      data-screen-label="hero"
      style={{
        minHeight: "100vh",
        padding: "160px clamp(24px, 6vw, 96px) 80px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        className="grid-2"
        style={{
          maxWidth: 1440,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1.15fr 1fr",
          gap: 56,
          alignItems: "center",
          minHeight: "72vh",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 28,
            }}
          >
            <span
              className="hero-eyebrow-rule"
              style={{ width: 28, height: 1, background: "var(--accent)" }}
            />
            <MonoLabel>{kicker}</MonoLabel>
          </div>
          <h1
            className="hero-headline"
            style={{
              margin: 0,
              fontFamily: "var(--font-sans)",
              fontWeight: 500,
              fontSize: "clamp(44px, 6.4vw, 96px)",
              lineHeight: 0.98,
              letterSpacing: "-0.045em",
              textWrap: "balance",
              animation: "fadeUp .8s cubic-bezier(0.2,0.7,0.3,1) both",
            }}
          >
            {headline}
            <br />
            <span style={{ color: "var(--accent)" }}>{headlineAccent}</span>.
          </h1>
          <p
            style={{
              marginTop: 32,
              maxWidth: 580,
              color: "var(--text-2)",
              fontSize: 18,
              lineHeight: 1.55,
              textWrap: "pretty",
              animation: "fadeUp .9s cubic-bezier(0.2,0.7,0.3,1) .1s both",
            }}
          >
            {linkifyTwyn(subhead)}
          </p>

          <div
            style={{
              display: "flex",
              gap: 14,
              marginTop: 40,
              flexWrap: "wrap",
              animation: "fadeUp 1s cubic-bezier(0.2,0.7,0.3,1) .2s both",
            }}
          >
            <button
              onClick={() => onJump("systems")}
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
                display: "inline-flex",
                alignItems: "center",
                gap: 14,
                borderRadius: 3,
              }}
            >
              View Selected Systems
              <span style={{ color: "var(--accent)" }}>→</span>
            </button>
            <button
              onClick={() => onJump("process")}
              className="ghost-btn"
              style={{
                padding: "14px 22px",
                border: "1px solid var(--border-2)",
                color: "var(--text-2)",
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                borderRadius: 3,
              }}
            >
              Explore My Process
            </button>
            <Link
              to="/writing"
              className="ghost-btn"
              style={{
                padding: "14px 22px",
                border: "1px solid var(--border-2)",
                color: "var(--text-2)",
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                borderRadius: 3,
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              Notes from the Floor
              <span style={{ color: "var(--accent)" }}>→</span>
            </Link>
          </div>

          <div
            style={{
              marginTop: 76,
              paddingTop: 22,
              borderTop: "1px solid var(--border)",
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              gap: 28,
              alignItems: "center",
              animation: "fadeUp 1s cubic-bezier(0.2,0.7,0.3,1) .3s both",
            }}
          >
            <MonoLabel>What I do</MonoLabel>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px 22px",
                color: "var(--text-2)",
                fontSize: 13.5,
              }}
            >
              {whatIDo.map((d) => (
                <span
                  key={d}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <span
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: "50%",
                      background: "var(--text-3)",
                    }}
                  />
                  {d}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div
          style={{
            position: "relative",
            justifySelf: "end",
            width: "100%",
            display: "flex",
            justifyContent: "flex-end",
            animation: "fadeIn 1.4s cubic-bezier(0.2,0.7,0.3,1) .2s both",
          }}
        >
          <SystemCube3D ambientMotion />
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: "clamp(24px, 6vw, 96px)",
          bottom: 28,
          display: "flex",
          gap: 36,
          alignItems: "center",
        }}
      >
        <div className="scroll-hint" style={{ display: "inline-flex" }}>
          <MonoLabel>Scroll ↓</MonoLabel>
        </div>
        <div
          style={{ width: 80, height: 1, background: "var(--border-2)" }}
        />
      </div>
      <div
        className="telemetry-corner"
        style={{
          position: "absolute",
          right: "clamp(24px, 6vw, 96px)",
          bottom: 28,
          width: 260,
        }}
      >
        <Telemetry />
      </div>
    </section>
  );
}

function WhatIBuild() {
  return (
    <Section id="build">
      <SectionHead
        num={1}
        kicker="What I Build"
        title="AI systems that ship to production."
        lead="Each card maps to systems shipped in the last two years — not a service line. Real-time CV running on a live automotive floor, voice copilots in three enterprise plants, a full-stack factory ops platform, and a consumer health app shipped end-to-end as a single engineer."
      />
      <div
        className="grid-4"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0,1fr))",
          gap: 1,
          border: "1px solid var(--border)",
          background: "var(--border)",
        }}
      >
        {CAPABILITY_CARDS.map((c, i) => (
          <Reveal key={c.code} delay={i * 80}>
            <div
              className="cap-card"
              style={{
                background: "var(--bg-1)",
                padding: "32px 28px 32px",
                minHeight: 360,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "relative",
                height: "100%",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <MonoLabel num={c.code}>Module</MonoLabel>
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      background: "var(--accent)",
                      borderRadius: 1,
                    }}
                  />
                </div>
                <h3
                  style={{
                    margin: "36px 0 14px",
                    fontWeight: 500,
                    fontSize: 22,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.15,
                  }}
                >
                  {c.title}
                </h3>
                <p
                  style={{
                    margin: 0,
                    color: "var(--text-2)",
                    fontSize: 14.5,
                    lineHeight: 1.55,
                  }}
                >
                  {c.body}
                </p>
              </div>
              <div style={{ marginTop: 28, opacity: 0.9 }}>
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
    <Section id="systems">
      <SectionHead
        num={2}
        kicker="Selected Systems"
        title="Four projects I’ve shipped to production."
        lead="Two from my work at Twyn (described at the level of detail my client agreement allows), and two personal projects shown in full. Real numbers — 97–98% live accuracy, 99% object counting, 3 enterprise clients, 6-week first deploy — are noted where they belong."
      />
      <div
        className="grid-2"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0,1fr))",
          gap: 1,
          background: "var(--border)",
          border: "1px solid var(--border)",
        }}
      >
        {SYSTEMS.map((s, i) => (
          <Reveal key={s.id} delay={(i % 2) * 90}>
            <button
              onClick={() => onOpen(s.id)}
              className="sys-card"
              style={{
                textAlign: "left",
                padding: 0,
                background: "var(--bg-1)",
                display: "block",
                position: "relative",
                cursor: "pointer",
                width: "100%",
              }}
            >
              <div
                style={{
                  padding: "24px 28px 18px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 20,
                }}
              >
                <div>
                  <MonoLabel num={String(i + 1).padStart(2, "0")}>
                    System
                  </MonoLabel>
                  <h3
                    style={{
                      margin: "14px 0 6px",
                      fontWeight: 500,
                      fontSize: 28,
                      letterSpacing: "-0.025em",
                      lineHeight: 1.05,
                    }}
                  >
                    {s.name}
                  </h3>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11.5,
                      color: "var(--text-3)",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {s.domain}
                  </div>
                </div>
                <div
                  className="sys-card-open"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--accent)",
                    border: "1px solid var(--accent-line)",
                    padding: "6px 10px",
                    borderRadius: 2,
                    letterSpacing: "0.12em",
                    whiteSpace: "nowrap",
                  }}
                >
                  OPEN →
                </div>
              </div>

              <div
                style={{
                  height: 220,
                  borderTop: "1px solid var(--border)",
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
                    left: 16,
                    top: 14,
                    display: "flex",
                    gap: 16,
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color: "var(--text-3)",
                    letterSpacing: "0.14em",
                  }}
                >
                  <span>FIG.{String(i + 1).padStart(2, "0")}</span>
                  <span>{s.motif.toUpperCase()}</span>
                </div>
                <div
                  style={{
                    position: "absolute",
                    right: 16,
                    bottom: 14,
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color: "var(--text-3)",
                    letterSpacing: "0.14em",
                  }}
                >
                  CONFIDENTIAL · ABSTRACTED
                </div>
              </div>

              <div style={{ padding: "22px 28px 28px" }}>
                <p
                  style={{
                    margin: 0,
                    color: "var(--text-2)",
                    fontSize: 15,
                    lineHeight: 1.55,
                    textWrap: "pretty",
                  }}
                >
                  {linkifyTwyn(s.short)}
                </p>
                <div
                  style={{
                    marginTop: 22,
                    display: "flex",
                    gap: 22,
                    color: "var(--text-3)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    letterSpacing: "0.06em",
                  }}
                >
                  <span>{linkifyTwyn(s.role)}</span>
                  <span>·</span>
                  <span>{linkifyTwyn(s.timeline)}</span>
                </div>
              </div>
            </button>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function ObjectStudy() {
  return (
    <Section id="object-study" style={{ background: "var(--bg-1)" }}>
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
          <MonoLabel num={3}>Object Study</MonoLabel>
          <h2
            style={{
              margin: "20px 0 0",
              fontFamily: "var(--font-sans)",
              fontWeight: 500,
              fontSize: "clamp(36px, 4.6vw, 64px)",
              lineHeight: 1.02,
              letterSpacing: "-0.035em",
              textWrap: "balance",
            }}
          >
            How I think
            <br />
            about an <span style={{ color: "var(--accent)" }}>AI system</span>.
          </h2>
          <p
            style={{
              marginTop: 28,
              color: "var(--text-2)",
              fontSize: 16.5,
              lineHeight: 1.6,
              maxWidth: 460,
              textWrap: "pretty",
            }}
          >
            Most production AI projects break at the seams between layers — not
            inside the model. Before I write code, I map the whole topology:
            where data enters, where it transforms, where the model fits, where
            a human takes over, and where the feedback closes the loop. Move
            your cursor to inspect.
          </p>

          <div
            style={{
              marginTop: 36,
              borderTop: "1px solid var(--border)",
              paddingTop: 22,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px 28px",
              }}
            >
              {[
                ["Nodes", "64"],
                ["Edges", "192"],
                ["Hubs", "08"],
                ["Render", "vector · live"],
                ["Projection", "perspective"],
                ["Motion", "auto · cursor-react"],
              ].map(([k, v]) => (
                <div
                  key={k}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    borderBottom: "1px dashed var(--border)",
                    paddingBottom: 8,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10.5,
                      color: "var(--text-3)",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                    }}
                  >
                    {k}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: "var(--text)",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {v}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          style={{
            position: "relative",
            border: "1px solid var(--border)",
            background:
              "linear-gradient(180deg, var(--bg-2), var(--bg-1)), repeating-linear-gradient(0deg, rgba(255,255,255,0.02) 0 1px, transparent 1px 60px), repeating-linear-gradient(90deg, rgba(255,255,255,0.02) 0 1px, transparent 1px 60px)",
            padding: 0,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 16,
              top: 14,
              display: "flex",
              gap: 18,
              zIndex: 2,
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--text-3)",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
            }}
          >
            <span>Obj. 02</span>
            <span>Topology Mesh</span>
            <span style={{ color: "var(--accent)" }}>● live</span>
          </div>
          <div
            style={{
              position: "absolute",
              right: 16,
              top: 14,
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--text-3)",
              letterSpacing: "0.16em",
            }}
          >
            VIEWPORT · 16:10
          </div>

          <TopologyMesh3D ambientMotion />

          <div
            style={{
              position: "absolute",
              left: 16,
              bottom: 14,
              right: 16,
              display: "flex",
              justifyContent: "space-between",
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--text-3)",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
            }}
          >
            <span>k-nearest · k = 3</span>
            <span>fibonacci lattice</span>
            <span>cursor → tilt</span>
          </div>
        </div>
      </div>
    </Section>
  );
}

function Process() {
  return (
    <Section id="process">
      <SectionHead
        num={4}
        kicker="How I Work"
        title="From messy workflows to intelligent systems."
        lead="I start by mapping how work actually happens — people, processes, data, decisions, bottlenecks. Then I identify where AI creates leverage and engineer the system around it."
      />

      <div style={{ position: "relative", padding: "20px 0 0" }}>
        <div
          style={{
            position: "absolute",
            left: 18,
            top: 56,
            bottom: 24,
            width: 1,
            background:
              "linear-gradient(180deg, transparent, var(--border-2) 8%, var(--border-2) 92%, transparent)",
          }}
        />
        {PROCESS_STEPS.map((s, i) => (
          <Reveal key={s.code} delay={i * 80}>
            <div
              className="process-row"
              style={{
                display: "grid",
                gridTemplateColumns: "60px 1fr 1.2fr",
                gap: 32,
                padding: "28px 0",
                borderBottom:
                  i === PROCESS_STEPS.length - 1
                    ? "0"
                    : "1px dashed var(--border)",
                alignItems: "start",
              }}
            >
              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: 11,
                    top: 6,
                    width: 14,
                    height: 14,
                    border: "1px solid var(--accent-line)",
                    background: "var(--bg-0)",
                    borderRadius: 2,
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <span
                    style={{
                      width: 4,
                      height: 4,
                      background: "var(--accent)",
                    }}
                  />
                </span>
                <div
                  style={{
                    marginLeft: 36,
                    fontFamily: "var(--font-mono)",
                    fontSize: 11.5,
                    color: "var(--accent)",
                    letterSpacing: "0.12em",
                  }}
                >
                  STEP · {s.code}
                </div>
              </div>
              <h3
                style={{
                  margin: 0,
                  fontWeight: 500,
                  fontSize: 26,
                  letterSpacing: "-0.025em",
                  lineHeight: 1.1,
                  paddingTop: 2,
                }}
              >
                {s.title}
              </h3>
              <div>
                <p
                  style={{
                    margin: 0,
                    color: "var(--text-2)",
                    fontSize: 15.5,
                    lineHeight: 1.6,
                    textWrap: "pretty",
                  }}
                >
                  {s.body}
                </p>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "6px 10px",
                    marginTop: 18,
                  }}
                >
                  {s.detail.map((d) => (
                    <span
                      key={d}
                      style={{
                        padding: "5px 10px",
                        border: "1px solid var(--border)",
                        borderRadius: 2,
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        color: "var(--text-2)",
                        letterSpacing: "0.04em",
                      }}
                    >
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
          marginTop: 64,
          border: "1px solid var(--border)",
          padding: "32px 28px",
          background: "var(--bg-1)",
        }}
      >
        <MonoLabel>Fig. 02 / System Flow</MonoLabel>
        <div
          className="grid-4"
          style={{
            marginTop: 22,
            display: "grid",
            gridTemplateColumns: "repeat(6, minmax(0,1fr))",
            gap: 12,
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
                padding: "18px 14px",
                border: "1px solid var(--border-2)",
                background: i === 2 ? "var(--accent-soft)" : "var(--bg-2)",
                color: i === 2 ? "var(--accent)" : "var(--text)",
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                textAlign: "center",
                letterSpacing: "0.04em",
                borderColor:
                  i === 2 ? "var(--accent-line)" : "var(--border-2)",
              }}
            >
              {n}
            </div>
          ))}
        </div>
        <div
          style={{
            marginTop: 8,
            color: "var(--text-3)",
            fontFamily: "var(--font-mono)",
            fontSize: 10.5,
            letterSpacing: "0.16em",
            textAlign: "center",
          }}
        >
          ←······························· CONTINUOUS LOOP
          ·······························→
        </div>
      </div>
    </Section>
  );
}

function Capabilities() {
  return (
    <Section id="capabilities">
      <SectionHead
        num={5}
        kicker="Technical Capabilities"
        title="Every tool I work with to ship production AI."
        lead="Grouped by where each piece sits in a real system. Solutions architecture sets the strategy. The AI / ML / voice layer builds the intelligence. The product layer ships the interface. The backend carries everything underneath."
      />

      <div
        style={{
          border: "1px solid var(--border)",
          background: "var(--bg-1)",
        }}
      >
        {CAPS.map((L, i) => (
          <Reveal key={L.layer} delay={i * 80}>
            <div
              className="caps-row"
              style={{
                display: "grid",
                gridTemplateColumns: "180px 1fr 220px",
                alignItems: "stretch",
                borderTop: i === 0 ? "0" : "1px solid var(--border)",
              }}
            >
              <div
                className="caps-side"
                style={{
                  padding: "28px 24px",
                  borderRight: "1px solid var(--border)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  background: i === 1 ? "var(--surface-1)" : "transparent",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--accent)",
                    letterSpacing: "0.16em",
                  }}
                >
                  {L.layer} · LAYER
                </div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 500,
                    letterSpacing: "-0.02em",
                    marginTop: 28,
                  }}
                >
                  {L.name}
                </div>
              </div>
              <div
                style={{
                  padding: "28px 32px",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px 12px",
                }}
              >
                {L.items.map((it) => (
                  <span
                    key={it}
                    style={{
                      padding: "8px 14px",
                      border: "1px solid var(--border)",
                      fontSize: 13.5,
                      color: "var(--text)",
                      background: "var(--bg-2)",
                      borderRadius: 2,
                      letterSpacing: "-0.005em",
                      transition: "border-color .2s ease, transform .2s ease",
                    }}
                  >
                    {it}
                  </span>
                ))}
              </div>
              <div
                className="caps-side"
                style={{
                  borderLeft: "1px solid var(--border)",
                  padding: "28px 24px",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--text-3)",
                  letterSpacing: "0.08em",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  background: i === 1 ? "var(--surface-1)" : "transparent",
                }}
              >
                <div>STATUS · ACTIVE</div>
                <div style={{ color: "var(--text-2)" }}>
                  {String(L.items.length).padStart(2, "0")} CAPABILITIES
                </div>
                <div
                  style={{
                    marginTop: "auto",
                    display: "flex",
                    gap: 4,
                  }}
                >
                  {Array.from({ length: 8 }).map((_, k) => (
                    <span
                      key={k}
                      style={{
                        width: 8,
                        height: 8,
                        background:
                          k < 3 + i
                            ? "var(--accent)"
                            : "rgba(255,255,255,0.1)",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function WritingTeaser() {
  return (
    <Section id="notes">
      <SectionHead
        num={6}
        kicker="From the Notes"
        title="What I’m writing between deployments."
        lead="Essays, field notes, and lab entries from shipping production AI — the longer version of how I think about the work, and a deeper look at what sits behind each case study."
      />
      <div
        className="grid-3"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0,1fr))",
          gap: 1,
          border: "1px solid var(--border)",
          background: "var(--border)",
        }}
      >
        {RECENT_POSTS.map((n, i) => (
          <Reveal key={n.id} delay={i * 80}>
            <Link
              to={`/writing#${n.id}`}
              className="note-card"
              style={{
                background: "var(--bg-1)",
                padding: "30px 28px 32px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: 300,
                textDecoration: "none",
                height: "100%",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      padding: "4px 9px",
                      border: "1px solid var(--border-2)",
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      color: "var(--text-2)",
                      letterSpacing: "0.16em",
                    }}
                  >
                    {KIND_META[n.kind]?.tag || String(n.kind || "").toUpperCase()}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10.5,
                      color: "var(--text-3)",
                      letterSpacing: "0.1em",
                    }}
                  >
                    {n.date} · {n.read}
                  </span>
                </div>
                <h3
                  style={{
                    margin: "28px 0 14px",
                    fontWeight: 500,
                    fontSize: 22,
                    letterSpacing: "-0.022em",
                    lineHeight: 1.18,
                    color: "var(--text)",
                    textWrap: "balance",
                  }}
                >
                  {n.title}
                </h3>
                <p
                  style={{
                    margin: 0,
                    color: "var(--text-2)",
                    fontSize: 14.5,
                    lineHeight: 1.55,
                    textWrap: "pretty",
                  }}
                >
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
          marginTop: 32,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 18,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--text-3)",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          {String(ALL_POSTS.length).padStart(2, "0")} entries · updated monthly
        </div>
        <Link
          to="/writing"
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
          Read all notes
          <span style={{ color: "var(--accent)" }}>→</span>
        </Link>
      </div>
    </Section>
  );
}

function Philosophy() {
  const p = SITE.philosophy || {};
  const headline = p.headline || "Anyone can build the demo.";
  const headlineAccent = p.headlineAccent || "I build what runs on Monday morning.";
  const body = p.body || "";
  const principles = p.principles || "";

  return (
    <Section
      id="philosophy"
      style={{
        background: "var(--bg-1)",
        paddingTop: 168,
        paddingBottom: 168,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 18,
        }}
      >
        <span
          style={{ width: 28, height: 1, background: "var(--accent)" }}
        />
        <MonoLabel num={7}>Belief</MonoLabel>
      </div>

      <h2
        style={{
          margin: 0,
          fontFamily: "var(--font-sans)",
          fontWeight: 500,
          fontSize: "clamp(48px, 7.4vw, 128px)",
          lineHeight: 0.94,
          letterSpacing: "-0.05em",
          textWrap: "balance",
          maxWidth: 1320,
          color: "var(--text)",
        }}
      >
        {headline}
        <br />
        <span style={{ color: "var(--accent)" }}>{headlineAccent}</span>
      </h2>

      <div
        className="grid-2"
        style={{
          marginTop: 56,
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.05fr) minmax(0, 0.95fr)",
          gap: 80,
          alignItems: "start",
        }}
      >
        <p
          style={{
            margin: 0,
            color: "var(--text)",
            fontSize: 22,
            lineHeight: 1.45,
            letterSpacing: "-0.012em",
            textWrap: "pretty",
            maxWidth: 620,
          }}
        >
          {linkifyTwyn(body)}
        </p>
        <div style={{ paddingTop: 8 }}>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--text-3)",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            Working principles
          </div>
          <p
            style={{
              margin: 0,
              color: "var(--text-2)",
              fontSize: 15.5,
              lineHeight: 1.6,
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
          marginTop: 104,
          borderTop: "1px solid var(--border)",
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0,1fr))",
        }}
      >
        {BELIEFS.map((b, i) => (
          <Reveal key={b.code} delay={i * 70}>
            <div
              style={{
                padding: "32px 28px 36px",
                borderRight:
                  i < 3 ? "1px solid var(--border)" : "none",
                display: "flex",
                flexDirection: "column",
                gap: 28,
                minHeight: 220,
                height: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--accent)",
                    letterSpacing: "0.18em",
                  }}
                >
                  {"BELIEF · " + b.code}
                </span>
                <span
                  style={{
                    width: 4,
                    height: 4,
                    background: "var(--accent)",
                    borderRadius: 1,
                  }}
                />
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: 20,
                  lineHeight: 1.25,
                  color: "var(--text)",
                  letterSpacing: "-0.018em",
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
    <Section id="about">
      <SectionHead
        num={8}
        kicker="About"
        title="AI Engineer. Solutions Architect. Systems thinker."
      />
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
              color: "var(--text)",
              textWrap: "pretty",
            }}
          >
            {linkifyTwyn(about.intro)}
          </p>
          <p
            style={{
              marginTop: 22,
              fontSize: 17,
              lineHeight: 1.65,
              color: "var(--text-2)",
              textWrap: "pretty",
            }}
          >
            {linkifyTwyn(about.bio)}
          </p>

          <div
            style={{
              marginTop: 48,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 20,
            }}
          >
            {[
              ["Focus", about.focus],
              ["Based", about.based],
              ["Working with", about.workingWith],
              ["Status", about.status],
            ].map(([k, v]) => (
              <div
                key={k}
                style={{
                  borderTop: "1px solid var(--border)",
                  paddingTop: 14,
                }}
              >
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
                    marginTop: 8,
                    fontSize: 15.5,
                    color: "var(--text)",
                  }}
                >
                  {v}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            border: "1px solid var(--border)",
            background: "var(--bg-1)",
          }}
        >
          <div
            style={{
              aspectRatio: "1 / 1.18",
              background:
                "repeating-linear-gradient(135deg, rgba(255,255,255,0.025) 0 1px, transparent 1px 12px), linear-gradient(180deg, var(--surface-1), var(--bg-2))",
              position: "relative",
              display: "grid",
              placeItems: "center",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--text-3)",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
              }}
            >
              [ Portrait placeholder ]
            </div>
            <div
              style={{
                position: "absolute",
                left: 14,
                top: 14,
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "var(--text-3)",
                letterSpacing: "0.16em",
              }}
            >
              OPERATOR · G.G — 001
            </div>
            <div
              style={{
                position: "absolute",
                right: 14,
                top: 14,
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "var(--accent)",
                letterSpacing: "0.16em",
              }}
            >
              <span className="pulse-dot">●</span> ONLINE
            </div>
            <div
              style={{
                position: "absolute",
                left: 14,
                bottom: 14,
                right: 14,
                display: "flex",
                justifyContent: "space-between",
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "var(--text-3)",
                letterSpacing: "0.16em",
              }}
            >
              <span>FRAME 0014 / 0240</span>
              <span>ASPECT 1:1.18</span>
            </div>
          </div>
          <div
            style={{
              borderTop: "1px solid var(--border)",
              padding: 18,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--text-2)",
              letterSpacing: "0.06em",
            }}
          >
            <div>NAME · GAUTAM GIRDHAR</div>
            <div style={{ textAlign: "right" }}>ROLE · APPLIED AI / SYS</div>
          </div>
        </div>
      </div>
    </Section>
  );
}

function Contact() {
  const c = SITE.contact || {};
  const linkedinDisplay = (c.linkedin || "").replace(/^https?:\/\//, "");
  const githubDisplay = (c.github || "").replace(/^https?:\/\//, "");
  const cards = [
    {
      label: "Email",
      value: c.email,
      href: c.email ? `mailto:${c.email}` : "#",
    },
    {
      label: "LinkedIn",
      value: linkedinDisplay,
      href: c.linkedin || "#",
    },
    {
      label: "GitHub",
      value: githubDisplay,
      href: c.github || "#",
    },
    {
      label: "Phone",
      value: c.phone,
      href: c.phone ? `tel:${String(c.phone).replace(/[^\d+]/g, "")}` : "#",
    },
  ];
  return (
    <Section id="contact" style={{ paddingBottom: 96 }}>
      <MonoLabel num={9}>Contact</MonoLabel>
      <h2
        style={{
          margin: "22px 0 0",
          maxWidth: 1200,
          fontFamily: "var(--font-sans)",
          fontWeight: 500,
          fontSize: "clamp(40px, 6vw, 96px)",
          lineHeight: 0.98,
          letterSpacing: "-0.04em",
          textWrap: "balance",
        }}
      >
        Let’s build intelligent systems
        <br />
        that actually <span style={{ color: "var(--accent)" }}>work</span>.
      </h2>

      <div
        className="grid-4"
        style={{
          marginTop: 56,
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0,1fr))",
          gap: 1,
          background: "var(--border)",
          border: "1px solid var(--border)",
        }}
      >
        {cards.map((c) => (
          <a
            key={c.label}
            href={c.href}
            className="contact-card"
            style={{
              background: "var(--bg-1)",
              padding: "28px 24px 32px",
              minHeight: 160,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <MonoLabel>{c.label}</MonoLabel>
            <div
              style={{
                fontSize: 18,
                letterSpacing: "-0.01em",
                wordBreak: "break-word",
              }}
            >
              {c.value}
            </div>
          </a>
        ))}
      </div>
    </Section>
  );
}
