import { useEffect, useRef, useState } from "react";

function project3D(x, y, z, rotX, rotY, focal = 1250) {
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

// The diagram the copy describes: data enters, transforms, hits the model,
// reaches a human, and feedback returns. Drawn as a tilted schematic board.
const PADS = [
  { id: "src-a", x: -310, z: -85, w: 26, d: 16, kind: "source" },
  { id: "src-b", x: -310, z: 0, w: 26, d: 16, kind: "source" },
  { id: "src-c", x: -310, z: 85, w: 26, d: 16, kind: "source" },
  { id: "ingest", x: -155, z: 0, w: 36, d: 22 },
  { id: "model", x: 0, z: 0, w: 46, d: 28, kind: "focal" },
  { id: "iface", x: 155, z: 0, w: 36, d: 22 },
  { id: "human", x: 310, z: 0, w: 30, d: 30, kind: "human" },
];

const LABELS = [
  { x: -310, z: 0, code: "01", name: "DATA", sub: "scada · erp · sensors" },
  { x: -155, z: 0, code: "02", name: "INGEST", sub: "normalize · embed" },
  { x: 0, z: 0, code: "03", name: "MODEL", sub: "classify · forecast · reason", focal: true },
  { x: 155, z: 0, code: "04", name: "INTERFACE", sub: "dashboard · copilot · alerts" },
  { x: 310, z: 0, code: "05", name: "DECISION", sub: "human-in-the-loop" },
];

const MAIN_PATH = [
  [-310, 0, 0],
  [-155, 0, 0],
  [0, 0, 0],
  [155, 0, 0],
  [310, 0, 0],
];

// negative z projects toward the viewer — the return lane sits in front
const FEEDBACK_PATH = [
  [310, 0, 0],
  [310, 0, -138],
  [-310, 0, -138],
  [-310, 0, 0],
];

function pathPoint(path, t) {
  // constant-speed interpolation along a 3D polyline
  const segs = [];
  let total = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const [ax, ay, az] = path[i];
    const [bx, by, bz] = path[i + 1];
    const len = Math.hypot(bx - ax, by - ay, bz - az);
    segs.push(len);
    total += len;
  }
  let dist = t * total;
  for (let i = 0; i < segs.length; i++) {
    if (dist <= segs[i]) {
      const f = segs[i] === 0 ? 0 : dist / segs[i];
      const [ax, ay, az] = path[i];
      const [bx, by, bz] = path[i + 1];
      return [ax + (bx - ax) * f, ay + (by - ay) * f, az + (bz - az) * f];
    }
    dist -= segs[i];
  }
  return path[path.length - 1];
}

