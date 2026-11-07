// 站点内容的唯一来源:首屏左栏、手机端的链接行都从这里生成。

export const SITE = {
  name: 'Loog',
  tagline: 'Edit, run, commit.',
  subtitle: 'A fast, minimal code editor.',
  /** 搜索结果里的标题:品牌名在前,约 60 个字符以内 */
  seoTitle: 'Loog — A fast code editor with a built-in terminal and Git',
  /** 搜索结果里的摘要:约 155 个字符以内 */
  description:
    'Loog is a fast, open-source code editor written in Rust: an alternative to VS Code and Zed, with a built-in terminal, Git and language servers.',
  repo: 'https://github.com/lius-new/loog',
  /** 分享图(public/og.png),1200×630 */
  shareImage: { path: '/og.png', width: 1200, height: 630, alt: 'Loog: a dot-matrix wordmark above a code editor window with a commit diff and a terminal' },
} as const;

export const URLS = {
  repo: SITE.repo,
  releases: `${SITE.repo}/releases/latest`,
  extensions: `${SITE.repo}/blob/main/docs/extensions-roadmap.md`,
  docs: `${SITE.repo}/tree/main/docs`,
} as const;

/** 悬停某一功能时,右侧窗口里亮起的区域(对应 styles/hero.css 里的 data-hl 规则)。 */
export type HighlightTarget =
  | 'native'
  | 'highlighting'
  | 'diagnostics'
  | 'extensions'
  | 'encodings'
  | 'terminal'
  | 'git'
  | 'markdown'
  | 'sessions';

export interface Feature {
  name: string;
  hint: string;
  hl: HighlightTarget;
}

export const coreFeatures: Feature[] = [
  { name: 'Native', hint: 'Rust and Skia', hl: 'native' },
  { name: 'Highlighting', hint: 'Tree-sitter', hl: 'highlighting' },
  { name: 'Diagnostics', hint: 'Language servers', hl: 'diagnostics' },
  { name: 'Extensions', hint: 'WebAssembly', hl: 'extensions' },
];

export const everydayFeatures: Feature[] = [
  { name: 'Encodings', hint: 'GBK, Big5, Shift_JIS', hl: 'encodings' },
  { name: 'Terminal', hint: 'Shells and WSL', hl: 'terminal' },
  { name: 'Git', hint: 'Diffs and worktrees', hl: 'git' },
  { name: 'Markdown', hint: 'Live preview', hl: 'markdown' },
  { name: 'Sessions', hint: 'Restored on restart', hl: 'sessions' },
];

export interface LinkItem {
  /** 手机端图标按钮上的短名 */
  label: string;
  /** 桌面端大号链接行上的名称 */
  title: string;
  hint: string;
  href: string;
  /** 键盘快捷键(单个字母,不区分大小写) */
  key: string;
  /** 图标在精灵图里的名字(i-<icon>) */
  icon: string;
}

export const links: LinkItem[] = [
  { label: 'GitHub', title: 'GitHub repository', hint: 'lius-new/loog', href: URLS.repo, key: 'g', icon: 'github' },
  { label: 'Extensions', title: 'Extensions', hint: 'guide', href: URLS.extensions, key: 'e', icon: 'extensions' },
  { label: 'Docs', title: 'Documentation', hint: 'docs/', href: URLS.docs, key: 'd', icon: 'book' },
];
