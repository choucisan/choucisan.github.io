---
title: "Space Lab"
description: "A modern, polished website template for research groups, labs, and individual researchers — featuring an interactive 3D globe, publications showcase, and an immersive space-themed design."
pubDate: 2026-05-26
platform: "GitHub"
tags: ["Website Template", "Research Lab", "Astro", "3D Globe", "Mapbox","Open Source"]
image: /assets/collections/spacelab/spacelab.png
githubUrl: "https://github.com/choucisan/SpaceLab"
---

# Space Lab: A Website Template for Research Groups

**Space Lab** is a modern, polished website template designed for **research groups, labs, organizations, and individual researchers**. It provides a comprehensive showcase for publications, projects, blog posts, news, and team profiles — all wrapped in an immersive space-themed design with an interactive 3D globe powered by Mapbox.

Whether you're a lab director wanting to attract prospective students, a researcher building your academic presence, or a team sharing open-source projects, Space Lab helps you present your work with clarity and style. Built with Astro, it generates a fully static site that deploys anywhere.

## Why Space Lab Exists

With the rapid advancement of AI, more research is being produced every day. Effectively communicating your work to peers, students, collaborators, and the public has never been more important — but building and maintaining a lab website from scratch is a distraction that most researchers can't afford.

Space Lab solves this by providing a ready-to-use, highly customizable template that covers the core needs of a modern research group:

- **Showcase publications** with metadata, venues, and links;
- **Announce news** and lab updates;
- **Share open-source projects, datasets, and resources;**
- **Introduce team members** with bios, social links, and honors;
- **Engage visitors** with an interactive 3D globe featuring geotagged photos;
- **Support international audiences** with built-in bilingual capabilities.

Everything is authored in Markdown with type-safe Zod schemas — no database, no backend, no maintenance overhead.

## Features

### Core Pages

| Feature | Description |
|---|---|
| **Home** | Interactive 3D globe with geotagged photo markers, search, and zoom controls |
| **Publications** | Showcase accepted papers, preprints, and journal articles with filtering |
| **News** | Lab updates, announcements, and achievements |
| **Collections** | Open-source projects, datasets, and resources |
| **Blogs** | Research notes, tutorials, and deep-dives |
| **Our Team** | Individual member profiles with bios, social links, publications, and honors |
| **FAQ** | Frequently asked questions about the lab |
| **Contact** | Contact information and links |

### Interactive 3D Globe

| Feature | Description |
|---|---|
| **Geotagged photo markers** | Place photos on locations worldwide |
| **Multi-image carousel** | Swipe through multiple images per location |
| **Photo search** | Search markers by keyword and fly the globe to results |
| **Place search** | Search any place name or GPS coordinates; globe flies to the location |
| **Zoom presets** | 10 km / 5 km / 1 km / 100 m / 10 m zoom levels |
| **Mapbox-powered** | High-quality satellite imagery and terrain |

### Design

| Feature | Description |
|---|---|
| **Space theme** | Animated starfield canvas with twinkling stars, nebulae, and shooting stars |
| **Glass-morphism navigation** | Frosted glass header with backdrop blur |
| **Responsive layout** | Optimized for desktop, tablet, and mobile |
| **Dark mode** | Comfortable reading on all pages |

### Internationalization

Built-in bilingual support (English / Chinese) with `data-en` / `data-zh` attributes. Easily extendable to additional languages without restructuring the site.

### Content Management

| Feature | Description |
|---|---|
| **Markdown-based** | All content authored in Markdown with YAML frontmatter |
| **Astro Content Collections** | Type-safe content schemas with Zod validation |
| **No database required** | Fully static site, deploy anywhere |

## Project Structure

