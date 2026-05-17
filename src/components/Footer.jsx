import { Link } from "react-router-dom";

export default function Footer({ variant = "portfolio" }) {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--border)",
        padding: "32px clamp(24px, 6vw, 96px)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 18,
        flexWrap: "wrap",
        fontFamily: "var(--font-mono)",
        fontSize: 11.5,
        color: "var(--text-3)",
        letterSpacing: "0.06em",
      }}
    >
      <div>
        © 2026 · GAUTAM GIRDHAR ·{" "}
        {variant === "writing"
          ? "NOTES FROM THE SHOP FLOOR"
          : "AI ENGINEER + SOLUTIONS ARCHITECT"}
      </div>
      <div style={{ display: "flex", gap: 22, alignItems: "center", flexWrap: "wrap" }}>
        <a
          href="/Gautam_Girdhar_Resume.docx"
          download
          style={{
            color: "var(--text-2)",
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            borderBottom: "1px solid var(--border-2)",
            paddingBottom: 2,
          }}
        >
          DOWNLOAD RÉSUMÉ <span style={{ color: "var(--accent)" }}>↓</span>
        </a>
        {variant === "writing" ? (
          <>
            <Link to="/" style={{ color: "var(--text-2)" }}>
              ← BACK TO PORTFOLIO
            </Link>
            <span style={{ color: "var(--accent)" }}>● live index</span>
          </>
        ) : (
          <>
            <span>v.0.5 / engineered build</span>
            <span style={{ color: "var(--accent)" }}>● system ok</span>
          </>
        )}
      </div>
    </footer>
  );
}
