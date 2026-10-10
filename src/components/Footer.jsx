import { memo } from "react";
import { Link } from "react-router-dom";
import { loadSite } from "../data/loaders.js";
import ResumeLink from "./ResumeLink.jsx";

const SITE = loadSite();
const YEAR = new Date().getFullYear();

// Engineering-drawing title block. Every field is real, and every contact
// detail comes from the same place as the Contact section.
function Footer({ variant = "portfolio" }) {
  const sheet = variant === "writing" ? "GG-02" : "GG-01";
  const title =
    variant === "writing"
      ? "Notes from the shop floor"
      : "AI engineer + solutions architect";
  const email = SITE.contact.email;

  return (
    <footer className="title-block">
      <div className="wrap">
        <div className="title-block-bar">
          <span>FOR PRODUCTION — NOT FOR DEMO PURPOSES</span>
          {variant === "portfolio" ? (
            <ResumeLink className="" label="Download résumé" />
          ) : (
            <Link to="/">
              <span>← Back to portfolio</span>
            </Link>
          )}
        </div>

        <div className="title-block-grid">
          <div className="title-block-cell">
            <div className="k">Drawn by</div>
            <div className="v">Gautam Girdhar — {title}</div>
          </div>
          <div className="title-block-cell">
            <div className="k">Location</div>
            <div className="v">{SITE.about.based || "New Delhi · India"}</div>
          </div>
          <div className="title-block-cell">
            <div className="k">Contact</div>
            {email ? (
              <a className="v" href={`mailto:${email}`}>
                {/* break after the @, never inside the domain */}
                {email.split("@")[0]}@<wbr />
                {email.split("@").slice(1).join("@")}
              </a>
            ) : (
              <Link className="v" to="/#contact">
                Contact
              </Link>
            )}
          </div>
          <div className="title-block-cell">
            <div className="k">Revision</div>
            <div className="v">© {YEAR} · REV C</div>
          </div>
          <div
            className="title-block-cell"
            style={{ display: "flex", alignItems: "center" }}
          >
            <span className="sheet-id">{sheet}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default memo(Footer);
