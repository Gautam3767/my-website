// A "sheet" — one numbered drawing in the set. The tab sits on the top rule.
export default function Section({
  id,
  num,
  tab,
  children,
  style,
  plate = false,
}) {
  return (
    <section
      id={id}
      data-screen-label={id}
      className="sheet"
      style={
        plate
          ? {
              background: "var(--plate)",
              borderTopColor: "var(--plate-line)",
              ...style,
            }
          : style
      }
    >
      {tab && (
        <div
          className="sheet-tab"
          style={
            plate
              ? {
                  background: "var(--plate)",
                  borderColor: "var(--plate-line)",
                  borderTopColor: "transparent",
                  color: "var(--plate-text-2)",
                }
              : undefined
          }
        >
          <b>{String(num).padStart(2, "0")}</b>
          <span>{tab}</span>
        </div>
      )}
      <div className="wrap" style={{ position: "relative" }}>
        {children}
      </div>
    </section>
  );
}
