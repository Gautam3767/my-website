// One-off migration: convert src/data/{writing,systems}.js into Tina-shaped
// JSON files under content/. Run once with `node scripts/migrate-content.mjs`.
import { mkdir, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const { ENTRIES } = await import(resolve(root, "src/data/writing.js"));
const { SYSTEMS } = await import(resolve(root, "src/data/systems.js"));

function textNode(text) {
  return { type: "text", text };
}

function paragraph(text) {
  return { type: "p", children: [textNode(text)] };
}

function heading(text) {
  return { type: "h2", children: [textNode(text)] };
}

function listItem(text) {
  return {
    type: "li",
    children: [{ type: "lic", children: [textNode(text)] }],
  };
}

function unorderedList(items) {
  return {
    type: "ul",
    children: items.map((i) => listItem(i)),
  };
}

function orderedList(items) {
  return {
    type: "ol",
    children: items.map((i) => listItem(i)),
  };
}

function blockquote(text) {
  return {
    type: "blockquote",
    children: [{ type: "p", children: [textNode(text)] }],
  };
}

function bodyToRichText(body) {
  const children = body.map((b) => {
    if (b.type === "p") return paragraph(b.text);
    if (b.type === "h") return heading(b.text);
    if (b.type === "ul") return unorderedList(b.items);
    if (b.type === "ol") return orderedList(b.items);
    if (b.type === "quote") return blockquote(b.text);
    return paragraph("");
  });
  return { type: "root", children };
}

await mkdir(resolve(root, "content/posts"), { recursive: true });
await mkdir(resolve(root, "content/case-studies"), { recursive: true });
await mkdir(resolve(root, "content/site"), { recursive: true });

// ── posts ────────────────────────────────────────────────────────────────────
for (const e of ENTRIES) {
  const out = {
    slug: e.id,
    title: e.title,
    dek: e.dek,
    kind: e.kind,
    date: e.date,
    read: e.read,
    tags: e.tags,
    featured: !!e.featured,
    body: bodyToRichText(e.body),
  };
  await writeFile(
    resolve(root, "content/posts", `${e.id}.json`),
    JSON.stringify(out, null, 2) + "\n"
  );
  console.log("→ post:", e.id);
}

// ── case studies ─────────────────────────────────────────────────────────────
for (let i = 0; i < SYSTEMS.length; i++) {
  const s = SYSTEMS[i];
  const { id, ...rest } = s;
  const out = { slug: id, order: i, ...rest };
  await writeFile(
    resolve(root, "content/case-studies", `${s.id}.json`),
    JSON.stringify(out, null, 2) + "\n"
  );
  console.log("→ case-study:", s.id);
}

// ── site singleton ───────────────────────────────────────────────────────────
const site = {
  hero: {
    kicker: "AI Engineer · Solutions Architect · End-to-end",
    headline: "End-to-end AI Engineer &",
    headlineAccent: "Solutions Architect",
    subhead:
      "I build production AI across the full stack — computer vision, multimodal voice + chat copilots, RAG and agent pipelines, and the React / React Native interfaces that wrap them. I own the ML lifecycle, the system around it, and the stakeholder conversations that scope it.",
    whatIDo: [
      "Computer Vision",
      "Multimodal AI",
      "Voice Agents",
      "RAG & Multi-agent",
      "Full-Stack Engineering",
      "Solutions Architecture",
    ],
  },
  about: {
    intro:
      "I’m Gautam Girdhar — an AI Engineer & Solutions Architect at Twyn, currently building production AI for automotive, two-wheeler, and industrial manufacturing clients. B.Tech in Computer Science with an AI & ML specialisation from Manipal University Jaipur (2021–2025).",
    bio:
      "Over the last two years I’ve shipped real-time computer vision running at 97–98% accuracy on live production lines, multimodal voice + chat copilots deployed across 3 enterprise clients, and full-stack operations software from shop-floor app to CXO dashboard. I’ve owned the full ML lifecycle — data, labelling, training, deployment, iteration — and led a cross-functional team through sprint planning, code review, and direct client communication.",
    focus: "AI Engineering · Solutions Architecture",
    based: "New Delhi · India",
    workingWith: "Enterprise manufacturing · operators · founders",
    status: "Open to roles & engagements",
  },
  contact: {
    email: "gg@gautamgirdhar.com",
    linkedin: "https://www.linkedin.com/in/gautam-girdhar",
    github: "https://github.com/gautam3767",
    phone: "+91 78785 60464",
  },
  philosophy: {
    headline: "Anyone can build the demo.",
    headlineAccent: "I build what runs on Monday morning.",
    body:
      "At Twyn, I own the full ML lifecycle — data collection, labelling, training, deployment, iteration — for systems running at 97–98% accuracy on live automotive lines. Demos win conferences. Production wins quarters. The work is reliability, not novelty.",
    principles:
      "I treat AI as a systems problem, not a model problem. The work that lasts lives between layers — model selection under real data and labelling constraints, latency budgets set by production tact-time, and the handoff between an automated alert and the human who has to act on it.",
    beliefs: [
      { code: "01", line: "First deployment in six weeks beats first slide in six months." },
      { code: "02", line: "97% on a live line beats 99% in a notebook." },
      { code: "03", line: "A model is one part of a system. Ship the system." },
      { code: "04", line: "If your operator can’t trust the alert, the model doesn’t matter." },
    ],
  },
  capabilities: [
    {
      layer: "L4",
      name: "Solutions Architecture",
      items: [
        "stakeholder discovery",
        "requirement mapping",
        "technical roadmap",
        "model selection under data + labelling constraints",
        "production deployment thinking",
        "client communication",
        "sprint planning + code review",
        "cross-functional team leadership",
        "market research",
      ],
    },
    {
      layer: "L3",
      name: "AI / ML / Voice Engineering",
      items: [
        "PyTorch",
        "YOLO",
        "PatchCore",
        "OpenCV",
        "Hugging Face",
        "Scikit-learn",
        "computer vision",
        "defect detection",
        "object counting",
        "multi-agent orchestration",
        "RAG pipelines",
        "LangChain",
        "LlamaIndex",
        "multimodal AI",
        "LLM reasoning",
        "prompt engineering",
        "Whisper · Deepgram (STT)",
        "ElevenLabs · gTTS (TTS)",
        "voice agents",
      ],
    },
    {
      layer: "L2",
      name: "Product & Interface",
      items: [
        "React",
        "React Native",
        "Expo",
        "Three.js",
        "3D digital twins",
        "shop-floor UI",
        "CXO command dashboards",
        "data visualization",
        "mobile apps",
        "client-facing portals",
      ],
    },
    {
      layer: "L1",
      name: "Backend, Cloud & Data",
      items: [
        "Python",
        "JavaScript",
        "TypeScript",
        "SQL",
        "Flask",
        "Node.js",
        "REST APIs",
        "real-time data pipelines",
        "Docker",
        "Kubernetes",
        "AWS",
        "GCP",
        "Firebase",
        "scalable inference APIs",
      ],
    },
  ],
};
await writeFile(
  resolve(root, "content/site/site.json"),
  JSON.stringify(site, null, 2) + "\n"
);
console.log("→ site singleton written");
console.log("\nDone. Inspect content/ before committing.");
