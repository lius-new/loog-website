// 首屏的交互:悬停联动、键盘快捷键。

/** 悬停(或聚焦)某个功能时,在 .hero 上写 data-hl,样式据此点亮右侧窗口里对应的区域(styles/hero.css)。 */
export function initHighlightSync(): void {
  const hero = document.getElementById('hero');
  if (!hero) return;
  document.querySelectorAll<HTMLElement>('[data-hl]').forEach((el) => {
    const on = () => {
      hero.dataset.hl = el.dataset.hl;
    };
    const off = () => {
      delete hero.dataset.hl;
    };
    el.addEventListener('mouseenter', on);
    el.addEventListener('mouseleave', off);
    el.addEventListener('focus', on);
    el.addEventListener('blur', off);
  });
}

/** 键盘 G / E / D:打开 GitHub、扩展指南、文档(对应 FeatureIndex 里带 data-key 的大号链接)。 */
export function initShortcuts(): void {
  addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const active = document.activeElement;
    if (active && /^(INPUT|TEXTAREA)$/.test(active.tagName)) return;
    const link = document.querySelector<HTMLAnchorElement>(`.catalog [data-key="${e.key.toLowerCase()}"]`);
    if (!link) return;
    e.preventDefault();
    window.open(link.href, '_blank', 'noopener');
  });
}
