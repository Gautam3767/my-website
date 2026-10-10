import { useEffect, useState, useSyncExternalStore } from "react";

// Subscribes to a media query. Server/first render falls back to `fallback`.
export function useMediaQuery(query, fallback = false) {
  return useSyncExternalStore(
    (onChange) => {
      if (typeof window === "undefined" || !window.matchMedia) return () => {};
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () =>
      typeof window === "undefined" || !window.matchMedia
        ? fallback
        : window.matchMedia(query).matches,
    () => fallback
  );
}

export function usePrefersReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)", false);
}

export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    !!window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

// True while the element is on screen and the tab is visible. An element
// that is display:none never intersects, so hidden figures cost nothing.
export function useInView(ref, rootMargin = "120px") {
  const [inView, setInView] = useState(false);
  const [visibleTab, setVisibleTab] = useState(
    () => typeof document === "undefined" || !document.hidden
  );

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin]);

  useEffect(() => {
    const on = () => setVisibleTab(!document.hidden);
    document.addEventListener("visibilitychange", on);
    return () => document.removeEventListener("visibilitychange", on);
  }, []);

  return inView && visibleTab;
}

export const supportsScrollTimeline =
  typeof CSS !== "undefined" &&
  typeof CSS.supports === "function" &&
  CSS.supports("animation-timeline: scroll()");
