// Faint drafting-paper column rules, fixed behind everything.
export default function GridOverlay() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        backgroundImage:
          "linear-gradient(90deg, rgba(28,26,19,0.04) 1px, transparent 1px)",
        backgroundSize: "120px 100%",
      }}
    />
  );
}
