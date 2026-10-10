export default function MonoLabel({ children, num, style, as: As = "div" }) {
  return (
    <As
      className="t-label"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        margin: 0,
        ...style,
      }}
    >
      {num != null && (
        <span style={{ color: "var(--accent-text)", letterSpacing: 0 }}>
          {String(num).padStart(2, "0")}
        </span>
      )}
      <span>{children}</span>
    </As>
  );
}
