export default function Section({ id, children, style }) {
  return (
    <section
      id={id}
      data-screen-label={id}
      style={{
        padding: "140px clamp(24px, 6vw, 96px)",
        borderTop: "1px solid var(--border)",
        position: "relative",
        ...style,
      }}
    >
      <div
        style={{
          maxWidth: 1440,
          margin: "0 auto",
          position: "relative",
        }}
      >
        {children}
      </div>
    </section>
  );
}
