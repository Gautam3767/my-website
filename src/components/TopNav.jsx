import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const HOME_ITEMS = [
  { id: "systems", label: "Systems" },
  { id: "process", label: "Process" },
  { id: "capabilities", label: "Capabilities" },
  { id: "writing", label: "Writing", to: "/writing" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
];

const WRITING_ITEMS = [
  { href: "/#systems", label: "Systems" },
  { href: "/#process", label: "Process" },
  { href: "/#capabilities", label: "Capabilities" },
  { to: "/writing", label: "Writing", active: true },
  { href: "/#about", label: "About" },
  { href: "/#contact", label: "Contact" },
];

export default function TopNav({ variant = "home", active, onJump }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  const items = variant === "writing" ? WRITING_ITEMS : HOME_ITEMS;

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        padding: scrolled
          ? "14px clamp(20px, 5vw, 56px)"
          : "22px clamp(20px, 5vw, 56px)",
        transition:
          "padding .25s ease, background .25s ease, border-color .25s ease",
        background: scrolled ? "rgba(5,6,8,0.78)" : "transparent",
        backdropFilter: scrolled ? "blur(14px) saturate(140%)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(14px) saturate(140%)" : "none",
        borderBottom: scrolled
          ? "1px solid var(--border)"
          : "1px solid transparent",
      }}
    >
      <div
        style={{
          maxWidth: 1440,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 32,
        }}
      >
        <BrandMark variant={variant} onJump={onJump} />

        <nav style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
          {items.map((it) =>
            it.to ? (
              <Link
                key={it.label}
                to={it.to}
                className={`nav-link ${it.active ? "active" : ""}`}
                style={{
                  padding: "8px 12px",
                  fontSize: 13,
                  letterSpacing: "0.01em",
                  color: it.active ? "var(--text)" : "var(--text-2)",
                  borderRadius: 4,
                }}
              >
                {it.label}
              </Link>
            ) : it.href ? (
              <Link
                key={it.label}
                to={it.href}
                className="nav-link"
                style={{
                  padding: "8px 12px",
                  fontSize: 13,
                  letterSpacing: "0.01em",
                  color: "var(--text-2)",
                  borderRadius: 4,
                }}
              >
                {it.label}
              </Link>
            ) : (
              <button
                key={it.id}
                onClick={() => onJump?.(it.id)}
                className={`nav-link ${active === it.id ? "active" : ""}`}
                style={{
                  padding: "8px 12px",
                  fontSize: 13,
                  letterSpacing: "0.01em",
                  color: active === it.id ? "var(--text)" : "var(--text-2)",
                  borderRadius: 4,
                }}
              >
                {it.label}
              </button>
            )
          )}

          {variant === "writing" ? (
            <Link
              to="/#contact"
              className="cta-btn"
              style={{
                marginLeft: 12,
                padding: "9px 14px",
                fontSize: 12.5,
                border: "1px solid var(--accent-line)",
                borderRadius: 4,
                background: "var(--accent-soft)",
                color: "var(--text)",
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                fontFamily: "var(--font-mono)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              <span
                className="pulse-dot"
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "var(--signal)",
                  boxShadow: "0 0 8px var(--signal)",
                }}
              />
              <span className="hire-label">Hire me</span>
            </Link>
          ) : (
            <button
              onClick={() => onJump?.("contact")}
              className="cta-btn"
              style={{
                marginLeft: 12,
                padding: "9px 14px",
                fontSize: 12.5,
                border: "1px solid var(--accent-line)",
                borderRadius: 4,
                background: "var(--accent-soft)",
                color: "var(--text)",
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                fontFamily: "var(--font-mono)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              <span
                className="pulse-dot"
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "var(--signal)",
                  boxShadow: "0 0 8px var(--signal)",
                }}
              />
              <span className="hire-label">Hire me</span>
            </button>
          )}

          <a
            href="/Gautam_Girdhar_Resume.docx"
            download
            className="ghost-btn nav-actions-extra"
            style={{
              marginLeft: 8,
              padding: "9px 14px",
              fontSize: 12.5,
              border: "1px solid var(--border-2)",
              borderRadius: 4,
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--text-2)",
            }}
          >
            <span className="resume-label">Résumé</span>
            <span style={{ color: "var(--accent)" }}>↓</span>
          </a>
        </nav>
      </div>
    </header>
  );
}

function BrandMark({ variant, onJump }) {
  const inner = (
    <>
      <span
        style={{
          width: 22,
          height: 22,
          borderRadius: 4,
          border: "1px solid var(--border-2)",
          display: "grid",
          placeItems: "center",
          position: "relative",
          background: "var(--surface-1)",
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            background: "var(--accent)",
            borderRadius: 1,
            boxShadow: "0 0 12px var(--accent)",
          }}
        />
      </span>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 12.5,
          letterSpacing: "0.04em",
          color: "var(--text)",
        }}
      >
        Gautam Girdhar
        <span style={{ color: "var(--text-3)" }}> · AI + Solutions</span>
      </span>
    </>
  );

  if (variant === "writing") {
    return (
      <Link to="/" style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {inner}
      </Link>
    );
  }

  return (
    <a
      href="#hero"
      onClick={(e) => {
        e.preventDefault();
        onJump?.("hero");
      }}
      style={{ display: "flex", alignItems: "center", gap: 12 }}
    >
      {inner}
    </a>
  );
}
