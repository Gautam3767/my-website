import { defineConfig } from "tinacms";

const branch =
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  process.env.CF_PAGES_BRANCH ||
  "main";

export default defineConfig({
  branch,
  clientId: process.env.TINA_PUBLIC_CLIENT_ID || null,
  token: process.env.TINA_TOKEN || null,
  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },
  media: {
    tina: {
      mediaRoot: "uploads",
      publicFolder: "public",
    },
  },
  schema: {
    collections: [
      // ─────────────────────────────────────────────────────────────────
      // WRITING ENTRIES
      // ─────────────────────────────────────────────────────────────────
      {
        name: "post",
        label: "Writing Entries",
        path: "content/posts",
        format: "json",
        ui: {
          filename: {
            slugify: (values) =>
              (values?.slug || values?.title || "untitled")
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, ""),
          },
        },
        defaultItem: () => ({
          slug: "new-entry",
          kind: "essay",
          title: "New entry",
          dek: "A short subhead.",
          date: `${new Date().getFullYear()} · ${String(new Date().getMonth() + 1).padStart(2, "0")}`,
          read: "5 min",
          tags: [],
          featured: false,
          body: {
            type: "root",
            children: [{ type: "p", children: [{ type: "text", text: "Start writing…" }] }],
          },
        }),
        fields: [
          {
            type: "string",
            name: "slug",
            label: "Slug / ID",
            description:
              "The essay's URL: /writing/my-slug. Lower-kebab-case, unique.",
            required: true,
            isTitle: false,
            ui: {
              validate: (value) =>
                value && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
                  ? "Use lower-kebab-case: letters, numbers and hyphens only."
                  : undefined,
            },
          },
          {
            type: "string",
            name: "title",
            label: "Title",
            required: true,
            isTitle: true,
          },
          {
            type: "string",
            name: "dek",
            label: "Subhead / Dek",
            ui: { component: "textarea" },
          },
          {
            type: "string",
            name: "kind",
            label: "Kind",
            options: [
              { value: "essay", label: "Essay" },
              { value: "field-note", label: "Field Note" },
              { value: "lab-note", label: "Lab Note" },
            ],
            required: true,
          },
          {
            type: "string",
            name: "date",
            label: "Date",
            description: 'Year and month, e.g. "2026 · 04". Used for sorting, newest first.',
          },
          {
            type: "string",
            name: "read",
            label: "Read time",
            description: 'e.g. "7 min"',
          },
          {
            type: "string",
            name: "tags",
            label: "Tags",
            list: true,
          },
          {
            type: "boolean",
            name: "featured",
            label: "Featured (appears as the big card on /writing)",
          },
          {
            type: "string",
            name: "pullQuote",
            label: "Pull quote (optional)",
            description:
              "Shown on the featured card. Leave empty to use the first blockquote in the body.",
            ui: { component: "textarea" },
          },
          {
            type: "rich-text",
            name: "body",
            label: "Body",
            description:
              "Use the editor's heading, list, and blockquote controls. Quotes are rendered in serif italic.",
          },
        ],
      },

      // ─────────────────────────────────────────────────────────────────
      // CASE STUDIES (Selected Systems)
      // ─────────────────────────────────────────────────────────────────
      {
        name: "caseStudy",
        label: "Case Studies",
        path: "content/case-studies",
        format: "json",
        ui: {
          filename: {
            slugify: (values) =>
              (values?.slug || values?.name || "untitled")
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, ""),
          },
        },
        defaultItem: () => ({
          slug: "new-system",
          name: "New System",
          domain: "Domain",
          role: "Role",
          timeline: "Year",
          type: "Type",
          short: "Short summary.",
          problem: "What problem was the system solving?",
          opportunity: [],
          architecture: [],
          decisions: [],
          experience: [],
          impact: [],
          reflection: "",
          palette: "#E0420C",
          motif: "topology",
        }),
        fields: [
          {
            type: "string",
            name: "slug",
            label: "Slug / ID",
            description: "Used in the share link: /?system=my-slug. Lower-kebab-case, unique.",
            required: true,
            ui: {
              validate: (value) =>
                value && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
                  ? "Use lower-kebab-case: letters, numbers and hyphens only."
                  : undefined,
            },
          },
          {
            type: "string",
            name: "name",
            label: "System name",
            isTitle: true,
            required: true,
          },
          { type: "string", name: "domain", label: "Domain" },
          { type: "string", name: "role", label: "Role" },
          { type: "string", name: "timeline", label: "Timeline" },
          { type: "string", name: "type", label: "Type" },
          {
            type: "string",
            name: "short",
            label: "Short summary (card + overlay hero)",
            ui: { component: "textarea" },
          },
          {
            type: "string",
            name: "problem",
            label: "Organisational problem",
            ui: { component: "textarea" },
          },
          {
            type: "string",
            name: "opportunity",
            label: "AI opportunity (bullets)",
            list: true,
          },
          {
            type: "string",
            name: "architecture",
            label: "System architecture (bullets)",
            list: true,
          },
          {
            type: "string",
            name: "decisions",
            label: "Engineering decisions (bullets)",
            list: true,
          },
          {
            type: "string",
            name: "experience",
            label: "Product experience (bullets)",
            list: true,
          },
          {
            type: "string",
            name: "impact",
            label: "Impact (bullets)",
            list: true,
          },
          {
            type: "string",
            name: "reflection",
            label: "Reflection (one-line quote)",
            ui: { component: "textarea" },
          },
          {
            type: "string",
            name: "palette",
            label: "Accent palette",
            description: "Stroke colour for the system's drawing.",
            options: [
              { value: "#E0420C", label: "Drafting orange" },
              { value: "#1A6B45", label: "Signal green" },
              { value: "#2547B8", label: "Blueprint blue" },
              { value: "#A36A00", label: "Amber" },
            ],
          },
          {
            type: "string",
            name: "motif",
            label: "Preview motif",
            options: [
              { value: "topology", label: "Topology" },
              { value: "graph", label: "Graph" },
              { value: "grid", label: "Grid" },
              { value: "thermal", label: "Thermal" },
            ],
          },
          {
            type: "number",
            name: "order",
            label: "Sort order (smaller = first)",
          },
        ],
      },

      // ─────────────────────────────────────────────────────────────────
      // SITE SETTINGS (singleton)
      // ─────────────────────────────────────────────────────────────────
      {
        name: "site",
        label: "Site Settings",
        path: "content/site",
        format: "json",
        ui: {
          allowedActions: { create: false, delete: false },
          filename: {
            slugify: () => "site",
            readonly: true,
          },
        },
        fields: [
          {
            type: "object",
            name: "hero",
            label: "Hero",
            fields: [
              { type: "string", name: "kicker", label: "Eyebrow / kicker" },
              { type: "string", name: "headline", label: "Headline line 1" },
              {
                type: "string",
                name: "headlineAccent",
                label: "Headline accent (line 2)",
              },
              {
                type: "string",
                name: "subhead",
                label: "Sub-headline",
                ui: { component: "textarea" },
              },
              {
                type: "string",
                name: "whatIDo",
                label: 'What I do (chips)',
                list: true,
              },
            ],
          },
          {
            type: "object",
            name: "about",
            label: "About",
            fields: [
              {
                type: "string",
                name: "intro",
                label: "Intro paragraph",
                ui: { component: "textarea" },
              },
              {
                type: "string",
                name: "bio",
                label: "Bio paragraph",
                ui: { component: "textarea" },
              },
              { type: "string", name: "focus", label: "Focus" },
              { type: "string", name: "based", label: "Based" },
              { type: "string", name: "workingWith", label: "Working with" },
              { type: "string", name: "status", label: "Status" },
              {
                type: "image",
                name: "portrait",
                label: "Portrait photo",
                description: "Optional. Without one, the plate shows a monogram.",
              },
              { type: "string", name: "portraitAlt", label: "Portrait alt text" },
            ],
          },
          {
            type: "object",
            name: "contact",
            label: "Contact",
            fields: [
              { type: "string", name: "email", label: "Email" },
              { type: "string", name: "linkedin", label: "LinkedIn URL" },
              { type: "string", name: "github", label: "GitHub URL" },
              { type: "string", name: "phone", label: "Phone number" },
              {
                type: "string",
                name: "resume",
                label: "Résumé file path",
                description:
                  'Path under /public, e.g. "/Gautam_Girdhar_Resume.pdf". A PDF opens everywhere; .docx needs Word.',
              },
            ],
          },
          {
            type: "object",
            name: "philosophy",
            label: "Philosophy / Beliefs",
            fields: [
              { type: "string", name: "headline", label: "Headline (line 1)" },
              {
                type: "string",
                name: "headlineAccent",
                label: "Headline accent (line 2)",
              },
              {
                type: "string",
                name: "body",
                label: "Body paragraph",
                ui: { component: "textarea" },
              },
              {
                type: "string",
                name: "principles",
                label: "Working principles paragraph",
                ui: { component: "textarea" },
              },
              {
                type: "object",
                name: "beliefs",
                label: "Beliefs",
                list: true,
                ui: {
                  itemProps: (item) => ({ label: item?.line }),
                },
                fields: [
                  { type: "string", name: "code", label: "Code (01–04)" },
                  { type: "string", name: "line", label: "Belief", ui: { component: "textarea" } },
                ],
              },
            ],
          },
          {
            type: "object",
            name: "capabilities",
            label: "Capabilities (L1–L4)",
            list: true,
            ui: {
              itemProps: (item) => ({ label: item?.name }),
              defaultItem: () => ({ layer: "L0", name: "New layer", items: [] }),
            },
            fields: [
              { type: "string", name: "layer", label: "Layer code (e.g. L4)" },
              { type: "string", name: "name", label: "Layer name" },
              { type: "string", name: "items", label: "Items", list: true },
            ],
          },
        ],
      },
    ],
  },
});
