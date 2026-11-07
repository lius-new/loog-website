// 窗口示意里的提交对比内容。
// html 字段是受信任的静态片段(已转义;注释行包在 <span class="c"> 里),由 <Fragment set:html> 渲染。

export interface DiffRow { n: number; kind?: 'add' | 'del'; html: string }
export interface Gutter { height: number; d: string; fill: string; stroke: string }
export interface Hunk { header: string; left: DiffRow[]; right: DiffRow[]; gutter?: Gutter }
export interface DiffFile { name: string; add: number; del: number; hunks: Hunk[] }

export const diff: DiffFile[] = [
  {
    name: "src/app/bootstrap.rs", add: 6, del: 0,
    hunks: [
      {
        header: "@@ -67,6 +67,12 @@ pub(crate) fn svg_icons() -> SvgIconRegistry {",
        left: [
        { n: 67, html: "        .with_icon(\"copy\", icondata::VsCopy)" },
        { n: 68, html: "        .with_icon(\"enter\", r#\"&lt;svg xmlns=\"http://www.w3.org/2000/svg\"\"#)" },
        { n: 69, html: "        .with_icon(\"terminal\", icondata::VsTerminal)" },
        { n: 70, html: "        .with_icon(\"terminal-stop\", icondata::VsDebugStop)" },
        { n: 71, html: "        .with_icon(\"terminal-split\", icondata::VsSplitHorizontal)" },
        { n: 72, html: "        .with_icon(\"terminal-more\", icondata::VsEllipsis)" },
        ],
        right: [
        { n: 67, html: "        .with_icon(\"copy\", icondata::VsCopy)" },
        { n: 68, html: "        .with_icon(\"enter\", r#\"&lt;svg xmlns=\"http://www.w3.org/2000/svg\"\"#)" },
        { n: 69, html: "        .with_icon(\"terminal\", icondata::VsTerminal)" },
        { n: 70, kind: "add", html: "<span class=\"c\">        // Bottom-panel tabs: one outline family (Lucide) so the</span>" },
        { n: 71, kind: "add", html: "<span class=\"c\">        // four share stroke weight and none carries a frame.</span>" },
        { n: 72, kind: "add", html: "        .with_icon(\"panel-terminal\", icondata::LuTerminal)" },
        { n: 73, kind: "add", html: "        .with_icon(\"panel-commits\", icondata::LuGitCommitHorizontal)" },
        { n: 74, kind: "add", html: "        .with_icon(\"panel-output\", icondata::LuScrollText)" },
        { n: 75, kind: "add", html: "        .with_icon(\"panel-problems\", icondata::LuCircleAlert)" },
        { n: 76, html: "        .with_icon(\"terminal-stop\", icondata::VsDebugStop)" },
        { n: 77, html: "        .with_icon(\"terminal-split\", icondata::VsSplitHorizontal)" },
        { n: 78, html: "        .with_icon(\"terminal-more\", icondata::VsEllipsis)" },
        ],
        gutter: {height: 264, d: "M0 66 C20 66 20 66 40 66 L40 198 C20 198 20 66 0 66 Z", fill: "#dcefe1", stroke: "#bfe0c9"},
      },
    ],
  },
  {
    name: "src/app/chrome.rs", add: 11, del: 0,
    hunks: [
      {
        header: "@@ -185,6 +185,14 @@ pub fn status_binding(state: &AppContext) -> …",
        left: [
        { n: 185, html: "        pending: app.keymap.pending().to_vec()," },
        { n: 186, html: "        language: syntax_notes()," },
        { n: 187, html: "        language_services: services_menu::status(&amp;app)," },
        { n: 188, html: "        vim: editor_vim::is_active(&amp;app)" },
        { n: 189, html: "            .then(|| (app.editor.vim.mode(), app.editor.vim.status()))," },
        { n: 190, html: "        file: app.workspace.active().map(|id| FileStatus {" },
        ],
        right: [
        { n: 185, html: "        pending: app.keymap.pending().to_vec()," },
        { n: 186, html: "        language: syntax_notes()," },
        { n: 187, html: "        language_services: services_menu::status(&amp;app)," },
        { n: 188, kind: "add", html: "        problems: {" },
        { n: 189, kind: "add", html: "            let counts = problems::counts();" },
        { n: 190, kind: "add", html: "            Some(ProblemCounts {" },
        { n: 191, kind: "add", html: "                errors: counts.errors," },
        { n: 192, kind: "add", html: "                warnings: counts.warnings," },
        { n: 193, kind: "add", html: "                infos: counts.infos," },
        { n: 194, kind: "add", html: "            })" },
        { n: 195, kind: "add", html: "        }," },
        { n: 196, html: "        vim: editor_vim::is_active(&amp;app)" },
        { n: 197, html: "            .then(|| (app.editor.vim.mode(), app.editor.vim.status()))," },
        { n: 198, html: "        file: app.workspace.active().map(|id| FileStatus {" },
        ],
        gutter: {height: 308, d: "M0 66 C20 66 20 66 40 66 L40 242 C20 242 20 66 0 66 Z", fill: "#dcefe1", stroke: "#bfe0c9"},
      },
      {
        header: "@@ -255,6 +263,9 @@ pub fn status_binding(state: &AppContext) -> …",
        left: [
        { n: 255, html: "        crate::app::highlight_menu::open(&amp;writer);" },
        { n: 256, html: "        }" },
        { n: 257, html: "    }" },
        { n: 258, html: "    StatusCommand::LanguageServices =&gt; {" },
        { n: 259, html: "        if writer.get().menu.visible {" },
        { n: 260, html: "            writer.update(|app| app.menu.close());" },
        ],
        right: [
        { n: 263, html: "        crate::app::highlight_menu::open(&amp;writer);" },
        { n: 264, html: "        }" },
        { n: 265, html: "    }" },
        { n: 266, kind: "add", html: "    StatusCommand::Problems =&gt; writer.update(|app| {" },
        { n: 267, kind: "add", html: "        app.toggle_log_panel(PanelTab::Problems)" },
        { n: 268, kind: "add", html: "    })," },
        { n: 269, html: "    StatusCommand::LanguageServices =&gt; {" },
        { n: 270, html: "        if writer.get().menu.visible {" },
        { n: 271, html: "            writer.update(|app| app.menu.close());" },
        ],
        gutter: {height: 198, d: "M0 66 C20 66 20 66 40 66 L40 132 C20 132 20 66 0 66 Z", fill: "#dcefe1", stroke: "#bfe0c9"},
      },
    ],
  },
  {
    name: "src/app/language_services.rs", add: 13, del: 10,
    hunks: [
      {
        header: "@@ -190,20 +190,23 @@ impl LanguageServices {",
        left: [
        { n: 190, html: "    }" },
        { n: 191, html: "" },
        { n: 192, html: "<span class=\"c\">    /// Errors in files that are not open, for the Problems badge.</span>" },
        { n: 193, kind: "del", html: "    pub fn closed_error_count(&amp;self, open: &amp;BTreeSet&lt;String&gt;) -&gt; usize {" },
        { n: 194, kind: "del", html: "        use crate::features::language_service::Severity;" },
        { n: 195, kind: "del", html: "        self.closed" },
        { n: 196, html: "            .lock()" },
        { n: 197, html: "            .unwrap()" },
        { n: 198, html: "            .iter()" },
        { n: 199, html: "            .filter(|(key, _)| !open.contains(key))" },
        ],
        right: [
        { n: 190, html: "    }" },
        { n: 191, html: "" },
        { n: 192, html: "<span class=\"c\">    /// Errors in files that are not open, for the Problems badge.</span>" },
        { n: 193, kind: "add", html: "    pub fn closed_counts(" },
        { n: 194, kind: "add", html: "        &amp;self," },
        { n: 195, kind: "add", html: "        open: &amp;BTreeSet&lt;String&gt;," },
        { n: 196, kind: "add", html: "    ) -&gt; Counts {" },
        { n: 197, kind: "add", html: "        let mut counts = Counts::default();" },
        { n: 198, kind: "add", html: "        for (_, file) in self" },
        { n: 199, kind: "add", html: "            .closed" },
        { n: 200, html: "            .lock()" },
        { n: 201, html: "            .unwrap()" },
        ],
        gutter: {height: 220, d: "M0 66 C20 66 20 66 40 66 L40 220 C20 220 20 132 0 132 Z", fill: "#efe6d9", stroke: "#e0d3bf"},
      },
    ],
  },
];
