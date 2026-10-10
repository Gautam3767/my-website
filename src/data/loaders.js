// Vite reads JSON files at build time. Tina writes them.
// Editing via /admin → commit → Cloudflare Pages rebuilds → site updates.
//
// Tina only writes the fields an editor actually touched, so every loader
// normalises its records here: lists are always arrays, strings are always
// strings, and unknown enum values fall back to something renderable. The
// components can then trust the shape instead of guarding every access.

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

const MOTIFS = ["topology", "graph", "grid", "thermal"];

const str = (v) => (typeof v === "string" ? v.trim() : v == null ? "" : String(v));
const list = (v) =>
  Array.isArray(v) ? v.map(str).filter((x) => x !== "") : [];
const uniq = (arr) => [...new Set(arr)];

// URL-safe id: lowercase, ascii, hyphenated. Matches Tina's filename slugify.
export function slugify(s = "") {
  return str(s)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Accepts "2026 · 04", "2026-04", "2026-04-15", "April 2026", "2026".
// Returns a sortable number (YYYYMM) or 0 when it can't tell.
const MONTHS = [
  "jan", "feb", "mar", "apr", "may", "jun",
  "jul", "aug", "sep", "oct", "nov", "dec",
];
export function dateKey(s) {
  const text = str(s).toLowerCase();
  if (!text) return 0;
  let m = text.match(/(\d{4})\D+(\d{1,2})(?!\d)/);
  if (m) return Number(m[1]) * 100 + Math.min(12, Number(m[2]));
  m = text.match(/([a-z]{3})[a-z]*\.?\s+(\d{4})/);
  if (m && MONTHS.includes(m[1])) {
    return Number(m[2]) * 100 + MONTHS.indexOf(m[1]) + 1;
  }
  m = text.match(/(\d{4})/);
  return m ? Number(m[1]) * 100 : 0;
}

// Display label in the house format: "2026 · 04".
export function dateLabel(s) {
  const k = dateKey(s);
  if (!k) return str(s);
  const y = Math.floor(k / 100);
  const mo = k % 100;
  return mo ? `${y} · ${String(mo).padStart(2, "0")}` : String(y);
}

function readMinutes(s) {
  const m = str(s).match(/\d+/);
  return m ? Number(m[0]) : 0;
}

// Plain text of a rich-text node tree.
function plainText(node) {
  if (!node) return "";
  if (typeof node === "string") return node;
  if (node.type === "text") return node.text || "";
  return (node.children || []).map(plainText).join("");
}

// The first blockquote in a post body doubles as its pull quote.
function firstQuote(body) {
  const stack = [body];
  while (stack.length) {
    const n = stack.shift();
    if (!n || typeof n !== "object") continue;
    if (n.type === "blockquote") return plainText(n).trim();
    if (Array.isArray(n.children)) stack.push(...n.children);
  }
  return "";
}

// First paragraph of the body, trimmed at a sentence where possible.
function excerpt(body, max = 220) {
  const p = (body?.children || []).find((n) => n?.type === "p");
  const text = plainText(p).replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const stop = cut.lastIndexOf(". ");
  return stop > 80 ? cut.slice(0, stop + 1) : cut.replace(/\s+\S*$/, "") + "…";
}

function dedupe(items, label) {
  const seen = new Set();
  return items.filter((it) => {
    if (!it.id) {
      console.warn(`[content] ${label} without a slug was skipped`, it);
      return false;
    }
    if (seen.has(it.id)) {
      console.warn(`[content] duplicate ${label} slug "${it.id}" — keeping the first`);
      return false;
    }
    seen.add(it.id);
    return true;
  });
}

function normalisePost(p = {}) {
  const id = slugify(p.slug || p.id || p.title);
  const kind = KIND_META[p.kind] ? p.kind : "essay";
  const body =
    p.body && typeof p.body === "object"
      ? p.body
      : str(p.body)
        ? { type: "root", children: [{ type: "p", children: [{ type: "text", text: str(p.body) }] }] }
        : null;
  return {
    id,
    slug: id,
    title: str(p.title) || "Untitled",
    dek: str(p.dek),
    kind,
    date: dateLabel(p.date),
    dateKey: dateKey(p.date),
    read: str(p.read),
    readMinutes: readMinutes(p.read),
    tags: uniq(list(p.tags)),
    featured: p.featured === true,
    pullQuote: str(p.pullQuote) || firstQuote(body),
    excerpt: excerpt(body),
    body,
  };
}

function normaliseCaseStudy(s = {}) {
  const id = slugify(s.slug || s.id || s.name);
  return {
    id,
    slug: id,
    name: str(s.name) || "Untitled system",
    domain: str(s.domain),
    role: str(s.role),
    timeline: str(s.timeline),
    type: str(s.type),
    short: str(s.short),
    problem: str(s.problem),
    opportunity: list(s.opportunity),
    architecture: list(s.architecture),
    decisions: list(s.decisions),
    experience: list(s.experience),
    impact: list(s.impact),
    reflection: str(s.reflection),
    palette: /^#[0-9a-f]{3,8}$/i.test(str(s.palette)) ? str(s.palette) : "#E0420C",
    motif: MOTIFS.includes(s.motif) ? s.motif : "topology",
    order: Number.isFinite(s.order) ? s.order : Number.MAX_SAFE_INTEGER,
  };
}

function normaliseSite(raw = {}) {
  const hero = raw.hero || {};
  const about = raw.about || {};
  const contact = raw.contact || {};
  const philosophy = raw.philosophy || {};
  return {
    hero: {
      kicker: str(hero.kicker),
      headline: str(hero.headline),
      headlineAccent: str(hero.headlineAccent),
      subhead: str(hero.subhead),
      whatIDo: list(hero.whatIDo),
    },
    about: {
      intro: str(about.intro),
      bio: str(about.bio),
      focus: str(about.focus),
      based: str(about.based),
      workingWith: str(about.workingWith),
      status: str(about.status),
      portrait: str(about.portrait),
      portraitAlt: str(about.portraitAlt),
    },
    contact: {
      email: str(contact.email),
      linkedin: str(contact.linkedin),
      github: str(contact.github),
      phone: str(contact.phone),
      resume: str(contact.resume) || "/Gautam_Girdhar_Resume.docx",
    },
    philosophy: {
      headline: str(philosophy.headline),
      headlineAccent: str(philosophy.headlineAccent),
      body: str(philosophy.body),
      principles: str(philosophy.principles),
      beliefs: (Array.isArray(philosophy.beliefs) ? philosophy.beliefs : [])
        .map((b, i) => ({
          code: str(b?.code) || String(i + 1).padStart(2, "0"),
          line: str(b?.line),
        }))
        .filter((b) => b.line),
    },
    capabilities: (Array.isArray(raw.capabilities) ? raw.capabilities : [])
      .map((L, i) => ({
        layer: str(L?.layer) || `L${i + 1}`,
        name: str(L?.name),
        items: uniq(list(L?.items)),
      }))
      .filter((L) => L.name || L.items.length),
  };
}

const POSTS = dedupe(
  Object.values(postModules).map(normalisePost),
  "post"
).sort((a, b) => b.dateKey - a.dateKey);

const CASE_STUDIES = dedupe(
  Object.values(caseStudyModules).map(normaliseCaseStudy),
  "case study"
).sort((a, b) => a.order - b.order);

const SITE = normaliseSite(Object.values(siteModule)[0]);

export function loadPosts() {
  return POSTS;
}

export function loadCaseStudies() {
  return CASE_STUDIES;
}

export function loadSite() {
  return SITE;
}

// "01 entry" / "07 entries"
export function countLabel(n, one, many = `${one}s`) {
  return `${String(n).padStart(2, "0")} ${n === 1 ? one : many}`;
}

const WORDS = [
  "No", "One", "Two", "Three", "Four", "Five",
  "Six", "Seven", "Eight", "Nine", "Ten",
];
export function numberWord(n) {
  return WORDS[n] || String(n);
}

// Mailto / tel / https — tolerates CMS values typed without a protocol.
export function externalHref(v) {
  const s = str(v);
  if (!s) return "";
  if (/^(https?:|mailto:|tel:)/i.test(s)) return s;
  if (s.includes("@") && !s.includes("/")) return `mailto:${s}`;
  return `https://${s.replace(/^\/+/, "")}`;
}

export const SITE_URL = "https://gautamgirdhar.com";
export const SITE_TITLE = "Gautam Girdhar — AI Engineer & Solutions Architect";
export const SITE_DESCRIPTION =
  "Gautam Girdhar — End-to-end AI Engineer & Solutions Architect. Production computer vision, multimodal voice copilots, RAG / agent pipelines, and full-stack systems shipped to live industrial floors.";