```text
SpaceLab/
├── public/
│   ├── assets/
│   │   ├── cards/          # Publication/project thumbnail images
│   │   ├── fonts/          # Custom fonts (Faire Octave)
│   │   ├── icons/          # SVG icons for social links
│   │   ├── logo/           # Space Lab logo
│   │   ├── space/          # Starfield cubemap textures
│   │   └── team/           # Team member photos
│   └── paper-sites/        # Individual paper/project pages
│       └── humanoid-vstar/ # Paper site template
├── src/
│   ├── components/         # Astro components (GlobeMap, StarsCanvas, Cards...)
│   ├── content/            # Markdown content collections
│   │   ├── blogs/          # Blog posts
│   │   ├── collections/    # Open projects/resources
│   │   ├── markers/        # Globe photo markers
│   │   ├── news/           # News articles
│   │   └── publications/   # Research publications
│   ├── data/               # Static data (team members)
│   ├── layouts/            # Base layout with header/footer
│   ├── pages/              # Route pages
│   └── styles/             # Global CSS
├── astro.config.mjs        # Astro configuration
├── package.json
└── tsconfig.json
```

## Getting Started

### Prerequisites

- **Node.js** 18+
- **npm** 9+

### Quick Start

```bash
# Clone the repository
git clone https://github.com/choucisan/SpaceLab.git
cd SpaceLab

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:4321](http://localhost:4321) in your browser.

### Mapbox API Token (for 3D Globe)

The 3D globe on the homepage uses Mapbox GL JS. To enable it:

1. Create a free account at [mapbox.com](https://www.mapbox.com)
2. Get your access token
3. Replace `MAPBOX_TOKEN` in `src/components/GlobeMap.astro`

If you don't need the 3D globe, you can skip this step — simply replace the homepage hero with your own design.

### Build for Production

```bash
npm run build
```

The output is in `dist/` — deploy to any static hosting service (Netlify, Vercel, GitHub Pages, Cloudflare Pages, etc.).

## Customization

Space Lab is designed to be made your own.

### Basic Customization

1. **Replace assets** — swap `public/assets/logo/spacelab.svg` with your lab's logo, update team photos, and replace card thumbnails
2. **Edit content** — update Markdown files in `src/content/` with your lab's publications, news, and projects
3. **Update team** — edit `src/data/team.ts` with your members' information and social links
4. **Change color scheme** — modify the space theme variables in `src/styles/global.css`

### Advanced Customization

- **Add pages** — create new `.astro` files in `src/pages/` for custom routes
- **Custom globe style** — swap the Mapbox style URL in `src/components/GlobeMap.astro` for a different map aesthetic
- **Add languages** — extend the `data-XX` attribute system in `public/assets/js/i18n.js`
- **Custom domain** — configure your hosting provider's custom domain settings

### Paper Site Template

A stand-alone paper project page template is included at `public/paper-sites/humanoid-vstar/`. It's a self-contained HTML page designed to showcase a single research project with figures, bibliography, and links. Copy this folder and customize `index.html` for your own paper.

## Highlights

- **Interactive 3D globe:** Mapbox-powered globe with geotagged photo markers, multi-image carousels, and fly-to-search
- **Space-themed design:** Animated starfield canvas with twinkling stars, nebulae, and shooting stars
- **Glass-morphism UI:** Frosted-glass navigation header with backdrop blur for a modern, polished look
- **Fully static:** No database, no backend — build once, deploy to any static host
- **Markdown-driven:** All content authored in Markdown with YAML frontmatter, type-checked by Zod schemas
- **Bilingual ready:** Built-in English/Chinese internationalization, easily extendable to more languages
- **Responsive:** Optimized layout across desktop, tablet, and mobile
- **Paper site included:** Self-contained HTML template for showcasing individual research projects

## Links

- **GitHub:** [github.com/choucisan/SpaceLab](https://github.com/choucisan/SpaceLab)
- **Live Demo:** [choucisan.github.io/collections/spacelab](https://choucisan.github.io/collections/spacelab/)
- **Built with Astro:** [astro.build](https://astro.build)
- **Mapbox:** [mapbox.com](https://www.mapbox.com)

## Contact

For questions, suggestions, or contributions, contact [choucisan@gmail.com](mailto:choucisan@gmail.com).
