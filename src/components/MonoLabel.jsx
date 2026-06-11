export default function MonoLabel({ children, num, style }) {
  return (
    <div
      className="t-label"
      style={{
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
