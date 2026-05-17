export default function MonoLabel({ children, num, style }) {
  return (
    <div
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "var(--text-3)",
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        ...style,
      }}
    >
      {num != null && (
        <span style={{ color: "var(--accent)", letterSpacing: 0 }}>
          {String(num).padStart(2, "0")}
        </span>
      )}
      <span>{children}</span>
    </div>
  );
}
