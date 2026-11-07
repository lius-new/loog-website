// 首屏编辑器窗口里的示意数据:Changes 列表和文件树。
// 文件图标的映射规则与应用内 src/ui/file_icons.rs 保持一致。

export type FileIconName =
  | 'rust'
  | 'markdown'
  | 'html'
  | 'css'
  | 'toml'
  | 'git'
  | 'document'
  | 'folder'
  | 'folder-open';

export function fileIconFor(name: string): FileIconName {
  const n = name.toLowerCase();
  if (['cargo.toml', 'cargo.lock', 'rust-toolchain.toml', 'rust-toolchain'].includes(n)) return 'rust';
  if (['.gitignore', '.gitattributes'].includes(n)) return 'git';
  const ext = n.includes('.') ? n.split('.').pop() : '';
  const byExt: Record<string, FileIconName> = { rs: 'rust', md: 'markdown', html: 'html', css: 'css', toml: 'toml' };
  return (ext && byExt[ext]) || 'document';
}

export interface ChangedFile {
  name: string;
  /** 所在目录(可省略) */
  path?: string;
  /** M = 已修改,? = 未跟踪 */
  status: 'M' | '?';
  /** 当前选中行 */
  on?: boolean;
}

export const changes = {
  unstaged: [
    { name: 'editor.rs', path: 'src', status: 'M', on: true },
    { name: 'chrome.rs', path: 'src/app', status: 'M' },
    { name: 'statusbar.rs', path: 'src/ui', status: 'M' },
    { name: 'view.rs', path: 'src/ui/terminal', status: 'M' },
    { name: 'README.md', status: 'M' },
    { name: 'Cargo.toml', status: 'M' },
  ] satisfies ChangedFile[],
  untracked: [
    { name: 'index.html', path: 'website', status: '?' },
    { name: 'weave.rs', path: 'src', status: '?' },
    { name: 'style.css', path: 'website', status: '?' },
  ] satisfies ChangedFile[],
};

export interface TreeEntry {
  name: string;
  dir?: boolean;
  /** 根目录(展开) */
  root?: boolean;
  /** 被 .gitignore 忽略的,调淡显示 */
  dim?: boolean;
  /** 高亮(新增的目录) */
  hl?: boolean;
}

const dirs = (...names: string[]): TreeEntry[] => names.map((name) => ({ name, dir: true }));
const files = (...names: string[]): TreeEntry[] => names.map((name) => ({ name }));

export const tree: TreeEntry[] = [
  { name: 'loog', dir: true, root: true },
  ...dirs('.claude', '.git', '.github'),
  { name: '.packaging', dir: true, dim: true },
  ...dirs('assets', 'crates', 'docs', 'examples', 'icons', 'scripts', 'sdk', 'src'),
  { name: 'target', dir: true, dim: true },
  ...dirs('tests', 'tools', 'vendor'),
  { name: 'website', dir: true, hl: true },
  ...dirs('wit'),
  ...files(
    '.gitattributes',
    '.gitignore',
    'AGENTS.md',
    'CONTRIBUTING.md',
    'Cargo.lock',
    'Cargo.toml',
    'LICENSE-APACHE',
    'LICENSE-MIT',
    'README.md',
    'README.zh-CN.md',
    'THIRD_PARTY_NOTICES.md',
    'build.rs',
    'rust-toolchain.toml',
  ),
];
