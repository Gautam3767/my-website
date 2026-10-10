import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "../hooks/useMedia.js";

// Native <dialog> opened with showModal(): the browser supplies the focus
// trap, the inert background, Esc handling and the top layer. This wrapper
// adds what the platform doesn't — an exit animation, scroll lock, backdrop
// click, and focus return when the opener is re-rendered.

const EXIT_MS = 170;
let locks = 0;

function lockScroll() {
  locks += 1;
  document.documentElement.classList.add("is-locked");
}
function unlockScroll() {
  locks = Math.max(0, locks - 1);
  if (!locks) document.documentElement.classList.remove("is-locked");
}

export default function Dialog({
  open,
  onRequestClose,
  labelledBy,
  label,
  variant = "panel",
  className = "",
  contentKey,
  children,
}) {
  const ref = useRef(null);
  const opener = useRef(null);
  const downOutside = useRef(false);
  const [present, setPresent] = useState(open);
  if (open && !present) setPresent(true);
  const closing = present && !open;

  // open
  useLayoutEffect(() => {
    const d = ref.current;
    if (!open || !d) return;
    if (!d.open) {
      opener.current = document.activeElement;
      d.showModal();
    }
    d.focus({ preventScroll: true });
  }, [open]);

  // new content in an already-open dialog starts at the top
  useLayoutEffect(() => {
    if (open && ref.current) ref.current.scrollTop = 0;
  }, [open, contentKey]);

  // close: play the exit, then close() so the browser restores focus
  useEffect(() => {
    if (open || !present) return;
    const t = setTimeout(
      () => {
        const d = ref.current;
        if (d?.open) d.close();
        const back = opener.current;
        if (
          back &&
          back.isConnected &&
          (!document.activeElement || document.activeElement === document.body)
        ) {
          back.focus({ preventScroll: true });
        }
        setPresent(false);
      },
      prefersReducedMotion() ? 0 : EXIT_MS
    );
    return () => clearTimeout(t);
  }, [open, present]);

  useEffect(() => {
    if (!present) return;
    lockScroll();
    return unlockScroll;
  }, [present]);

  if (!present) return null;

  const isOutside = (e) => {
    const d = ref.current;
    if (!d || e.target !== d) return false;
    const r = d.getBoundingClientRect();
    return (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    );
  };

  return (
    <dialog
      ref={ref}
      tabIndex={-1}
      aria-labelledby={labelledBy}
      aria-label={labelledBy ? undefined : label}
      className={`dialog dialog--${variant} ${closing ? "is-closing" : ""} ${className}`.trim()}
      onCancel={(e) => {
        e.preventDefault();
        if (open) onRequestClose();
      }}
      onClose={() => {
        // the browser closed it (e.g. a forced Esc) — sync our state
        if (open) onRequestClose();
      }}
      onPointerDown={(e) => {
        downOutside.current = isOutside(e);
      }}
      onClick={(e) => {
        if (open && downOutside.current && isOutside(e)) onRequestClose();
        downOutside.current = false;
      }}
    >
      {children}
    </dialog>
  );
}
