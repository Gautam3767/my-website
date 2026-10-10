import { Component } from "react";

// One malformed CMS record should cost one section, not the whole site.
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("[render]", error, info?.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    if (this.props.fallback !== undefined) return this.props.fallback;
    return (
      <main id="main" tabIndex={-1} className="fallback-sheet">
        <p className="t-label">Sheet failed to render</p>
        <h1 className="t-display" style={{ fontSize: "clamp(32px, 6vw, 72px)", margin: "18px 0" }}>
          Something broke on this page.
        </h1>
        <p className="t-body" style={{ maxWidth: 520 }}>
          The rest of the site is fine. Reload, or head back to the start.
        </p>
        <p style={{ marginTop: 28 }}>
          <a className="btn" href="/">
            <span>← Back to the portfolio</span>
          </a>
        </p>
      </main>
    );
  }
}
