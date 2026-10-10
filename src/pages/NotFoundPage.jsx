import { Link } from "react-router-dom";
import GridOverlay from "../components/GridOverlay.jsx";
import TopNav from "../components/TopNav.jsx";
import Footer from "../components/Footer.jsx";
import usePageMeta from "../hooks/usePageMeta.js";

export default function NotFoundPage() {
  usePageMeta({
    title: "Not found — Gautam Girdhar",
    description: "This drawing isn't in the set.",
    path: "/404",
    noindex: true,
  });
  return (
    <>
      <GridOverlay />
      <div className="page">
        <TopNav variant="page" />
        <main id="main" tabIndex={-1} className="fallback-sheet">
          <p className="t-label">Error 404 · sheet not in set</p>
          <h1
            className="t-display"
            style={{ fontSize: "clamp(40px, 8vw, 110px)", margin: "18px 0 0" }}
          >
            Nothing drawn
            <br />
            <span className="serif accent">at this address.</span>
          </h1>
          <p className="t-body" style={{ maxWidth: 520, marginTop: 28 }}>
            The link may be old, or the page may have moved. Everything that
            exists is one step away.
          </p>
          <div className="cta-row">
            <Link to="/" className="btn btn--primary">
              <span>Back to the portfolio</span>
              <span className="btn-arrow" aria-hidden="true">→</span>
            </Link>
            <Link to="/writing" className="btn">
              <span>Read the notes</span>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
