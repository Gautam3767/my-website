import { useEffect, useMemo, useRef, useState } from "react";

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

export default function SystemCube3D({ ambientMotion = true }) {
  const containerRef = useRef(null);
  const [rot, setRot] = useState({ x: 0.24, y: 0.55 });

  useEffect(() => {
    let raf;
    const target = { x: 0.24, y: 0.55 };
    let accum = 0;
    const cur = { x: 0.24, y: 0.55 };

    const onMove = (e) => {
      const el = containerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
      const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      target.x = 0.24 + dy * 0.32;
      target.y = 0.55 + dx * 0.7;
    };
    window.addEventListener("mousemove", onMove);

    const tick = () => {
      if (ambientMotion) accum += 0.0026;
      cur.x += (target.x - cur.x) * 0.08;
      cur.y = target.y + accum;
      setRot({ x: cur.x, y: cur.y });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
    };
  }, [ambientMotion]);

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
      >
        <defs>
          <radialGradient id="cubeAtm" cx="0.5" cy="0.5" r="0.55">
            <stop offset="0" stopColor="var(--accent)" stopOpacity="0.06" />
            <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="beamG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--accent)" stopOpacity="0" />
            <stop offset="0.5" stopColor="var(--accent)" stopOpacity="0.7" />
            <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width={W} height={H} fill="url(#cubeAtm)" />

        <ellipse
          cx={CX}
          cy={CY + 200}
          rx={a + 40}
          ry={20}
          fill="rgba(0,0,0,0.55)"
          opacity="0.6"
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
              stroke="url(#beamG)"
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
            const fill = s.focal ? "var(--accent-soft)" : "rgba(20,28,38,0.72)";
            const stroke = s.focal ? "var(--accent-line)" : "var(--border-2)";
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
              fontFamily="Geist"
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
        style={{
          position: "absolute",
          left: 6,
          top: 6,
          display: "flex",
          gap: 18,
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.16em",
          color: "var(--text-3)",
          textTransform: "uppercase",
        }}
      >
        <span>Obj. 01</span>
        <span>Intelligence Cube</span>
        <span style={{ color: "var(--accent)" }}>● rendering</span>
      </div>
      <div
        style={{
          position: "absolute",
          right: 6,
          bottom: 6,
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.16em",
          color: "var(--text-3)",
          textTransform: "uppercase",
        }}
      >
        rot ·{" "}
        {(((rot.y * 180) / Math.PI) % 360)
          .toFixed(0)
          .padStart(3, "0")}
        °
      </div>
    </div>
  );
}
