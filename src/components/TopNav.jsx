import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Dialog from "./Dialog.jsx";
import ResumeLink from "./ResumeLink.jsx";
import { supportsScrollTimeline } from "../hooks/useMedia.js";

const SECTIONS = [
  { id: "systems", label: "Systems" },
  { id: "process", label: "Process" },
  { id: "capabilities", label: "Capabilities" },
  { id: "writing", label: "Writing", to: "/writing" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
];

// variant: "home" (in-page jumps) · "writing" · "page" (links back home)
export default function TopNav({ variant = "home", active, onJump }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const progressRef = useRef(null);
  const onHome = variant === "home";

  useEffect(() => {
    let raf = 0;
    let last = null;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      const s = y > 12;
      if (s !== last) {
        last = s;
        setScrolled(s);
      }
      // fallback for browsers without scroll-driven animations:
      // write the transform directly, never through React state
      if (!supportsScrollTimeline && progressRef.current) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const p = max > 0 ? Math.min(1, y / max) : 0;
        progressRef.current.style.transform = `scaleX(${p})`;
      }
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  const jump = (id) => onJump?.(id);
  const jumpFromMenu = (id) => {
    setMenuOpen(false);
    // wait for the menu to leave so focus can move to the section
    setTimeout(() => jump(id), 200);
  };

  const isCurrent = (it) =>
    it.id === "writing" ? variant === "writing" : onHome && active === it.id;

  const renderItem = (it, inMenu, i) => {
    const current = isCurrent(it);
    const ariaCurrent = current
      ? it.id === "writing"
        ? "page"
        : "location"
      : undefined;
    const className = inMenu ? "mobile-menu-link" : "nav-link";
    const content = inMenu ? (
      <>
        {it.label}
        <span aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
      </>
    ) : (
      it.label
    );

    if (it.to || !onHome) {
      return (
        <Link
          key={it.id}
          to={it.to || `/#${it.id}`}
          className={className}
          aria-current={ariaCurrent}
          onClick={inMenu ? () => setMenuOpen(false) : undefined}
        >
          {content}
        </Link>
      );
    }
    return (
      <a
        key={it.id}
        href={`#${it.id}`}
        className={className}
        aria-current={ariaCurrent}
        onClick={(e) => {
          e.preventDefault();
          if (inMenu) jumpFromMenu(it.id);
          else jump(it.id);
        }}
      >
        {content}
      </a>
    );
  };

  const hireMe = (inMenu) =>
    onHome ? (
      <a
        href="#contact"
        className={`btn btn--primary ${inMenu ? "" : "btn--sm"}`}
        onClick={(e) => {
          e.preventDefault();
          if (inMenu) jumpFromMenu("contact");
          else jump("contact");
        }}
      >
        <span>Hire me</span>
      </a>
    ) : (
      <Link
        to="/#contact"
        className={`btn btn--primary ${inMenu ? "" : "btn--sm"}`}
        onClick={inMenu ? () => setMenuOpen(false) : undefined}
      >
        <span>Hire me</span>
      </Link>
    );

  return (
    <>
      <a
        className="skip-link"
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          const main = document.getElementById("main");
          main?.focus();
          main?.scrollIntoView();
        }}
      >
        Skip to content
      </a>
      <header className={`topnav ${scrolled ? "scrolled" : ""}`}>
        <div className="topnav-inner">
          <BrandMark onHome={onHome} onJump={jump} />

          <nav className="nav-desktop" aria-label="Primary">
            {SECTIONS.map((it, i) => renderItem(it, false, i))}
            <div className="nav-actions">
              {hireMe(false)}
              <ResumeLink className="btn btn--sm" />
            </div>
          </nav>

          <button
            type="button"
            className="menu-btn"
            onClick={() => setMenuOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
          >
            Menu
            <span className="menu-btn-dot" aria-hidden="true" />
          </button>
        </div>
        <div className="topnav-progress" ref={progressRef} aria-hidden="true" />
      </header>

      <Dialog
        open={menuOpen}
        onRequestClose={() => setMenuOpen(false)}
        variant="sheet"
        label="Site menu"
      >
        <div className="mobile-menu">
          <div className="mobile-menu-head">
            <BrandMark
              onHome={onHome}
              onJump={(id) => jumpFromMenu(id)}
              onNavigate={() => setMenuOpen(false)}
            />
            <button
              type="button"
              className="menu-btn"
              style={{ display: "inline-flex" }}
              onClick={() => setMenuOpen(false)}
            >
              Close <span aria-hidden="true">✕</span>
            </button>
          </div>

          <nav aria-label="Primary">
            {SECTIONS.map((it, i) => renderItem(it, true, i))}
          </nav>

          <div className="cta-row" style={{ marginTop: 28 }}>
            {hireMe(true)}
            <ResumeLink className="btn" />
          </div>
        </div>
      </Dialog>
    </>
  );
}

function BrandMark({ onHome, onJump, onNavigate }) {
  const inner = (
    <>
      <span className="brand-mark" aria-hidden="true" />
      <span className="brand-name">
        Gautam Girdhar
        <span className="brand-sub"> · AI + Solutions</span>
      </span>
    </>
  );

  if (!onHome) {
    return (
      <Link to="/" className="brand" onClick={onNavigate}>
        {inner}
        <span className="sr-only">— home</span>
      </Link>
    );
  }

  return (
    <a
      href="#hero"
      className="brand"
      onClick={(e) => {
        e.preventDefault();
        onJump?.("hero");
      }}
    >
      {inner}
      <span className="sr-only">— back to top</span>
    </a>
  );
}
