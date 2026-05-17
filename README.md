# Gautam Girdhar — personal site

React + Vite portfolio + writing site with **TinaCMS** as a visual editor.
Content lives as JSON in `content/`. Deploys to Cloudflare Pages.

## Day-to-day

```bash
npm install
npm run dev          # → starts Tina + Vite together at http://localhost:5173
                     #   Visual editor at http://localhost:5173/admin
npm run build        # production build (needs Tina Cloud env vars)
npm run build:local  # production build using local Tina backend (for verification)
```

In dev, edits made through `/admin` write straight to JSON files under
`content/` on your machine — refresh the page to see them.

## Content model

| Where in the site         | Edited via Tina collection | Stored at                |
| ------------------------- | -------------------------- | ------------------------ |
| `/writing` essays + notes | **Writing Entries**        | `content/posts/*.json`   |
| Selected Systems cards    | **Case Studies**           | `content/case-studies/*.json` |
| Hero, About, Philosophy, Contact, Capabilities, Beliefs | **Site Settings** | `content/site/site.json` |

The writing body uses Tina's rich-text editor (paragraphs, headings, lists,
blockquotes). The renderer lives at [src/components/RichText.jsx](src/components/RichText.jsx).

To regenerate content files from the legacy JS data, run:

```bash
npm run migrate-content
```

(One-off — only useful if you ever want to reseed `content/` from the
constants in git history.)

## Setting up Tina Cloud (do this once before deploying)

Tina runs locally without an account. For the **production** `/admin` editor
on Cloudflare Pages, it needs Tina Cloud as the backend (free for personal
use).

1. Push this repo to GitHub. Tina Cloud writes back to that repo when you
   edit through the production admin.
2. Sign in at <https://app.tina.io>, create a new project, and point it at
   your GitHub repo.
3. Copy the **Client ID** and create a **Read-only Token**. Tina shows them
   in the project's *Configuration* tab.
4. Add them as environment variables in Cloudflare Pages (see below).

In CI / Cloudflare, Tina reads these env vars:

| Variable                 | What                                  |
| ------------------------ | ------------------------------------- |
| `TINA_PUBLIC_CLIENT_ID`  | Tina Cloud project client ID          |
| `TINA_TOKEN`             | Tina Cloud read-only content token    |
| `GITHUB_BRANCH`          | (optional) git branch to read/write   |

## Deploying to Cloudflare Pages

1. **Pages → Create application → Connect to Git** → pick this repo.
2. Build settings:
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Build output directory: `dist`
3. Environment variables (Production *and* Preview):
   - `TINA_PUBLIC_CLIENT_ID`
   - `TINA_TOKEN`
   - `NODE_VERSION` = `20` (avoids the node-gyp build issue on the latest Node)
4. Save and deploy.

After deploy, `/admin` is the live editor. Sign in with the GitHub account
that has push access to your repo; every save is a commit, which triggers a
fresh Cloudflare Pages build.

## Project layout

```
src/
  pages/         PortfolioPage.jsx, WritingPage.jsx
  components/    TopNav, SystemCube3D, TopologyMesh3D, CaseStudyOverlay,
                 RichText, Reveal, etc.
  data/loaders.js  reads content/*.json via Vite import.meta.glob
content/
  posts/         one .json per writing entry
  case-studies/  one .json per Selected System
  site/site.json singleton: hero, about, philosophy, contact, capabilities
tina/config.js   Tina collection schema (the only place to add new fields)
public/          static assets (favicon, résumé)
```

## Adding new content without the admin UI

Drop a new JSON file into `content/posts/` matching the existing shape and
Vite picks it up automatically. The `slug` field becomes the filename and
the URL hash on `/writing`.
