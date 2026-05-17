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

export default function TopologyMesh3D({
  ambientMotion = true,
  density = 64,
  accent = "var(--accent)",
}) {
  const containerRef = useRef(null);
  const [rot, setRot] = useState({ x: 0.22, y: 0 });

  useEffect(() => {
    let raf;
    const target = { x: 0.22, y: 0 };
    let accum = 0;
    const cur = { x: 0.22, y: 0 };

    const onMove = (e) => {
      const el = containerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
      const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      target.x = 0.22 + dy * 0.4;
      target.y = dx * 0.9;
    };

    const el = containerRef.current;
    if (el) el.addEventListener("mousemove", onMove);

    const tick = () => {
      if (ambientMotion) accum += 0.0028;
      cur.x += (target.x - cur.x) * 0.06;
      cur.y = target.y + accum;
      setRot({ x: cur.x, y: cur.y });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      if (el) el.removeEventListener("mousemove", onMove);
    };
  }, [ambientMotion]);

  const N = density;
  const R = 230;

  const nodes = useMemo(() => {
    const arr = [];
    const phi = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const yt = 1 - (i / (N - 1)) * 2;
      const rad = Math.sqrt(1 - yt * yt);
      const theta = phi * i;
      arr.push([
        Math.cos(theta) * rad * R,
        yt * R,
        Math.sin(theta) * rad * R,
      ]);
    }
    return arr;
  }, [N, R]);

  const hubs = useMemo(
    () => new Set([3, 11, 19, 28, 37, 46, 54, 60].filter((x) => x < N)),
    [N]
  );

  const edges = useMemo(() => {
    const k = 3;
    const es = new Set();
    for (let i = 0; i < N; i++) {
      const d = [];
      for (let j = 0; j < N; j++) {
        if (i === j) continue;
        const dx = nodes[i][0] - nodes[j][0];
        const dy = nodes[i][1] - nodes[j][1];
        const dz = nodes[i][2] - nodes[j][2];
        d.push([j, dx * dx + dy * dy + dz * dz]);
      }
      d.sort((a, b) => a[1] - b[1]);
      for (let m = 0; m < k; m++) {
        const a = Math.min(i, d[m][0]);
        const b = Math.max(i, d[m][0]);
        es.add(a + "-" + b);
      }
    }
    return Array.from(es).map((s) => s.split("-").map(Number));
  }, [nodes, N]);

  const W = 880;
  const H = 560;
  const CX = W / 2;
  const CY = H / 2;
  const proj = nodes.map(([x, y, z]) => project3D(x, y, z, rot.x, rot.y, 1100));

  const ringRots = [-1.0, -0.6, -0.2, 0.2, 0.6, 1.0];
  const ringPoints = (yt) => {
    const r = Math.sqrt(1 - yt * yt) * R;
    return Array.from({ length: 40 }).map((_, k) => {
      const t = (k / 40) * Math.PI * 2;
      return [Math.cos(t) * r, yt * R, Math.sin(t) * r];
    });
  };

  return (
    <div ref={containerRef} style={{ width: "100%", position: "relative" }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height="100%"
        style={{ display: "block" }}
      >
        <defs>
          <radialGradient id="meshGlow" cx="0.5" cy="0.5" r="0.45">
            <stop offset="0" stopColor={accent} stopOpacity="0.08" />
            <stop offset="1" stopColor={accent} stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect x="0" y="0" width={W} height={H} fill="url(#meshGlow)" />

        {ringRots.map((yt, i) => {
          const pts = ringPoints(yt).map(([x, y, z]) =>
            project3D(x, y, z, rot.x, rot.y, 1100)
          );
          const d =
            pts
              .map(
                (p, idx) =>
                  `${idx === 0 ? "M" : "L"} ${CX + p.x} ${CY + p.y}`
              )
              .join(" ") + " Z";
          return (
            <path
              key={"r" + i}
              d={d}
              fill="none"
              stroke="var(--border)"
              strokeWidth="0.7"
            />
          );
        })}

        {edges
          .map(([a, b]) => ({ a, b, z: (proj[a].z + proj[b].z) / 2 }))
          .sort((a, b) => b.z - a.z)
          .map(({ a, b }, i) => {
            const pa = proj[a];
            const pb = proj[b];
            const front = (pa.z + pb.z) / 2 < 0;
            const op = front ? 0.55 : 0.16;
            return (
              <line
                key={"e" + i}
                x1={CX + pa.x}
                y1={CY + pa.y}
                x2={CX + pb.x}
                y2={CY + pb.y}
                stroke={accent}
                strokeOpacity={op}
                strokeWidth={front ? 0.7 : 0.4}
              />
            );
          })}

        {proj.map((pt, i) => {
          const front = pt.z < 0;
          const isHub = hubs.has(i);
          const size = isHub ? 3.6 * pt.s : 1.8 * pt.s;
          const fill = isHub
            ? accent
            : front
            ? "var(--text-2)"
            : "var(--text-3)";
          const op = Math.max(0.25, front ? pt.s : pt.s * 0.55);
          return (
            <g key={"n" + i}>
              {isHub && front && (
                <circle
                  cx={CX + pt.x}
                  cy={CY + pt.y}
                  r={size + 3}
                  fill="none"
                  stroke={accent}
                  strokeOpacity="0.45"
                  strokeWidth="0.6"
                />
              )}
              <circle
                cx={CX + pt.x}
                cy={CY + pt.y}
                r={size}
                fill={fill}
                opacity={op}
              />
            </g>
          );
        })}

        {Array.from(hubs).map((idx, i) => {
          const pt = proj[idx];
          if (!pt || pt.z >= 0) return null;
          const labels = [
            "INGEST",
            "RAG",
            "FORECAST",
            "CLASSIFY",
            "COPILOT",
            "ROUTE",
            "REVIEW",
            "ALERT",
          ];
          return (
            <g
              key={"h" + i}
              transform={`translate(${CX + pt.x + 8}, ${CY + pt.y - 6})`}
            >
              <line
                x1="-4"
                y1="6"
                x2="0"
                y2="6"
                stroke={accent}
                strokeWidth="0.6"
              />
              <text
                x="2"
                y="9"
                fontFamily="IBM Plex Mono"
                fontSize="9"
                fill={accent}
                letterSpacing="1.4"
              >
                {labels[i % labels.length]}
              </text>
            </g>
          );
        })}

        {[
          [16, 16],
          [W - 16, 16],
          [16, H - 16],
          [W - 16, H - 16],
        ].map(([x, y], i) => (
          <g key={i} stroke="var(--border-2)" strokeWidth="1">
            <line x1={x - 5} x2={x + 5} y1={y} y2={y} />
            <line x1={x} x2={x} y1={y - 5} y2={y + 5} />
          </g>
        ))}
      </svg>
    </div>
  );
}
