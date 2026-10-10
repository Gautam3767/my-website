import { useEffect, useState } from "react";
import { useMediaQuery } from "../hooks/useMedia.js";

const fmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kolkata",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

function Clock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => {
      if (!document.hidden) setNow(new Date());
    }, 1000);
    return () => clearInterval(id);
  }, []);
  return <>{fmt.format(now)} ist</>;
}

// Real readout — local time in New Delhi, where the work happens. The
// ticking clock only runs where the panel is actually shown (desktop).
export default function Telemetry({ status = "open to roles" }) {
  const shown = useMediaQuery("(min-width: 901px)", true);
  const rows = [
    ["base", "new delhi · in"],
    ["position", "28.61° N / 77.21° E"],
    ["local time", shown ? <Clock /> : null],
    ["status", status],
  ];

  return (
    <dl
      style={{
        margin: 0,
        fontFamily: "var(--font-mono)",
        fontSize: 11,
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
          <dt>{k}</dt>
          <dd
            style={{
              margin: 0,
              color: k === "status" ? "var(--accent-text)" : "var(--ink-2)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {v}
          </dd>
        </div>
      ))}
    </dl>
  );
}
