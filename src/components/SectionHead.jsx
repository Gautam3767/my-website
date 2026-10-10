export default function SectionHead({ title, lead, plate = false }) {
  return (
    <div className="section-head">
      <h2
        className="t-display section-title"
        style={{ color: plate ? "var(--plate-text)" : "var(--ink)" }}
      >
        {title}
      </h2>
      {lead && (
        <p
          className="t-body section-lead"
          style={{ color: plate ? "var(--plate-text-2)" : "var(--ink-2)" }}
        >
          {lead}
        </p>
      )}
    </div>
  );
}
