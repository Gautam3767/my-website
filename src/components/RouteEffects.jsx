import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

// Scroll + focus management for client-side navigation. BrowserRouter does
// neither, so without this a link from deep in the home page lands mid-way
// down /writing, and Back loses your place.
const positions = new Map();
const pageOf = (pathname) =>
  pathname.startsWith("/writing") ? "/writing" : pathname;

export default function RouteEffects() {
  const location = useLocation();
  const navType = useNavigationType();
  const page = pageOf(location.pathname);
  const keyRef = useRef(location.key);
  const prevPage = useRef(null);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    const save = () => positions.set(keyRef.current, window.scrollY);
    window.addEventListener("scroll", save, { passive: true });
    return () => window.removeEventListener("scroll", save);
  }, []);

  useLayoutEffect(() => {
    keyRef.current = location.key;
    // first paint: the page itself honours any #hash
    if (prevPage.current === null) {
      prevPage.current = page;
      return;
    }
    // same page (a dialog opening, a filter) — leave scroll alone
    if (prevPage.current === page) return;
    prevPage.current = page;

    if (navType === "POP" && positions.has(location.key)) {
      window.scrollTo(0, positions.get(location.key));
    } else if (!location.hash) {
      window.scrollTo(0, 0);
    }
    // move focus to the new page so keyboard and screen-reader users
    // start at its top rather than on a link that no longer exists
    document.getElementById("main")?.focus({ preventScroll: true });
  }, [location.key, location.hash, page, navType]);

  return null;
}
