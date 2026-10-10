import { useEffect } from "react";
import { SITE_URL } from "../data/loaders.js";

function setMeta(attr, key, value) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!value) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", value);
}

function setCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

// Keeps <title>, description, Open Graph and canonical in step with the
// route. The build also writes these into static HTML per route
// (scripts/prerender-meta.mjs) so link previews see them without JS.
export default function usePageMeta({ title, description, path = "/", noindex = false }) {
  useEffect(() => {
    const url = SITE_URL + path;
    document.title = title;
    setMeta("name", "description", description);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", url);
    setMeta("name", "robots", noindex ? "noindex" : "");
    setCanonical(url);
  }, [title, description, path, noindex]);
}
