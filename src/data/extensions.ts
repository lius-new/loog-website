// 扩展数据:构建时从官方扩展仓库发布的签名索引读取,不手写、不提交。
//
// 流程:下载 index.json 和 index.json.sig → 用 Ed25519 公钥验证签名(与应用的做法相同:对 index.json 的原始字节验证)
// → 只保留 loog.* 扩展 → 把 README / 更新日志渲染成清理过的 HTML。
// 下载失败或签名不对时直接让构建失败:宁可不发布,也不发布未验证的数据。
// 索引过期(`expires`)只警告:过期只意味着应用不再提供新版本,页面内容仍然有效。
//
// 数据只在构建时变化。扩展仓库发布新版本后,需要重新构建网站才会更新(见 docs/development.md)。

import { createPublicKey, verify } from 'node:crypto';
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';
import { EXTENSIONS } from './site';

export type Kind = 'lsp' | 'theme' | 'runtime' | 'lang';

/** 页面上分区的顺序和名称 */
export const KINDS: { kind: Kind; title: string; singular: string; blurb: string }[] = [
  { kind: 'lsp', title: 'Language services', singular: 'Service', blurb: 'Diagnostics, completion and navigation, powered by a language server.' },
  { kind: 'theme', title: 'Themes', singular: 'Theme', blurb: 'Color themes for the editor and the terminal.' },
  { kind: 'runtime', title: 'Runtimes', singular: 'Runtime', blurb: 'Interpreters that other extensions run on.' },
  { kind: 'lang', title: 'Languages', singular: 'Syntax', blurb: 'Syntax highlighting built on Tree-sitter grammars.' },
];

export interface Platform {
  platform: string;
  size: number;
}

export interface Extension {
  id: string;
  kind: Kind;
  name: string;
  /** 去掉 "Language"、"Language Server" 等后缀的短名,列表里用 */
  short: string;
  publisher: string;
  description: string;
  license: string;
  version: string;
  /** 最低支持的 Loog 版本,如 "≥0.1.8" */
  needs: string;
  categories: string[];
  keywords: string[];
  /** 语法高亮:语法名 → 文件类型 */
  highlight: { name: string; fileTypes: string[] }[];
  /** 语言服务:服务的名称和语言 */
  service: { name: string; languages: string[] } | null;
  capabilities: string[];
  requires: string[];
  recommends: string[];
  platforms: Platform[];
  /** 构建对应的扩展仓库提交 */
  revision: string | null;
  /** data: 地址,直接放进 <img src> */
  icon: string | null;
  readmeHtml: string;
  changelogHtml: string;
}

interface RawVersion {
  version: string;
  engines: { loog: string };
  capabilities?: string[];
  requires?: string[];
  recommends?: string[];
  artifacts: { platform: string; size: number }[];
  source?: { revision?: string };
}

interface RawExtension {
  id: string;
  name: string;
  publisher: string;
  description: string;
  categories?: string[];
  keywords?: string[];
  license: string;
  highlight?: { name: string; fileTypes?: string[] }[];
  language_service?: { name: string; languages?: string[] };
  icon?: { format: 'svg' | 'png'; data: string };
  readme?: string;
  changelog?: string;
  versions: RawVersion[];
}

interface RawIndex {
  schema: number;
  generated: string;
  expires: string;
  sequence: number;
  keyId: string;
  extensions: RawExtension[];
}

async function download(url: string): Promise<Uint8Array> {
  let last: unknown;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      return new Uint8Array(await res.arrayBuffer());
    } catch (error) {
      last = error;
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }
  throw new Error(`Could not download ${url}: ${last instanceof Error ? last.message : String(last)}`);
}

// Ed25519 公钥的 SPKI 前缀:加上 32 字节原始公钥就是 Node 能读的 DER
const SPKI_ED25519_PREFIX = Buffer.from('302a300506032b6570032100', 'hex');

function verifyIndex(bytes: Uint8Array, signatureFile: Uint8Array): void {
  const sig = JSON.parse(Buffer.from(signatureFile).toString('utf8')) as { keyId: string; algorithm: string; signature: string };
  const raw = EXTENSIONS.keys[sig.keyId];
  if (!raw) throw new Error(`The extension index is signed with an unknown key: ${sig.keyId}`);
  if (sig.algorithm !== 'ed25519') throw new Error(`Unsupported signature algorithm: ${sig.algorithm}`);
  const key = createPublicKey({ key: Buffer.concat([SPKI_ED25519_PREFIX, Buffer.from(raw, 'base64')]), format: 'der', type: 'spki' });
  if (!verify(null, bytes, key, Buffer.from(sig.signature, 'base64'))) {
    throw new Error('The extension index signature is not valid. Refusing to build the extensions pages.');
  }
}

