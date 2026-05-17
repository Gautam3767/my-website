export default function GridOverlay() {
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        backgroundImage: `
          linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px),
          linear-gradient(0deg, rgba(255,255,255,0.025) 1px, transparent 1px)
        `,
        backgroundSize: "80px 80px",
        maskImage:
          "radial-gradient(ellipse at center, black 50%, transparent 100%)",
        WebkitMaskImage:
          "radial-gradient(ellipse at center, black 50%, transparent 100%)",
      }}
    />
  );
}
