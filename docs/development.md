# Developing the website

Notes for working on the source of the Loog website. The product itself lives in
[lius-new/loog](https://github.com/lius-new/loog); the [README](../README.md) is about the product.

A static [Astro](https://astro.build) site with no UI framework. The first screen is the whole design for now:
a dot-matrix wordmark that is laid down in three passes, a mock of the Loog window, and a left column that
doubles as a feature index. Hovering a feature lights up the matching part of the window.

## Commands

| Command             | What it does                                         |
| ------------------- | ---------------------------------------------------- |
| `pnpm install`      | Install dependencies                                 |
| `pnpm dev`          | Dev server at `localhost:4321`                       |
| `pnpm build`        | Build the static site to `dist/`                     |
| `pnpm preview`      | Serve `dist/` locally                                |
| `pnpm typecheck`    | `tsc --noEmit` over the TypeScript in `src/scripts` and `src/data` |

Node 22.23.4 or newer is required (see `engines`).

> `.astro` templates are not covered by `typecheck`; their syntax errors surface in `pnpm build`.
> `@astrojs/check` is not installed: at the time of writing its WASM runtime pulls in mismatched
> `@emnapi/runtime` versions and crashes on start.

## Layout

```
src/
  pages/
    index.astro            the home page: Hero + script wiring
    extensions/index.astro the extensions list (/extensions/)
    extensions/[id].astro  one page per extension (/extensions/<id>/)
    sitemap.xml.ts         sitemap, generated from the page list and the extensions
  layouts/
    Base.astro             home: self-hosted fonts, global styles, icon sprite
    ExtLayout.astro        extensions pages: header, extensions styles
  components/
    Head.astro             <head> content shared by both layouts: title, canonical, share cards, JSON-LD
    Hero.astro             canvas + stage; assembles the pieces below
    Intro.astro            tagline, subtitle, Download button
    FeatureIndex.astro     feature index + large links (desktop)
    QuickLinks.astro       GitHub / Extensions / Docs row (mobile)
    AppWindow.astro        the mock Loog window (decorative, aria-hidden)
    ExtHeader.astro        top bar of the extensions pages
    Icon.astro, FileIcon.astro, Sprite.astro
  data/
    site.ts                name, tagline, URLs, features, links, extensions copy: the single source of copy
    extensions.ts          loads, verifies and shapes the extension index at build time
    mock.ts                file lists shown inside the mock window
    diff.ts                the commit diff shown inside the mock window
  scripts/
    dots.ts                the dot-matrix canvas and its intro animation
    interactions.ts        hover-to-highlight sync, G / E / D shortcuts
    window-scale.ts        scales the mock window to fit phones
    wordmark.ts            the small dot-matrix logo in the extensions top bar
    ext-list.ts            extensions list: search, index, "/" shortcut
    ext-detail.ts          extension page: tabs, copy the identifier
  styles/
    tokens.css  base.css  hero.css  window.css  responsive.css   (home, imported in this order)
    extensions.css         extensions pages (pulls in fonts, tokens.css and base.css itself)
  assets/sprite.svg        icon sprite
public/                    favicon (the Loog icon)
docs/development.md        this file
```

To change copy or links, edit `src/data/site.ts`; the left column, the mobile link row and the keyboard
shortcuts are all generated from it.

## Design notes

- **Palette** comes from the app icon: warm black `#1c1a17`, cream `#fff4ea`, and the pink thread `#ff758f`.
  Pink is reserved for the wordmark's thread, the download button and hover/active states.
- **Dot field** (`dots.ts`). The wordmark is rendered to an offscreen canvas, sampled onto a dot grid, and
  crossed by a sine-shaped band. The intro runs in three passes: base dots, wordmark, then the pink band.
  On phones (`<= 900px`) the wordmark sits at the top and all three passes run top to bottom.
- **No layout shift while loading.** Where the window and left column sit depends on the wordmark's
  height. That height (`--wm-bottom`) is computed in plain CSS from viewport units and a measured
  constant, `--wm-em` (the width of "Loog" in em), so the first paint is already correct and nothing
  waits for fonts or scripts. `dots.ts` reads the same constant to draw the wordmark. **If you change the
  wordmark's font, weight or letter-spacing, re-measure `--wm-em`** (`measureText('Loog').width / 100` on a
  canvas with the font set to `800 100px` and `letterSpacing = '-0.03em'`), otherwise the layout will
  drift from the drawing. The two main fonts are preloaded in `Base.astro` for the same reason.
- **Responsive**. Below 900px the left column and window are re-ordered with `display: contents` + `order`
  (see `responsive.css`). The window keeps its full three-panel layout at a 760px design width and is
  shrunk with `zoom`, so no content is dropped.
- **Fonts** are self-hosted from `@fontsource-variable` (Bricolage Grotesque with its optical-size axis, and
  Geist Mono) instead of Google Fonts, so the site works where Google is unreachable.
- **Container queries**. The left column is a size container; row sizes use `cqh` so they scale with the
  window next to it, and lower-priority groups fold away when the column gets short.
- **Reduced motion**: the intro is skipped and the caret stops blinking.

### Debug parameters

| Query     | Effect                                           |
| --------- | ------------------------------------------------ |
| `?static` | Skip the intro animation                         |
| `?t=1.2`  | Freeze the intro at 1.2 seconds (useful for screenshots) |

### Working in `.astro` templates

- Curly braces in text are expressions. The mock diff contains Rust code, so it lives in `src/data/diff.ts`
  and is rendered with `<Fragment set:html>`; do not paste code into templates.
- `.dl` (a diff row) uses `white-space: pre`. Keep each row on one line in the template, with no
  whitespace between `<i>` and the code.

## Extensions pages

`/extensions/` lists the official extensions and `/extensions/<id>/` has one page for each (Details, Contributions,
Changelog, and a side panel with the identifier, version, licence, permissions and so on).

- **Data comes from the extension repository, not from this one.** At build time `src/data/extensions.ts` downloads
  the signed index (`index.json` and `index.json.sig` from the `registry` release of
  [lius-new/loog-extensions](https://github.com/lius-new/loog-extensions), format in that repository's
  `docs/index-format.md`), **verifies the Ed25519 signature** with the public key in `src/data/site.ts`, and keeps
  the `loog.*` entries. The index also holds old `loom.*` duplicates from before the rename; they are skipped.
  A failed download or a bad signature **fails the build**: the site is not published with unverified data. An
  expired index only logs a warning.
- **The pages only change when the site is rebuilt.** Nothing here watches the extension repository. After new
  extensions are published, rebuild the site (a push to `main`, or a Cloudflare deploy hook called from the
  extension repository's publish workflow; the hook is not set up yet).
- **README and changelog** are Markdown from the index, rendered with `marked` and cleaned with `sanitize-html`
  (a short list of tags, no images, only absolute `http(s)` and `mailto:` links; relative links become plain text).
- **Install** is a `loog://extensions/install?id=<id>` link (`EXTENSIONS.installUrl`). The path is a proposal that
  the app has to implement; until then the button does nothing. There are no download links on purpose.
- **Contributions tab** only exists where the index has structured data: grammars and file types for highlighting
  extensions, languages for language services. Themes and runtimes have none, so the tab is left out.
- **Tabs** show one panel at a time when JavaScript is on (`#changelog` opens that tab); without JavaScript all
  three panels are shown one after another.
- **Styles are separate from the home page.** `extensions.css` pulls in the fonts, `tokens.css` and `base.css` with
  `@import` instead of the layout importing them again. If both layouts imported the same CSS module, the build would
  move it into a shared chunk and the home page would get an extra render-blocking stylesheet. After touching the
  layouts, check that `dist/_astro` still has one `index.*.css` for the home page.
- **The small logo** in the top bar is the home page's dot-matrix wordmark (same sampling as `dots.ts`) at the
  height of the bar, without the pink band. Its size comes from CSS, so it does not move the layout.

## Icons

`src/assets/sprite.svg` holds every icon as a `<symbol>`; they are used through `Icon.astro` and
`FileIcon.astro`. They are the same icons the Loog app uses, so the mock window matches the real UI:

| Prefix | Source                                                                   |
| ------ | ------------------------------------------------------------------------ |
| `i-`   | VS Code Codicons (`Vs*`) and Lucide (`Lu*`) via the `icondata` crates     |
| `m-`   | Material Icon Theme file and folder icons (`loog/assets/icon-themes/material`) |
| `w-`   | Window buttons (`loog/assets/icons`)                                      |

The sprite was extracted from the original HTML prototype; there is no generator script yet.

**Licences still to be surfaced on the site.** Verified: the `icondata_vs` / `icondata_lu` crates are MIT,
and Material Icon Theme is MIT (Copyright (c) 2025 Material Extensions). Not yet verified here: the licences of
the underlying Codicons and Lucide sets (Codicons are, to my knowledge, CC BY 4.0, which requires attribution;
Lucide is ISC). Check upstream and add the notices before launch.

## Deployment

The site is static, so any static host works. It is set up for Cloudflare's Workers static-assets flow
(Workers & Pages, connect to Git): the deploy step just uploads `dist/`, with no Worker code. Settings in the
dashboard:

| Setting         | Value                 |
| --------------- | --------------------- |
| Project name    | `loog-website` (must match `name` in `wrangler.jsonc`, or the build fails) |
| Build command   | `pnpm run build`      |
| Deploy command  | `npx wrangler deploy` (the default) |

- `wrangler.jsonc` says where the files are (`assets.directory: ./dist`). `npx wrangler deploy --dry-run`
  validates it locally without uploading anything.
- `.node-version` is `24`, which the build image resolves to its preinstalled Node 24.x. Use a major version:
  the project needs 22.23.4 or newer, `engines` is not read by the host, and the preinstalled Node 22 may be
  older than that. If the build fails on the package manager, set `PNPM_VERSION` to the version that wrote
  `pnpm-lock.yaml` (10.28.1).
- `public/_headers` sets cache times: a year for the content-hashed files under `/_astro/`, 10 minutes plus
  `stale-while-revalidate` for the page, 30 days for the favicons and 7 days for `og.png`. The files with fixed
  names are shorter on purpose: after a change, visitors keep the old copy until it expires.
- The site is live at <https://loog.dev>, added under the Worker's **Custom Domains and Routes**. `site` in
  `astro.config.mjs` is the same address; `Base.astro` uses it for the canonical link and `og:url`.
  Pushing to `main` redeploys automatically.

## SEO

- **Search-result copy** lives in `src/data/site.ts`: `seoTitle` (brand first, about 60 characters) and
  `description` (about 155 characters or fewer). `Base.astro` uses them for `<title>`, the description, Open
  Graph and the Twitter card.
- **Structured data** (`Base.astro`): a JSON-LD graph with a `WebSite` and a free `SoftwareApplication`
  (category, operating systems, licences, download URL). It deliberately has no rating, review or version
  number: there is no real data for the first two, and a version would go stale.
- **Share image**: `public/og.png`, 1200×630, shown when the link is shared. It is a screenshot of the first
  screen: lay the page out at 1500×788 in headless Chrome and capture it at a device scale of 0.8, with
  `?static` so the canvas intro is skipped. The declared size in `site.ts` must match the file. Regenerate it
  when the first screen's design changes.
- **`public/robots.txt` and the sitemap**. `robots.txt` is a file in `public/`. The sitemap is generated
  (`src/pages/sitemap.xml.ts`) from the home page, the extensions list and every extension page, so it needs no
  editing; a new static page has to be added to its path list. Cloudflare's "managed robots.txt" feature may add its
  own header to the served `robots.txt`.
- **One `<h1>`** (visually hidden, "Loog: A fast, minimal code editor.") says what the page is. The wordmark on
  the canvas is the visual title.
- **Not code, but it matters most:** register the site in Google Search Console and Bing Webmaster Tools and
  submit the sitemap, link to `loog.dev` from the Loog repository (its Website field and README), and earn
  links from places developers read.

## Status

- The first screen is complete on desktop, tablet and phone widths.
- The Download button links to the latest GitHub release. It always reads "Download for Windows": OS
  detection and per-platform links are not implemented yet.
- The extensions list and one page per extension (55 at the time of writing) are built from the signed extension
  index. They are not rebuilt on their own when the index changes, and Install needs the app to handle `loog://`.
- No licence has been chosen for this repository.
- Deployed on Cloudflare at <https://loog.dev>, with a share image, sitemap, `robots.txt` and structured data.
- English only: there is no Chinese version or `hreflang` yet.
