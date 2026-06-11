import { Link } from "react-router-dom";

// Engineering-drawing title block. Every field is real.
export default function Footer({ variant = "portfolio" }) {
  const sheet = variant === "writing" ? "GG-02" : "GG-01";
  const title =
    variant === "writing"
      ? "NOTES FROM THE SHOP FLOOR"
      : "AI ENGINEER + SOLUTIONS ARCHITECT";

  return (
    <footer
      className="title-block"
      style={{ padding: "0 var(--pad-x) 28px" }}
    >
      <div className="wrap">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 18,
            flexWrap: "wrap",
            padding: "20px 0",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.08em",
            color: "var(--ink-3)",
          }}
        >
          <span>FOR PRODUCTION — NOT FOR DEMO PURPOSES</span>
          {variant === "writing" ? (
            <Link
              to="/"
              style={{
                color: "var(--ink-2)",
                borderBottom: "1px solid var(--line-2)",
                paddingBottom: 2,
              }}
            >
              ← BACK TO PORTFOLIO
            </Link>
          ) : (
            <a
              href="/Gautam_Girdhar_Resume.docx"
              download
              style={{
                color: "var(--ink-2)",
                borderBottom: "1px solid var(--line-2)",
                paddingBottom: 2,
                display: "inline-flex",
                gap: 10,
              }}
            >
              DOWNLOAD RÉSUMÉ <span style={{ color: "var(--accent)" }}>↓</span>
            </a>
          )}
        </div>

        <div className="title-block-grid">
          <div className="title-block-cell">
            <div className="k">Drawn by</div>
            <div className="v">Gautam Girdhar — {title}</div>
          </div>
          <div className="title-block-cell">
            <div className="k">Location</div>
            <div className="v">New Delhi · IN</div>
          </div>
          <div className="title-block-cell">
            <div className="k">Contact</div>
            <a className="v" href="mailto:gg@gautamgirdhar.com">
              gg@gautamgirdhar.com
            </a>
          </div>
          <div className="title-block-cell">
            <div className="k">Revision</div>
            <div className="v">© 2026 · REV B</div>
          </div>
          <div
            className="title-block-cell"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontStretch: "118%",
                fontWeight: 740,
                fontSize: 22,
                letterSpacing: "-0.01em",
                color: "var(--accent)",
              }}
            >
              {sheet}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
