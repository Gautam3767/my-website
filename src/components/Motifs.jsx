export function SystemPreviewMotif({ kind, color }) {
  const stroke = color || "var(--accent)";

  if (kind === "topology") {
    return (
      <svg
        viewBox="0 0 320 200"
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid slice"
      >
        <g opacity="0.35" stroke="rgba(255,255,255,0.08)">
          {Array.from({ length: 10 }).map((_, i) => (
            <line key={"v" + i} x1={i * 32} x2={i * 32} y1={0} y2={200} />
          ))}
          {Array.from({ length: 7 }).map((_, i) => (
            <line key={"h" + i} x1={0} x2={320} y1={i * 32} y2={i * 32} />
          ))}
        </g>
        {[
          [40, 40],
          [100, 70],
          [160, 40],
          [220, 80],
          [280, 40],
          [40, 140],
          [120, 140],
          [200, 150],
          [260, 130],
        ].map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="3" fill={stroke} />
            <rect
              x={x - 10}
              y={y - 12}
              width="20"
              height="24"
              stroke="rgba(255,255,255,0.16)"
              fill="none"
            />
          </g>
        ))}
        <path
          d="M40 40 L100 70 L160 40 L220 80 L280 40"
          stroke={stroke}
          fill="none"
          opacity="0.6"
        />
        <path
          d="M40 140 L120 140 L200 150 L260 130"
          stroke={stroke}
          fill="none"
          opacity="0.6"
        />
        <path d="M100 70 L120 140" stroke="rgba(255,255,255,0.2)" />
        <path d="M220 80 L200 150" stroke="rgba(255,255,255,0.2)" />
      </svg>
    );
  }

  if (kind === "grid") {
    return (
      <svg
        viewBox="0 0 320 200"
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid slice"
      >
        {Array.from({ length: 8 }).map((_, r) =>
          Array.from({ length: 14 }).map((_, c) => {
            const v = ((r * 13 + c * 7) % 11) / 11;
            return (
              <rect
                key={r + "-" + c}
                x={10 + c * 22}
                y={20 + r * 22}
                width="18"
                height="18"
                fill={v > 0.6 ? stroke : "rgba(255,255,255,0.06)"}
                opacity={v > 0.6 ? 0.18 + v * 0.4 : 0.5}
              />
            );
          })
        )}
        <polyline
          points="0,170 30,160 60,150 90,140 120,120 150,110 180,90 210,80 240,60 270,55 300,40 320,30"
          stroke={stroke}
          strokeWidth="1.5"
          fill="none"
        />
      </svg>
    );
  }

  if (kind === "thermal") {
    return (
      <svg
        viewBox="0 0 320 200"
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="th" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor={stroke} stopOpacity="0.5" />
            <stop offset="1" stopColor={stroke} stopOpacity="0" />
          </radialGradient>
        </defs>
        {Array.from({ length: 5 }).map((_, i) => (
          <circle
            key={i}
            cx="160"
            cy="100"
            r={20 + i * 22}
            stroke="rgba(255,255,255,0.12)"
            fill="none"
          />
        ))}
        <circle cx="160" cy="100" r="14" fill="url(#th)" />
        <circle cx="160" cy="100" r="3" fill={stroke} />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
          const r1 = 24;
          const r2 = 70;
          const x1 = 160 + Math.cos((deg * Math.PI) / 180) * r1;
          const y1 = 100 + Math.sin((deg * Math.PI) / 180) * r1;
          const x2 = 160 + Math.cos((deg * Math.PI) / 180) * r2;
          const y2 = 100 + Math.sin((deg * Math.PI) / 180) * r2;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={stroke}
              strokeWidth="0.8"
              opacity="0.6"
            />
          );
        })}
      </svg>
    );
  }

  if (kind === "graph") {
    return (
      <svg
        viewBox="0 0 320 200"
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid slice"
      >
        {[
          [40, 100],
          [90, 50],
          [90, 150],
          [160, 100],
          [230, 60],
          [230, 140],
          [290, 100],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="4" fill={stroke} />
        ))}
        {[
          [40, 100, 90, 50],
          [40, 100, 90, 150],
          [90, 50, 160, 100],
          [90, 150, 160, 100],
          [160, 100, 230, 60],
          [160, 100, 230, 140],
          [230, 60, 290, 100],
          [230, 140, 290, 100],
          [90, 50, 230, 60],
          [90, 150, 230, 140],
        ].map(([a, b, c, d], i) => (
          <line
            key={i}
            x1={a}
            y1={b}
            x2={c}
            y2={d}
            stroke={stroke}
            opacity="0.4"
          />
        ))}
        {[
          [40, 100],
          [90, 50],
          [160, 100],
          [230, 140],
          [290, 100],
        ].map(([x, y], i) => (
          <rect
            key={i}
            x={x + 8}
            y={y - 6}
            width="22"
            height="12"
            stroke="rgba(255,255,255,0.18)"
            fill="none"
          />
        ))}
      </svg>
    );
  }

  return null;
}

