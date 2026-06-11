export default function SectionHead({ title, lead, plate = false }) {
  return (
    <div
      className="grid-2-spaced"
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0,1.3fr) minmax(0,1fr)",
        gap: 48,
        alignItems: "end",
        marginBottom: 64,
      }}
    >
      <h2
        className="t-display"
        style={{
          margin: 0,
          fontSize: "clamp(38px, 5.2vw, 80px)",
          color: plate ? "var(--plate-text)" : "var(--ink)",
        }}
      >
        {title}
      </h2>
      {lead && (
        <p
          className="t-body"
          style={{
            margin: 0,
            maxWidth: 520,
            justifySelf: "end",
            width: "100%",
            color: plate ? "var(--plate-text-2)" : "var(--ink-2)",
          }}
        >
          {lead}
        </p>
      )}
    </div>
  );
}
