## Project conventions

See [docs/development.md](docs/development.md) for the layout and design notes (the README is about the product, not this repo). The rules that are easy to break:

- Copy, URLs, features and links live in `src/data/site.ts`; components render from it. Do not hard-code them in templates.
- Curly braces in `.astro` text are expressions. Code samples belong in `src/data/` and are rendered with `<Fragment set:html>`.
- `.dl` diff rows use `white-space: pre`: keep each row on one line, with nothing between `<i>` and the code.
- `styles/responsive.css` must stay the last stylesheet imported (it overrides the desktop styles).
- Nothing above the fold may change size while the page loads. `--wm-bottom` is pure CSS and depends on the constant
  `--wm-em` (tokens.css); re-measure `--wm-em` if the wordmark's font, weight or letter-spacing changes (see docs/development.md).
  Do not write layout-affecting custom properties from scripts that wait for fonts.
- Extension data comes from the signed index in the extension repository, read at build time (`src/data/extensions.ts`).
  Never copy extension names, descriptions or versions into this repository.
- The home page and the extensions pages must not import the same CSS module: the build would turn it into a shared chunk
  and the home page would get an extra render-blocking stylesheet. `extensions.css` pulls in fonts, tokens and base with
  `@import`. After changing layouts, `dist/_astro` should still contain one `index.*.css`.
- Before finishing a change, run `pnpm build` and `pnpm typecheck`. `.astro` files are not covered by `typecheck`.
- The page is checked against its design by screenshots at 1440, 1800, 2000 (desktop), 800 (tablet) and 390 (phone) widths.
  `?static` and `?t=<seconds>` freeze the canvas intro so screenshots are deterministic.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
