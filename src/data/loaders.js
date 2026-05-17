// Vite reads JSON files at build time. Tina writes them.
// Editing via /admin → commit → Cloudflare Pages rebuilds → site updates.

const postModules = import.meta.glob("/content/posts/*.json", {
  eager: true,
  import: "default",
});

const caseStudyModules = import.meta.glob("/content/case-studies/*.json", {
  eager: true,
  import: "default",
});

const siteModule = import.meta.glob("/content/site/*.json", {
  eager: true,
  import: "default",
});

function dateKey(s = "") {
  // accepts "2026 · 04" or "2026-04"; sorts newest first
  const m = s.match(/(\d{4})\D+(\d{1,2})/);
  if (!m) return 0;
  return Number(m[1]) * 100 + Number(m[2]);
}

function withId(item) {
  // App code reads `.id`; Tina-managed files use `slug`. Mirror them so both work.
  if (!item) return item;
  const id = item.id || item.slug;
  return { ...item, id, slug: item.slug || id };
}

export function loadPosts() {
  const arr = Object.values(postModules).map(withId);
  arr.sort((a, b) => dateKey(b.date) - dateKey(a.date));
  return arr;
}

export function loadCaseStudies() {
  const arr = Object.values(caseStudyModules).map(withId);
  arr.sort(
    (a, b) =>
      (a.order ?? Number.MAX_SAFE_INTEGER) -
      (b.order ?? Number.MAX_SAFE_INTEGER)
  );
  return arr;
}

export function loadSite() {
  const entries = Object.values(siteModule);
  return entries[0] || {};
}

export const KIND_META = {
  essay: { label: "Essay", tag: "ESSAY" },
  "field-note": { label: "Field Note", tag: "FIELD" },
  "lab-note": { label: "Lab Note", tag: "LAB" },
};

export const FILTERS = [
  { id: "all", label: "All" },
  { id: "essay", label: "Essays" },
  { id: "field-note", label: "Field Notes" },
  { id: "lab-note", label: "Lab Notes" },
];
