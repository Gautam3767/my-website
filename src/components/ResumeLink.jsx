import { loadSite } from "../data/loaders.js";

const { resume } = loadSite().contact;
const ext = (resume.split("?")[0].split(".").pop() || "").toUpperCase();

// The résumé download, labelled with its format so nobody is surprised by
// a Word file. Point site.json → contact.resume at a PDF to switch.
export default function ResumeLink({ className = "btn", label = "Résumé", showLabel = true, style }) {
  return (
    <a href={resume} download className={className} style={style}>
      {showLabel ? (
        <span>
          {label}
          {ext && <span className="sr-only"> ({ext})</span>}
        </span>
      ) : (
        <span className="sr-only">
          {label} {ext && `(${ext})`}
        </span>
      )}
      <span aria-hidden="true" className="accent-text">
        ↓
      </span>
    </a>
  );
}