/** Markdown → 清理过的 HTML:不允许脚本、事件属性、图片和相对链接(README 里的相对路径在站内是死链) */
function renderMarkdown(text: string | undefined): string {
  if (!text) return '';
  const source = text.replace(/^# .*\n+/, ''); // 开头的一级标题和页面标题重复
  const html = marked.parse(source, { async: false, gfm: true }) as string;
  return sanitizeHtml(html, {
    allowedTags: ['h1', 'h2', 'h3', 'h4', 'p', 'br', 'hr', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'em', 'strong', 'del', 'a', 'span', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
    allowedAttributes: { a: ['href', 'rel'] },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      a: (_tag: string, attribs: sanitizeHtml.Attributes): sanitizeHtml.Tag => {
        const href = attribs.href ?? '';
        return /^(https?:|mailto:)/i.test(href)
          ? { tagName: 'a', attribs: { href, rel: 'noopener noreferrer' } }
          : { tagName: 'span', attribs: {} };
      },
    },
  });
}

function iconUrl(icon: RawExtension['icon']): string | null {
  if (!icon?.data) return null;
  return icon.format === 'png'
    ? `data:image/png;base64,${icon.data}`
    : `data:image/svg+xml;base64,${Buffer.from(icon.data, 'utf8').toString('base64')}`;
}

const SUFFIX = / (Language Server|Language|Themes|Runtime)$/;
const kindOf = (id: string): Kind | null => {
  const part = id.split('.')[1];
  return part === 'lsp' || part === 'theme' || part === 'runtime' || part === 'lang' ? part : null;
};

function toExtension(raw: RawExtension, kind: Kind): Extension {
  const v = raw.versions[0]; // 索引里版本按新到旧排列
  return {
    id: raw.id,
    kind,
    name: raw.name,
    short: raw.name.replace(SUFFIX, ''),
    publisher: raw.publisher,
    description: raw.description,
    license: raw.license,
    version: v.version,
    needs: v.engines.loog.replace(/ <.*$/, '').replace('>=', '≥'),
    categories: raw.categories ?? [],
    keywords: raw.keywords ?? [],
    highlight: (raw.highlight ?? []).map((h) => ({ name: h.name, fileTypes: h.fileTypes ?? [] })),
    service: raw.language_service ? { name: raw.language_service.name, languages: raw.language_service.languages ?? [] } : null,
    capabilities: v.capabilities ?? [],
    requires: v.requires ?? [],
    recommends: v.recommends ?? [],
    platforms: v.artifacts.map((a) => ({ platform: a.platform, size: a.size })),
    revision: v.source?.revision ?? null,
    icon: iconUrl(raw.icon),
    readmeHtml: renderMarkdown(raw.readme),
    changelogHtml: renderMarkdown(raw.changelog),
  };
}

let cached: Promise<Extension[]> | null = null;

/** 全部 loog.* 扩展,按分区顺序、再按名称排好。同一次构建里只下载一次。 */
export function getExtensions(): Promise<Extension[]> {
  cached ??= (async () => {
    const [indexBytes, signature] = await Promise.all([download(EXTENSIONS.indexUrl), download(EXTENSIONS.signatureUrl)]);
    verifyIndex(indexBytes, signature);
    const index = JSON.parse(Buffer.from(indexBytes).toString('utf8')) as RawIndex;
    if (Date.parse(index.expires) < Date.now()) {
      console.warn(`[extensions] The index expired on ${index.expires}; its content is still used.`);
    }
    // 索引里还有改名前遗留的 loom.* 重复条目,不展示
    const list: Extension[] = [];
    for (const raw of index.extensions) {
      const kind = kindOf(raw.id);
      if (!raw.id.startsWith('loog.') || !kind || !raw.versions?.length) continue;
      list.push(toExtension(raw, kind));
    }
    const rank = new Map(KINDS.map((k, i) => [k.kind, i]));
    list.sort((a, b) => (rank.get(a.kind) ?? 0) - (rank.get(b.kind) ?? 0) || a.short.localeCompare(b.short));
    console.log(`[extensions] ${list.length} extensions from index #${index.sequence} (signature verified)`);
    return list;
  })();
  return cached;
}

/** 语言高亮用到的文件类型或语言服务服务的语言,列表里当标签显示 */
export const tagsOf = (e: Extension): string[] => (e.highlight.length ? e.highlight.flatMap((h) => h.fileTypes) : (e.service?.languages ?? []));

/** 详情页 Contributions 标签的内容;没有结构化数据的扩展(主题、运行时)返回 null,页面上就不显示这个标签 */
export function contributionsOf(e: Extension): { count: number; kind: 'highlight' | 'service' } | null {
  if (e.highlight.length) return { count: e.highlight.length, kind: 'highlight' };
  if (e.service && e.service.languages.length) return { count: e.service.languages.length, kind: 'service' };
  return null;
}

/** 站内地址 */
export const extensionPath = (id: string): string => `/extensions/${id}/`;
