// Post-build: give every shareable route its own static HTML head.
//
// The site is a client-rendered SPA, so crawlers and link-preview bots
// (which don't run JS) would otherwise see the home page's title and
// description for every URL. This copies dist/index.html once per route
// with the right <title>, description, canonical and Open Graph tags, and
// writes rss.xml + sitemap.xml from the same content files.
//
// Cloudflare's asset handling serves /writing/<slug> from
// dist/writing/<slug>.html, and the SPA takes over once the JS loads.

import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = process.env.DIST_DIR || join(ROOT, "dist");
const SITE_URL = "https://gautamgirdhar.com";
const AUTHOR = "Gautam Girdhar";

if (!existsSync(join(DIST, "index.html"))) {
  console.error("[prerender-meta] dist/index.html not found — run vite build first");
  process.exit(1);
}

const esc = (s = "") =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const slugify = (s = "") =>
  String(s)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

function dateKey(s) {
  const m = String(s ?? "").match(/(\d{4})\D+(\d{1,2})(?!\d)/);
  if (m) return [Number(m[1]), Math.min(12, Number(m[2]))];
  const y = String(s ?? "").match(/(\d{4})/);
  return y ? [Number(y[1]), 1] : null;
}

function readJSONDir(dir) {
  const abs = join(ROOT, dir);
  if (!existsSync(abs)) return [];
  return readdirSync(abs)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      try {
        return JSON.parse(readFileSync(join(abs, f), "utf8"));
      } catch (e) {
        console.warn(`[prerender-meta] skipped ${dir}/${f}: ${e.message}`);
        return null;
      }
    })
    .filter(Boolean);
}

const template = readFileSync(join(DIST, "index.html"), "utf8");

function page({ title, description, path, type = "website", noscript = "" }) {
  const url = SITE_URL + path;
  let html = template;
  const swap = (re, value) => {
    if (!re.test(html)) console.warn(`[prerender-meta] pattern not found: ${re}`);
    html = html.replace(re, value);
  };
  swap(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);
  swap(/(<meta\s+name="description"\s+content=")[^"]*(")/, `$1${esc(description)}$2`);
  swap(/(<meta property="og:title" content=")[^"]*(")/, `$1${esc(title)}$2`);
  swap(/(<meta\s+property="og:description"\s+content=")[^"]*(")/, `$1${esc(description)}$2`);
  swap(/(<meta property="og:url" content=")[^"]*(")/, `$1${esc(url)}$2`);
  swap(/(<meta property="og:type" content=")[^"]*(")/, `$1${type}$2`);
  swap(/(<link rel="canonical" href=")[^"]*(")/, `$1${esc(url)}$2`);
  if (noscript) {
    html = html.replace(/<noscript>[\s\S]*?<\/noscript>/, `<noscript>${noscript}</noscript>`);
  }
  return html;
}

function write(rel, contents) {
  const abs = join(DIST, rel);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, contents);
}

// ── posts ────────────────────────────────────────────────────────────
const seen = new Set();
const posts = readJSONDir("content/posts")
  .map((p) => ({ ...p, id: slugify(p.slug || p.title), key: dateKey(p.date) }))
  .filter((p) => p.id && !seen.has(p.id) && seen.add(p.id))
  .sort((a, b) => (b.key?.[0] ?? 0) * 100 + (b.key?.[1] ?? 0) - ((a.key?.[0] ?? 0) * 100 + (a.key?.[1] ?? 0)));

const noscriptShell = (inner) =>
  `<div style="max-width: 720px; margin: 0 auto; padding: 96px 24px; font-family: system-ui, sans-serif; color: #1c1a13; line-height: 1.6">${inner}</div>`;

write(
  "writing.html",
  page({
    title: `Notes from the shop floor — ${AUTHOR}`,
    description:
      "Essays, field notes, and lab entries from shipping production AI — computer vision on live lines, multimodal plant copilots, and full-stack ops software.",
    path: "/writing",
    noscript: noscriptShell(
      `<h1>Notes from the shop floor</h1><ul>${posts
        .map((p) => `<li><a href="/writing/${p.id}">${esc(p.title)}</a> — ${esc(p.dek || "")}</li>`)
        .join("")}</ul>`
    ),
  })
);

for (const p of posts) {
  write(
    `writing/${p.id}.html`,
    page({
      title: `${p.title} — ${AUTHOR}`,
      description: p.dek || p.title,
      path: `/writing/${p.id}`,
      type: "article",
      noscript: noscriptShell(
        `<p><a href="/writing">Notes from the shop floor</a></p><h1>${esc(p.title)}</h1><p>${esc(
          p.dek || ""
        )}</p><p>${esc(AUTHOR)} · ${esc(p.date || "")}</p>`
      ),
    })
  );
}

// ── rss ──────────────────────────────────────────────────────────────
const rfc822 = (key) => (key ? new Date(Date.UTC(key[0], key[1] - 1, 1)).toUTCString() : "");
const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Notes from the shop floor — ${esc(AUTHOR)}</title>
    <link>${SITE_URL}/writing</link>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    <description>Essays, field notes, and lab entries from shipping production AI.</description>
    <language>en</language>
${posts
  .map(
    (p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${SITE_URL}/writing/${p.id}</link>
      <guid isPermaLink="true">${SITE_URL}/writing/${p.id}</guid>
      ${p.key ? `<pubDate>${rfc822(p.key)}</pubDate>` : ""}
      <description>${esc(p.dek || "")}</description>
    </item>`
  )
  .join("\n")}
  </channel>
</rss>
`;
write("rss.xml", rss);

// ── sitemap ──────────────────────────────────────────────────────────
const urls = ["/", "/writing", ...posts.map((p) => `/writing/${p.id}`)];
write(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE_URL}${u}</loc></url>`).join("\n")}
</urlset>
`
);

console.log(`[prerender-meta] wrote writing.html, ${posts.length} post pages, rss.xml, sitemap.xml`);
