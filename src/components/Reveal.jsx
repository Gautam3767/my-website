import { useEffect, useRef, useState } from "react";

// Fades a block in the first time it scrolls into view. `immediate` skips
// the reveal (e.g. rows re-rendered by a filter, which are already on screen).
export default function Reveal({
  children,
  delay = 0,
  immediate = false,
  as: As = "div",
  style,
  className = "",
}) {
  const ref = useRef(null);
  const [shown, setShown] = useState(
    () => immediate || typeof IntersectionObserver === "undefined"
  );

  useEffect(() => {
    const node = ref.current;
    if (!node || shown) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, [shown]);

  return (
    <As
      ref={ref}
      className={`reveal ${shown ? "in" : ""} ${className}`.trim()}
      // stagger only matters for things entering together; cap it so long
      // lists never make anyone wait
      style={{ transitionDelay: `${Math.min(delay, 240)}ms`, ...style }}
    >
      {children}
    </As>
  );
}