export default function SystemFlow3D({
  ambientMotion = true,
  accent = "var(--blue)",
}) {
  const containerRef = useRef(null);
  const [frame, setFrame] = useState({ rx: 0.52, ry: 0, t: 0 });

  useEffect(() => {
    let raf;
    const target = { x: 0.52, y: 0 };
    const cur = { x: 0.52, y: 0 };
    let accum = 0;

    const onMove = (e) => {
      const el = containerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
      const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      target.x = 0.52 + dy * 0.22;
      target.y = dx * 0.4;
    };
    const el = containerRef.current;
    if (el) el.addEventListener("mousemove", onMove);

    const tick = () => {
      if (ambientMotion) accum += 0.016;
      cur.x += (target.x - cur.x) * 0.06;
      const sway = ambientMotion ? Math.sin(accum * 0.55) * 0.1 : 0;
      cur.y += (target.y + sway - cur.y) * 0.06;
      setFrame({ rx: cur.x, ry: cur.y, t: accum });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      if (el) el.removeEventListener("mousemove", onMove);
    };
  }, [ambientMotion]);

  const W = 780;
  const H = 390;
  const CX = W / 2;
  const CY = H / 2 + 6;
  const { rx, ry, t } = frame;
  const P = (x, y, z) => {
    const p = project3D(x, y, z, rx, ry);
    return { ...p, x: CX + p.x, y: CY + p.y };
  };
  const pts = (list) => list.map(([x, y, z]) => P(x, y, z));
  const poly = (list) =>
    pts(list)
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(" ");

  // plane grid
  const gridLines = [];
  for (let x = -340; x <= 340; x += 85) {
    gridLines.push([
      [x, 0, -160],
      [x, 0, 160],
    ]);
  }
  for (let z = -160; z <= 160; z += 80) {
    gridLines.push([
      [-340, 0, z],
      [340, 0, z],
    ]);
  }

  const padShape = (pad) =>
    pts([
      [pad.x - pad.w, 0, pad.z - pad.d],
      [pad.x + pad.w, 0, pad.z - pad.d],
      [pad.x + pad.w, 0, pad.z + pad.d],
      [pad.x - pad.w, 0, pad.z + pad.d],
    ]);

  // animated packets
  const mainPackets = [0, 0.2, 0.4, 0.6, 0.8].map((off) =>
    pathPoint(MAIN_PATH, (t * 0.11 + off) % 1)
  );
  const fbPackets = [0, 0.34, 0.67].map((off) =>
    pathPoint(FEEDBACK_PATH, (t * 0.055 + off) % 1)
  );

  return (
    <div ref={containerRef} style={{ width: "100%", position: "relative" }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height="100%"
        style={{ display: "block" }}
      >
        {/* plane grid */}
        {gridLines.map((l, i) => (
          <path
            key={"g" + i}
            d={poly(l)}
            fill="none"
            stroke="var(--line)"
            strokeWidth="0.6"
          />
        ))}

        {/* feedback lane — dashed return */}
        <path
          d={poly(FEEDBACK_PATH)}
          fill="none"
          stroke="var(--ink-3)"
          strokeWidth="1"
          strokeDasharray="3 6"
        />
        {/* retraining spur into the model */}
        <path
          d={poly([
            [0, 0, -138],
            [0, 0, -30],
          ])}
          fill="none"
          stroke="var(--ink-3)"
          strokeWidth="1"
          strokeDasharray="3 6"
        />

        {/* source branches */}
        {[-85, 85].map((z) => (
          <path
            key={"b" + z}
            d={poly([
              [-310, 0, z],
              [-285, 0, z],
              [-200, 0, 0],
            ])}
            fill="none"
            stroke={accent}
            strokeOpacity="0.45"
            strokeWidth="0.9"
          />
        ))}

        {/* main spine */}
        <path
          d={poly(MAIN_PATH)}
          fill="none"
          stroke={accent}
          strokeOpacity="0.8"
          strokeWidth="1.4"
        />
        {/* direction ticks on the spine */}
        {[-232, -77, 77, 232].map((x) => {
          const a = P(x - 7, 0, -5);
          const b = P(x + 2, 0, 0);
          const c = P(x - 7, 0, 5);
          return (
            <path
              key={"ar" + x}
              d={`M ${a.x} ${a.y} L ${b.x} ${b.y} L ${c.x} ${c.y}`}
              fill="none"
              stroke={accent}
              strokeOpacity="0.8"
              strokeWidth="1.2"
            />
          );
        })}

        {/* pads */}
        {PADS.map((pad) => {
          const sh = padShape(pad);
          const d =
            sh
              .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
              .join(" ") + " Z";
          const focal = pad.kind === "focal";
          const human = pad.kind === "human";
          if (human) {
            const c = P(pad.x, 0, pad.z);
            const e1 = P(pad.x + pad.w, 0, pad.z);
            const rxE = Math.abs(e1.x - c.x);
            return (
              <g key={pad.id}>
                <ellipse
                  cx={c.x}
                  cy={c.y}
                  rx={rxE}
                  ry={rxE * Math.sin(rx)}
                  fill="var(--paper-1)"
                  stroke="var(--ink-2)"
                  strokeWidth="1.1"
                />
                <ellipse
                  cx={c.x}
                  cy={c.y}
                  rx={rxE * 0.55}
                  ry={rxE * 0.55 * Math.sin(rx)}
                  fill="none"
                  stroke="var(--ink-2)"
                  strokeWidth="0.8"
                  strokeDasharray="2 3"
                />
              </g>
            );
          }
          return (
            <path
              key={pad.id}
              d={d}
              fill={focal ? "rgba(224,66,12,0.13)" : "var(--paper-1)"}
              stroke={focal ? "var(--accent)" : accent}
              strokeOpacity={focal ? 1 : 0.7}
              strokeWidth={focal ? 1.4 : 1}
            />
          );
        })}

        {/* packets */}
        {mainPackets.map(([x, y, z], i) => {
          const p = P(x, y, z);
          return (
            <circle
              key={"mp" + i}
              cx={p.x}
              cy={p.y}
              r={2.4 * p.s}
              fill={accent}
              opacity="0.9"
            />
          );
        })}
        {fbPackets.map(([x, y, z], i) => {
          const p = P(x, y, z);
          return (
            <circle
              key={"fp" + i}
              cx={p.x}
              cy={p.y}
              r={1.9 * p.s}
              fill="var(--ink-3)"
              opacity="0.9"
            />
          );
        })}

        {/* label stakes */}
        {LABELS.map((l) => {
          const base = P(l.x, 0, l.z);
          const top = P(l.x, -64, l.z);
          const color = l.focal ? "var(--accent)" : "var(--ink-2)";
          return (
            <g key={l.code}>
              <line
                x1={base.x}
                y1={base.y}
                x2={top.x}
                y2={top.y}
                stroke={color}
                strokeOpacity="0.55"
                strokeWidth="0.8"
              />
              <circle cx={top.x} cy={top.y} r="1.6" fill={color} />
              <text
                x={top.x}
                y={top.y - 18}
                textAnchor="middle"
                fontFamily="IBM Plex Mono"
                fontSize="10.5"
                fontWeight="500"
                fill={color}
                letterSpacing="1.6"
              >
                {l.code} · {l.name}
              </text>
              <text
                x={top.x}
                y={top.y - 6}
                textAnchor="middle"
                fontFamily="IBM Plex Mono"
                fontSize="8"
                fill="var(--ink-3)"
                letterSpacing="0.6"
              >
                {l.sub}
              </text>
            </g>
          );
        })}

        {/* feedback label, pinned to the return lane */}
        {(() => {
          const p = P(0, 0, -162);
          return (
            <text
              x={p.x}
              y={p.y + 16}
              textAnchor="middle"
              fontFamily="IBM Plex Mono"
              fontSize="9"
              fill="var(--ink-3)"
              letterSpacing="1.8"
            >
              ← FEEDBACK · RETRAINING QUEUE
            </text>
          );
        })()}

        {/* registration marks */}
        {[
          [16, 16],
          [W - 16, 16],
          [16, H - 16],
          [W - 16, H - 16],
        ].map(([x, y], i) => (
          <g key={i} stroke="var(--line-2)" strokeWidth="1">
            <line x1={x - 5} x2={x + 5} y1={y} y2={y} />
            <line x1={x} x2={x} y1={y - 5} y2={y + 5} />
          </g>
        ))}
      </svg>
    </div>
  );
}
