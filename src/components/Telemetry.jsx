import { useEffect, useState } from "react";

export default function Telemetry() {
  const [t, setT] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setT((x) => x + 1), 1100);
    return () => clearInterval(id);
  }, []);

  const rows = [
    ["sys.uptime", "00:14:32:11"],
    ["sys.region", "ap-south-1 / blr"],
    ["intel.layer", "operational"],
    ["loop.feedback", "human-in-loop"],
    [
      "pipeline.heartbeat",
      t % 4 === 0
        ? "▮▮▯▯"
        : t % 4 === 1
        ? "▯▮▮▯"
        : t % 4 === 2
        ? "▯▯▮▮"
        : "▮▯▯▮",
    ],
  ];

  return (
    <div
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: 10.5,
        color: "var(--text-3)",
        letterSpacing: "0.06em",
        display: "grid",
        gap: 6,
        lineHeight: 1.3,
      }}
    >
      {rows.map(([k, v]) => (
        <div
          key={k}
          style={{
            display: "flex",
            gap: 18,
            justifyContent: "space-between",
          }}
        >
          <span>{k}</span>
          <span
            style={{
              color: k.endsWith("heartbeat") ? "var(--accent)" : "var(--text-2)",
            }}
          >
            {v}
          </span>
        </div>
      ))}
    </div>
  );
}