export function ModuleGlyph({ kind }) {
  const stroke = "var(--text-3)";
  const accent = "var(--accent)";

  if (kind === "workflow") {
    return (
      <svg viewBox="0 0 120 80" width="120" height="80" fill="none">
        <rect x="2" y="14" width="28" height="20" stroke={stroke} />
        <rect x="46" y="6" width="28" height="20" stroke={stroke} />
        <rect x="46" y="38" width="28" height="20" stroke={stroke} />
        <rect x="90" y="22" width="28" height="20" stroke={accent} />
        <line x1="30" y1="24" x2="46" y2="16" stroke={stroke} />
        <line x1="30" y1="24" x2="46" y2="48" stroke={stroke} />
        <line x1="74" y1="16" x2="90" y2="32" stroke={stroke} />
        <line x1="74" y1="48" x2="90" y2="32" stroke={stroke} />
        <circle cx="104" cy="32" r="2" fill={accent} />
      </svg>
    );
  }

  if (kind === "dashboard") {
    return (
      <svg viewBox="0 0 120 80" width="120" height="80" fill="none">
        <rect x="2" y="6" width="116" height="68" stroke={stroke} />
        <rect x="10" y="14" width="44" height="6" fill={stroke} opacity="0.5" />
        <rect x="10" y="26" width="44" height="42" stroke={stroke} />
        <polyline
          points="10,62 22,52 34,56 46,40 54,46"
          stroke={accent}
          fill="none"
        />
        <rect x="62" y="26" width="48" height="20" stroke={stroke} />
        <rect x="62" y="50" width="48" height="18" stroke={stroke} />
        <rect x="66" y="30" width="14" height="12" fill={accent} opacity="0.7" />
        <rect x="82" y="32" width="10" height="10" fill={stroke} opacity="0.4" />
        <rect x="94" y="28" width="12" height="14" fill={stroke} opacity="0.25" />
      </svg>
    );
  }

  if (kind === "llm") {
    return (
      <svg viewBox="0 0 120 80" width="120" height="80" fill="none">
        <rect x="6" y="8" width="40" height="16" stroke={stroke} />
        <rect x="6" y="28" width="40" height="16" stroke={stroke} />
        <rect x="6" y="48" width="40" height="16" stroke={stroke} />
        <path d="M46 16 H62 V40 H90" stroke={stroke} />
        <path d="M46 36 H72" stroke={stroke} />
        <path d="M46 56 H62 V40" stroke={stroke} />
        <rect x="90" y="32" width="24" height="16" stroke={accent} />
        <text
          x="96"
          y="44"
          fill={accent}
          fontFamily="IBM Plex Mono"
          fontSize="9"
        >
          LLM
        </text>
      </svg>
    );
  }

  if (kind === "decision") {
    return (
      <svg viewBox="0 0 120 80" width="120" height="80" fill="none">
        <polygon points="60,6 80,30 60,54 40,30" stroke={stroke} />
        <line x1="60" y1="54" x2="60" y2="74" stroke={stroke} />
        <circle cx="20" cy="30" r="6" stroke={stroke} />
        <circle cx="100" cy="30" r="6" stroke={stroke} />
        <line x1="26" y1="30" x2="40" y2="30" stroke={stroke} />
        <line x1="80" y1="30" x2="94" y2="30" stroke={stroke} />
        <circle cx="60" cy="74" r="3" fill={accent} />
        <text
          x="55"
          y="34"
          fill={stroke}
          fontFamily="IBM Plex Mono"
          fontSize="9"
        >
          ?
        </text>
      </svg>
    );
  }

  return null;
}
