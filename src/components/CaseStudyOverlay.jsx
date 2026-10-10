import { Fragment, useId } from "react";
import Dialog from "./Dialog.jsx";
import MonoLabel from "./MonoLabel.jsx";
import { SystemPreviewMotif } from "./Motifs.jsx";
import linkifyTwyn from "../utils/linkifyTwyn.jsx";
import { useLastDefined } from "../hooks/useLastDefined.js";

function ListBlock({ items, bullet = "—" }) {
  return (
    <ul className="case-list">
      {items.map((it, i) => (
        <li key={i}>
          <span className="bullet" aria-hidden="true">
            {bullet}
          </span>
          <span>{linkifyTwyn(it)}</span>
        </li>
      ))}
    </ul>
  );
}

function ArchFlow({ items }) {
  return (
    <ol className="arch-list">
      {items.map((it, i) => (
        <li key={i} className="arch-row">
          <span className="num" aria-hidden="true">
            {String(i + 1).padStart(2, "0")}
          </span>
          <span>{linkifyTwyn(it)}</span>
        </li>
      ))}
    </ol>
  );
}

// A case study as a "drawing" — a modal sheet over the portfolio. The URL
// carries it (?system=slug), so it can be shared and Back closes it.
export default function CaseStudyOverlay({ system, next, onClose, onOpen }) {
  const s = useLastDefined(system);
  const titleId = useId();
  if (!s) return null;

  const rows = [
    {
      t: "Organisational problem",
      c: s.problem && (
        <p className="t-body" style={{ margin: 0, fontSize: 16, lineHeight: 1.65 }}>
          {linkifyTwyn(s.problem)}
        </p>
      ),
    },
    { t: "AI opportunity", c: s.opportunity.length > 0 && <ListBlock items={s.opportunity} /> },
    { t: "System architecture", c: s.architecture.length > 0 && <ArchFlow items={s.architecture} /> },
    { t: "Engineering decisions", c: s.decisions.length > 0 && <ListBlock items={s.decisions} /> },
    { t: "Product experience", c: s.experience.length > 0 && <ListBlock items={s.experience} /> },
    { t: "Impact", c: s.impact.length > 0 && <ListBlock items={s.impact} bullet="◆" /> },
    {
      t: "Reflection",
      c: s.reflection && (
        <blockquote
          className="t-serif"
          style={{ margin: 0, color: "var(--ink)", fontSize: 21, lineHeight: 1.45 }}
        >
          “{linkifyTwyn(s.reflection)}”
        </blockquote>
      ),
    },
  ].filter((r) => r.c);

  const specs = [
    ["Domain", s.domain],
    ["Role", s.role],
    ["Timeline", s.timeline],
    ["Type", s.type],
  ].filter(([, v]) => v);

  return (
    <Dialog
      open={!!system}
      onRequestClose={onClose}
      labelledBy={titleId}
      className="case-dialog"
      contentKey={s.id}
    >
      <div className="overlay-head">
        <div className="overlay-head-inner">
          <div className="overlay-crumb">
            <span
              aria-hidden="true"
              style={{ width: 9, height: 9, background: s.palette, flexShrink: 0 }}
            />
            <span className="t-label">Drawing / {s.id}</span>
          </div>
          <button type="button" onClick={onClose} className="stamp dialog-close">
            Close <kbd>Esc</kbd>
          </button>
        </div>
      </div>

      <div className="case-hero case-pad">
        <MonoLabel>System</MonoLabel>
        <h2 id={titleId} className="t-display case-title">
          {s.name}
        </h2>
        {s.short && (
          <p className="t-body" style={{ margin: 0, fontSize: 16, maxWidth: "68ch" }}>
            {linkifyTwyn(s.short)}
          </p>
        )}
        {specs.length > 0 && (
          <dl className="case-specs">
            {specs.map(([k, v]) => (
              <div key={k}>
                <dt className="t-label" style={{ fontSize: 10.5 }}>
                  {k}
                </dt>
                <dd>{linkifyTwyn(v)}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      <figure className="case-figure" style={{ margin: 0 }}>
        <SystemPreviewMotif kind={s.motif} color={s.palette} fit="meet" />
        <figcaption
          className="plate-caption plate-caption--chip"
          style={{ left: 16, bottom: 14, right: 16, justifyContent: "space-between" }}
        >
          <span className="caption-secondary">Fig · abstracted system preview</span>
          <span>
            <span className="swatch" style={{ background: s.palette }} aria-hidden="true" />
            Client work — abstracted
          </span>
        </figcaption>
      </figure>

      <div className="case-rows">
        {rows.map((row, i) => (
          <Fragment key={row.t}>
            <div className="case-row-label">
              <div className="num" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="t-caps">{row.t}</h3>
            </div>
            <div className="case-row-content">{row.c}</div>
          </Fragment>
        ))}
      </div>

      <div className="dialog-foot case-pad">
        {next ? (
          <a
            href={`/?system=${encodeURIComponent(next.id)}`}
            className="next-link"
            onClick={(e) => {
              e.preventDefault();
              onOpen(next.id, { replace: true });
            }}
          >
            <span className="t-label">Next drawing →</span>
            <span className="t-title">{next.name}</span>
          </a>
        ) : (
          <span className="t-label">End of drawing · {s.id}</span>
        )}
        <button type="button" onClick={onClose} className="btn">
          <span>← Back to systems</span>
        </button>
      </div>
    </Dialog>
  );
}
