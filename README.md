# Black Humor Productions

A responsive React website for Black Humor Productions, an independent creative media studio based in Nooranad, Kerala.

## Requirements

- Node.js 20.19+ or 22.12+
- npm (included with Node.js)

## Run locally

```bash
npm ci
npm run dev
```

Vite prints the local development URL, usually `http://localhost:5173`.

## Production build

```bash
npm run build
npm run preview
```

The optimized static site is written to `dist/`. The build checks TypeScript before bundling.

The site has separate routes for the home page, studio, services, six service detail pages,
portfolio concepts and concept details, and project inquiries. Portfolio concepts are clearly
identified as fictional demonstrations, not client case studies.

## Deploy to GitHub Pages

The included `.github/workflows/deploy.yml` builds and publishes the site to GitHub Pages when changes are pushed to `main` (or when manually started from the Actions tab).

1. Push this repository to GitHub and set the default deployment branch to `main`.
2. In **Settings → Pages**, select **GitHub Actions** as the build and deployment source.
3. Ensure the repository contains the existing `CNAME` file for `blackhumorproductions.qd.je` and configure that hostname’s DNS to point to GitHub Pages.
4. Push to `main`; follow the **Deploy to GitHub Pages** workflow in the Actions tab.
5. Once DNS resolves, enable **Enforce HTTPS** in the Pages settings.

The Vite build uses root-relative URLs for the configured custom domain. `public/404.html` preserves client-side routes on GitHub Pages, and the workflow copies `CNAME` into the built artifact.

For another static host, publish the contents of `dist/`, configure its SPA fallback to serve `index.html` for application routes, and point the domain at that host.

## Contact form

The contact form validates its fields in the browser and prepares an inquiry in WhatsApp using the configured business number. The visitor reviews and sends the message themselves; no form data is sent to or stored by this website. Visitors can also email the studio directly at `blackhumorproductions@outlook.com` using the site's `mailto:` link.

## Content and assets

The portfolio items are explicitly labelled demonstration concepts and are not client work or case studies. Studio and portfolio photography is illustrative stock photography from [Unsplash](https://unsplash.com/license); optimized WebP copies are stored in `public/images/` so the site does not depend on a third-party image CDN at runtime.

Business details are centralized in `src/config/site.ts`. Before launch, confirm the custom-domain DNS/HTTPS configuration and supply any official social profiles or real project material you want to add. No unverified client claims or social links are included.
