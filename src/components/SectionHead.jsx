import MonoLabel from "./MonoLabel.jsx";

export default function SectionHead({ num, kicker, title, lead }) {
  return (
    <div
      className="grid-2-spaced"
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0,1fr) minmax(0,1.4fr)",
        gap: 48,
        alignItems: "end",
        marginBottom: 56,
      }}
    >
      <div>
        <MonoLabel num={num}>{kicker}</MonoLabel>
        <h2
          style={{
            margin: "18px 0 0",
            fontFamily: "var(--font-sans)",
            fontWeight: 500,
            fontSize: "clamp(36px, 4.6vw, 64px)",
            lineHeight: 1.02,
            letterSpacing: "-0.035em",
            color: "var(--text)",
            textWrap: "balance",
          }}
        >
          {title}
        </h2>
      </div>
      {lead && (
        <p
          style={{
            margin: 0,
            color: "var(--text-2)",
            fontSize: 17,
            lineHeight: 1.55,
            maxWidth: 540,
            textWrap: "pretty",
          }}
        >
          {lead}
        </p>
      )}
    </div>
  );
}
