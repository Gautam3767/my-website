import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useInView, usePrefersReducedMotion } from "../hooks/useMedia.js";

function project3D(x, y, z, rotX, rotY, focal = 720) {
  const cy = Math.cos(rotY);
  const sy = Math.sin(rotY);
  const x1 = x * cy - z * sy;
  const z1 = x * sy + z * cy;
  const cx = Math.cos(rotX);
  const sx = Math.sin(rotX);
  const y1 = y * cx - z1 * sx;
  const z2 = y * sx + z1 * cx;
  const s = focal / (focal + z2);
  return { x: x1 * s, y: y1 * s, z: z2, s };
}

const BASE = { x: 0.24, y: 0.55 };
const clamp = (v, m = 0.6) => Math.max(-m, Math.min(m, v));

// The animation only runs while the figure is on screen, the tab is
// visible, nothing is open on top of it, and the visitor hasn't asked for
// reduced motion. Otherwise it holds its last pose and costs nothing.
export default function SystemCube3D({ ambientMotion = true, paused = false }) {
  const containerRef = useRef(null);
  const [rot, setRot] = useState(BASE);
  const inView = useInView(containerRef);
  const reduce = usePrefersReducedMotion();
  const run = inView && !paused && !reduce;
  const motion = useRef({ cur: { ...BASE }, target: { ...BASE }, t: 0, pointer: null });
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");

  useEffect(() => {
    if (!run) return;
    const m = motion.current;
    let raf = 0;
    let last = performance.now();

    const onMove = (e) => {
      if (e.pointerType && e.pointerType !== "mouse") return;
      m.pointer = [e.clientX, e.clientY];
    };
    const onOut = (e) => {
      if (!e.relatedTarget) m.pointer = null;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("mouseout", onOut);

    const tick = (now) => {
      // time-based, so 120 Hz screens don't run it twice as fast
      const dt = Math.min(now - last, 50) / 1000;
      last = now;
      if (ambientMotion) m.t += dt;

      const el = containerRef.current;
      if (m.pointer && el) {
        const r = el.getBoundingClientRect();
        // clamped, so reading the headline doesn't wrench the figure round
        const dx = clamp((m.pointer[0] - (r.left + r.width / 2)) / r.width);
        const dy = clamp((m.pointer[1] - (r.top + r.height / 2)) / r.height);
        m.target.x = BASE.x + dy * 0.32;
        m.target.y = BASE.y + dx * 0.7;
      } else {
        m.target.x = BASE.x;
        m.target.y = BASE.y;
      }

      // both axes eased the same way
      const k = 1 - Math.pow(1 - 0.08, dt * 60);
      m.cur.x += (m.target.x - m.cur.x) * k;
      m.cur.y += (m.target.y - m.cur.y) * k;

      // a slow, bounded sway instead of an endless spin — the layer
      // labels never swing round behind the stack
      const sway = ambientMotion ? Math.sin(m.t * 0.45) * 0.3 : 0;
      setRot({ x: m.cur.x, y: m.cur.y + sway });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("mouseout", onOut);
    };
  }, [run, ambientMotion]);

  const W = 600;
  const H = 600;
  const CX = W / 2;
  const CY = H / 2;
  const a = 130;
  const b = 200;
  const c = 130;

  const corners = [
    [-a, -b, -c],
    [a, -b, -c],
    [a, b, -c],
    [-a, b, -c],
    [-a, -b, c],
    [a, -b, c],
    [a, b, c],
    [-a, b, c],
  ];
  const edges = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 4],
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7],
  ];
  const p = corners.map(([x, y, z]) => project3D(x, y, z, rot.x, rot.y));

  const strataDef = [
    { y: -150, code: "05", name: "DECISION", sub: "human-in-the-loop" },
    { y: -75, code: "04", name: "PRODUCT", sub: "dashboard · copilot · alerts" },
    {
      y: 0,
      code: "03",
      name: "INTELLIGENCE",
      sub: "rag · forecast · classify · agent",
      focal: true,
    },
    { y: 75, code: "02", name: "PROCESS", sub: "ingest · normalize · embed" },
    { y: 150, code: "01", name: "DATA", sub: "scada · erp · sensors · docs" },
  ];

  const sa = a - 12;
  const sc = c - 12;
  const strata = strataDef.map((s) => {
    const c4 = [
      [-sa, s.y, -sc],
      [sa, s.y, -sc],
      [sa, s.y, sc],
      [-sa, s.y, sc],
    ];
    const pp = c4.map(([x, y, z]) => project3D(x, y, z, rot.x, rot.y));
    const labelP = project3D(-sa - 6, s.y, sc + 4, rot.x, rot.y);
    return { ...s, pp, labelP };
  });

  const packets = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 12; i++) {
      arr.push([
        Math.sin(i * 1.3) * (a + 30),
        (i / 12) * 360 - 180,
        Math.cos(i * 1.3) * (c + 30),
        i * 0.6,
      ]);
    }
    return arr;
  }, []);
  const packetsP = packets.map(([x, y, z, t]) => ({
    ...project3D(x, y, z, rot.x, rot.y),
    t,
  }));

  const edgeOrdered = edges
    .map(([i, j]) => ({ i, j, z: (p[i].z + p[j].z) / 2 }))
    .sort((a, b) => b.z - a.z);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        aspectRatio: "1/1",
        maxWidth: 640,
        position: "relative",
      }}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height="100%"
        style={{ display: "block", overflow: "visible" }}
        role="img"
        aria-label="Figure 1, the intelligence stack: five layers from data, through process and intelligence, to product and a human decision."
      >
        <defs>
          <radialGradient id={`${uid}-atm`} cx="0.5" cy="0.5" r="0.55">
            <stop offset="0" stopColor="var(--accent)" stopOpacity="0.06" />
            <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`${uid}-beam`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--accent)" stopOpacity="0" />
            <stop offset="0.5" stopColor="var(--accent)" stopOpacity="0.7" />
            <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width={W} height={H} fill={`url(#${uid}-atm)`} />

        <ellipse
          cx={CX}
          cy={CY + 200}
          rx={a + 40}
          ry={20}
          fill="rgba(28,26,19,0.14)"
          opacity="0.7"
        />

        {edgeOrdered
          .filter((e) => e.z >= 0)
          .map((e, idx) => (
            <line
              key={"eb" + idx}
              x1={CX + p[e.i].x}
              y1={CY + p[e.i].y}
              x2={CX + p[e.j].x}
              y2={CY + p[e.j].y}
              stroke="var(--border)"
              strokeWidth="0.8"
              strokeDasharray="2 4"
            />
          ))}

        {(() => {
          const top = project3D(0, -b - 20, 0, rot.x, rot.y);
          const bot = project3D(0, b + 20, 0, rot.x, rot.y);
          return (
            <line
              x1={CX + top.x}
              y1={CY + top.y}
              x2={CX + bot.x}
              y2={CY + bot.y}
              stroke={`url(#${uid}-beam)`}
              strokeWidth="1.2"
            />
          );
        })()}

        {strata
          .map((s, idx) => ({
            ...s,
            idx,
            avgZ: (s.pp[0].z + s.pp[2].z) / 2,
          }))
          .sort((a, b) => b.avgZ - a.avgZ)
          .map((s) => {
            const pts = s.pp
              .map((pt) => `${CX + pt.x},${CY + pt.y}`)
              .join(" ");
            const fill = s.focal
              ? "rgba(224,66,12,0.14)"
              : "rgba(245,242,234,0.82)";
            const stroke = s.focal ? "var(--accent)" : "var(--border-2)";
            return (
              <g key={"st" + s.idx}>
                <polygon
                  points={pts}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth="1"
                />
                <line
                  x1={CX + s.pp[3].x}
                  y1={CY + s.pp[3].y}
                  x2={CX + s.pp[2].x}
                  y2={CY + s.pp[2].y}
                  stroke={s.focal ? "var(--accent)" : "var(--accent-line)"}
                  strokeWidth="1"
                  opacity={s.focal ? 1 : 0.45}
                />
                {Array.from({ length: 8 }).map((_, k) => {
                  const t = (k + 0.5) / 8;
                  const x = s.pp[3].x + (s.pp[2].x - s.pp[3].x) * t;
                  const y = s.pp[3].y + (s.pp[2].y - s.pp[3].y) * t;
                  return (
                    <circle
                      key={k}
                      cx={CX + x}
                      cy={CY + y}
                      r={1.4}
                      fill={s.focal ? "var(--accent)" : "var(--text-3)"}
                      opacity="0.85"
                    />
                  );
                })}
              </g>
            );
          })}

        {edgeOrdered
          .filter((e) => e.z < 0)
          .map((e, idx) => (
            <line
              key={"ef" + idx}
              x1={CX + p[e.i].x}
              y1={CY + p[e.i].y}
              x2={CX + p[e.j].x}
              y2={CY + p[e.j].y}
              stroke="var(--border-2)"
              strokeWidth="1"
            />
          ))}

        {p.map((pt, i) => (
          <g key={"c" + i}>
            <circle
              cx={CX + pt.x}
              cy={CY + pt.y}
              r="2.5"
              fill="var(--bg-0)"
              stroke="var(--accent-line)"
            />
          </g>
        ))}

        {packetsP.map((pk, i) => (
          <circle
            key={"pk" + i}
            cx={CX + pk.x}
            cy={CY + pk.y}
            r={1.4 * pk.s}
            fill="var(--accent)"
            opacity={Math.max(0.18, 0.65 * pk.s)}
          />
        ))}

        {strata.map((s, i) => (
          <g
            key={"l" + i}
            transform={`translate(${CX + s.labelP.x - 6}, ${CY + s.labelP.y})`}
          >
            <text
              textAnchor="end"
              fontFamily="IBM Plex Mono"
              fontSize="9.5"
              fill={s.focal ? "var(--accent)" : "var(--text-3)"}
              letterSpacing="1.6"
            >
              {s.code} · {s.name}
            </text>
            <text
              textAnchor="end"
              y="13"
              fontFamily="Geist, ui-sans-serif, system-ui, sans-serif"
              fontSize="11"
              fill="var(--text-2)"
              letterSpacing="-0.1"
            >
              {s.sub}
            </text>
          </g>
        ))}

        {[
          [20, 20],
          [W - 20, 20],
          [20, H - 20],
          [W - 20, H - 20],
        ].map(([x, y], i) => (
          <g key={i} stroke="var(--border-2)" strokeWidth="1">
            <line x1={x - 6} x2={x + 6} y1={y} y2={y} />
            <line x1={x} x2={x} y1={y - 6} y2={y + 6} />
          </g>
        ))}
      </svg>

      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          // clear of the registration mark in the corner
          left: 36,
          top: 10,
          display: "flex",
          gap: 18,
          fontFamily: "var(--font-mono)",
          fontSize: 10.5,
          letterSpacing: "0.16em",
          color: "var(--text-3)",
          textTransform: "uppercase",
        }}
      >
        <span>Fig. 01</span>
        <span>The Intelligence Stack</span>
        <span style={{ color: "var(--accent-text)" }}>
          ● {reduce ? "still" : "live"}
        </span>
      </div>
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          right: 6,
          bottom: 6,
          fontVariantNumeric: "tabular-nums",
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.16em",
          color: "var(--text-3)",
          textTransform: "uppercase",
        }}
      >
        rot ·{" "}
        {String(Math.round((((rot.y * 180) / Math.PI) % 360 + 360) % 360)).padStart(3, "0")}
        °
      </div>
    </div>
  );
}
