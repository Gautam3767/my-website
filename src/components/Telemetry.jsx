import { useEffect, useState } from "react";

// Real readout — local time in New Delhi, where the work happens.
export default function Telemetry() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(now);

  const rows = [
    ["base", "new delhi · in"],
    ["position", "28.61° N / 77.21° E"],
    ["local time", `${time} ist`],
    ["status", "open to roles"],
  ];

  return (
    <div
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: 10.5,
        color: "var(--ink-3)",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        display: "grid",
        gap: 7,
        lineHeight: 1.3,
      }}
    >
      {rows.map(([k, v]) => (
        <div
          key={k}
          style={{ display: "flex", gap: 18, justifyContent: "space-between" }}
        >
          <span>{k}</span>
          <span
            style={{
              color: k === "status" ? "var(--accent)" : "var(--ink-2)",
            }}
          >
            {v}
          </span>
        </div>
      ))}
    </div>
  );
}
