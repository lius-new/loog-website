# Loog website

The official website for [Loog](https://github.com/lius-new/loog), a fast, minimal code editor written in Rust.

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
  pages/index.astro        the page: Hero + script wiring
  layouts/Base.astro       <head>, self-hosted fonts, global styles, icon sprite
  components/
    Hero.astro             canvas + stage; assembles the pieces below
    Intro.astro            tagline, subtitle, Download button
    FeatureIndex.astro     feature index + large links (desktop)
    QuickLinks.astro       GitHub / Extensions / Docs row (mobile)
    AppWindow.astro        the mock Loog window (decorative, aria-hidden)
    Icon.astro, FileIcon.astro, Sprite.astro
  data/
    site.ts                name, tagline, URLs, features, links: the single source of copy
    mock.ts                file lists shown inside the mock window
    diff.ts                the commit diff shown inside the mock window
  scripts/
    dots.ts                the dot-matrix canvas and its intro animation
    interactions.ts        hover-to-highlight sync, G / E / D shortcuts
    window-scale.ts        scales the mock window to fit phones
  styles/
    tokens.css  base.css  hero.css  window.css  responsive.css   (imported in this order)
  assets/sprite.svg        icon sprite
public/                    favicon (the Loog icon)
```

To change copy or links, edit `src/data/site.ts`; the left column, the mobile link row and the keyboard
shortcuts are all generated from it.

## Design notes

- **Palette** comes from the app icon: warm black `#1c1a17`, cream `#fff4ea`, and the pink thread `#ff758f`.
  Pink is reserved for the wordmark's thread, the download button and hover/active states.
- **Dot field** (`dots.ts`). The wordmark is rendered to an offscreen canvas, sampled onto a dot grid, and
  crossed by a sine-shaped band. The intro runs in three passes: base dots, wordmark, then the pink band.
  On phones (`<= 900px`) the wordmark sits at the top and all three passes run top to bottom.
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

## Status

- The first screen is complete on desktop, tablet and phone widths.
- The Download button links to the latest GitHub release. It always reads "Download for Windows": OS
  detection and per-platform links are not implemented yet.
- No licence has been chosen for this repository.
- No deployment is configured (`astro.config.mjs` has no `site`).
