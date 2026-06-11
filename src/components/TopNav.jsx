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
  const [progress, setProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const on = () => {
      setScrolled(window.scrollY > 12);
      const max =
        document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const items = variant === "writing" ? WRITING_ITEMS : HOME_ITEMS;

  const handleJump = (id) => {
    setMenuOpen(false);
    onJump?.(id);
  };

  return (
    <>
      <header className={`topnav ${scrolled ? "scrolled" : ""}`}>
        <div className="topnav-inner">
          <BrandMark variant={variant} onJump={handleJump} />

          <nav
            className="nav-desktop"
            style={{ display: "flex", alignItems: "center", gap: 2 }}
          >
            {items.map((it) =>
              it.to ? (
                <Link
                  key={it.label}
                  to={it.to}
                  className={`nav-link ${it.active ? "active" : ""}`}
                >
                  {it.label}
                </Link>
              ) : it.href ? (
                <Link key={it.label} to={it.href} className="nav-link">
                  {it.label}
                </Link>
              ) : (
                <button
                  key={it.id}
                  onClick={() => handleJump(it.id)}
                  className={`nav-link ${active === it.id ? "active" : ""}`}
                >
                  {it.label}
                </button>
              )
            )}

            {variant === "writing" ? (
              <Link
                to="/#contact"
                className="btn btn--primary"
                style={{ marginLeft: 14, padding: "10px 16px" }}
              >
                <span>Hire me</span>
              </Link>
            ) : (
              <button
                onClick={() => handleJump("contact")}
                className="btn btn--primary"
                style={{ marginLeft: 14, padding: "10px 16px" }}
              >
                <span>Hire me</span>
              </button>
            )}

            <a
              href="/Gautam_Girdhar_Resume.docx"
              download
              className="btn"
              style={{ marginLeft: 8, padding: "10px 16px" }}
            >
              <span className="resume-label">Résumé</span>
              <span style={{ color: "var(--accent)" }}>↓</span>
            </a>
          </nav>

          <button
            className="menu-btn"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            Menu
            <span
              style={{ width: 6, height: 6, background: "var(--accent)" }}
            />
          </button>
        </div>
        <div
          className="topnav-progress"
          style={{ width: `${progress * 100}%` }}
        />
      </header>

      {menuOpen && (
        <div className="mobile-menu">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 36,
            }}
          >
            <BrandMark variant={variant} onJump={handleJump} />
            <button
              className="menu-btn"
              style={{ display: "inline-flex" }}
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              Close ✕
            </button>
          </div>

          <nav style={{ flex: 1, overflow: "auto" }}>
            {items.map((it, i) => {
              const numeral = (
                <span>{String(i + 1).padStart(2, "0")}</span>
              );
              return it.to || it.href ? (
                <Link
                  key={it.label}
                  to={it.to || it.href}
                  className="mobile-menu-link"
                  onClick={() => setMenuOpen(false)}
                  style={{ display: "flex" }}
                >
                  {it.label}
                  {numeral}
                </Link>
              ) : (
                <button
                  key={it.id}
                  className="mobile-menu-link"
                  onClick={() => handleJump(it.id)}
                >
                  {it.label}
                  {numeral}
                </button>
              );
            })}
          </nav>

          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 28,
              flexWrap: "wrap",
            }}
          >
            {variant === "writing" ? (
              <Link
                to="/#contact"
                className="btn btn--primary"
                onClick={() => setMenuOpen(false)}
              >
                <span>Hire me</span>
              </Link>
            ) : (
              <button
                className="btn btn--primary"
                onClick={() => handleJump("contact")}
              >
                <span>Hire me</span>
              </button>
            )}
            <a href="/Gautam_Girdhar_Resume.docx" download className="btn">
              <span>Résumé</span>
              <span style={{ color: "var(--accent)" }}>↓</span>
            </a>
          </div>
        </div>
      )}
    </>
  );
}

function BrandMark({ variant, onJump }) {
  const inner = (
    <>
      <span
        style={{
          width: 24,
          height: 24,
          border: "1px solid var(--line-3)",
          display: "grid",
          placeItems: "center",
          background: "var(--paper-1)",
        }}
      >
        <span
          style={{ width: 8, height: 8, background: "var(--accent)" }}
        />
      </span>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "var(--ink)",
          whiteSpace: "nowrap",
        }}
      >
        Gautam Girdhar
        <span className="resume-label" style={{ color: "var(--ink-3)" }}>
          {" "}
          · AI + Solutions
        </span>
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
