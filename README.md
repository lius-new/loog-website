<p align="center">
  <img src="public/favicon.svg" alt="Loog" width="96" height="96">
</p>

<h1 align="center">Loog</h1>

<p align="center">
  <strong>A fast, minimal code editor with an integrated terminal and Git, written in Rust.</strong>
</p>

<p align="center">
  <a href="https://github.com/lius-new/loog/releases/latest">Download</a> ·
  <a href="https://github.com/lius-new/loog/tree/main/docs">Documentation</a> ·
  <a href="https://loog.dev/extensions/">Extensions</a> ·
  <a href="https://github.com/lius-new/loog">GitHub</a>
</p>

Loog is a desktop editor for Windows, macOS and Linux. It stays small and responsive while covering the
daily loop of editing, searching, running commands and working with Git, without leaving the window.

> [!NOTE]
> Loog is in early development (version 0.1). Expect rough edges, and expect settings and behavior to
> change between releases.

## What you get

- **Native and fast.** A real desktop app built in Rust and rendered with Skia, not a web view.
- **Editing that handles every script.** Grapheme-aware text (CJK, combining marks, emoji), IME input,
  multiple cursors, rectangular selections, soft wrap, code folding, split panes and an optional Vim mode.
- **Languages.** Tree-sitter syntax highlighting, and language servers for completion, hover, signature help,
  definitions, references, rename, formatting, diagnostics and code actions.
- **Text encodings.** UTF-8, UTF-16, GBK, GB18030, Big5, Shift_JIS and more, detected automatically. Saves preserve
  the selected encoding, BOM and LF/CRLF line endings.
- **Terminal built in.** PowerShell, Command Prompt, Git Bash, bash, zsh, fish or any custom shell, in tabs
  and splits that follow your working directory.
- **Git built in.** Staging, commits, fetch, pull and push, branches, tags, stashes, history, diffs and
  worktrees, refreshed in the background across every repository in the workspace.
- **Markdown.** Live reading and side-by-side previews, even for unsaved files.
- **Search.** Search every folder with case, whole-word, regex and include/exclude globs; it respects
  `.gitignore` and searches unsaved buffers.
- **Sessions.** Tabs, pane layout, source positions and terminal directories come back after a restart.
- **Extensions.** WebAssembly extensions add commands, diagnostics, themes, snippets and language packs.
- **Yours to shape.** Light, dark and high-contrast themes, a `keymap.json` with contexts and key sequences,
  per-project settings, interface scaling from 80% to 200%, and independent editor and terminal fonts.

## Download

Get the latest build from the [Releases](https://github.com/lius-new/loog/releases/latest) page.

| Platform | Packages |
| --- | --- |
| Windows x64 | Per-user installer (no admin rights needed) or portable `.zip` |
| macOS 11+ (Apple Silicon and Intel) | Universal `.dmg` or `.zip` |
| Linux x64 | `.deb`, `.AppImage` or `.tar.gz` |

Every release ships a `SHA256SUMS` file for each platform. A few things to know:

- **Windows:** the packages are not code-signed yet, so SmartScreen warns on first run. A Git runtime is included.
- **macOS:** the app is not notarized yet, so Gatekeeper blocks the first launch. Control-click Loog.app and
  choose **Open**. Loog uses the system `git`.
- **Linux:** needs glibc 2.39 or newer (for example Ubuntu 24.04 or Fedora 40) and an X11 or Wayland session.
  Loog uses the system `git`.

Open a folder or file from a terminal with `loog .` or `loog path/to/file`. Packaged builds check for new
releases and can update themselves, depending on how Loog was installed.

## Learn more

- [Editing](https://github.com/lius-new/loog/blob/main/docs/editing.md): files, sessions, multiple cursors, folding, soft wrap and Vim
- [Languages](https://github.com/lius-new/loog/blob/main/docs/languages.md): syntax packages and language servers
- [Text file encodings](https://github.com/lius-new/loog/blob/main/docs/encoding.md): detection, switching and saving
- [Markdown reading](https://github.com/lius-new/loog/blob/main/docs/markdown.md): reading mode and live previews
- [Workspace search](https://github.com/lius-new/loog/blob/main/docs/search.md)
- [Terminal](https://github.com/lius-new/loog/blob/main/docs/terminal.md): shells, WSL and working directories
- [Git](https://github.com/lius-new/loog/blob/main/docs/git.md): source control, diffs, history and worktrees
- [Settings and key bindings](https://github.com/lius-new/loog/blob/main/docs/settings.md)
- [Extensions](https://github.com/lius-new/loog/blob/main/docs/extensions-roadmap.md): what works today and what is next
- [Updates](https://github.com/lius-new/loog/blob/main/docs/updates.md)

Found a bug or have an idea? [Open an issue](https://github.com/lius-new/loog/issues).

## License

Loog is licensed under either of the Apache License, Version 2.0 or the MIT license, at your option. See the
[Loog repository](https://github.com/lius-new/loog) for the full texts.

---

Working on this website's source? See [docs/development.md](docs/development.md).
