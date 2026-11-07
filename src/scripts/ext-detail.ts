// 扩展详情页的交互:Details / Contributions / Changelog 标签切换(地址里的 #标签 可以直接打开某一页),复制标识符。
// 没有脚本时三块内容都显示(见 extensions.css 里的 .js .panel)。

export function initExtensionDetail(): void {
  const tabs = [...document.querySelectorAll<HTMLAnchorElement>('#tabs [data-tab]')];
  const panels = new Map<string, HTMLElement>();
  document.querySelectorAll<HTMLElement>('.panel').forEach((p) => panels.set(p.id.replace(/^p-/, ''), p));

  function show(id: string, push: boolean): void {
    if (!panels.has(id)) id = 'details';
    panels.forEach((panel, key) => {
      if (key === id) panel.setAttribute('data-active', '');
      else panel.removeAttribute('data-active');
    });
    tabs.forEach((tab) => {
      if (tab.dataset.tab === id) tab.setAttribute('aria-current', 'page');
      else tab.removeAttribute('aria-current');
    });
    // 只改地址栏的 #标签,不滚动;默认的 Details 不带 #
    if (push) history.replaceState(null, '', id === 'details' ? location.pathname + location.search : `#${id}`);
  }

  tabs.forEach((tab) =>
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      show(tab.dataset.tab ?? 'details', true);
    }),
  );
  addEventListener('hashchange', () => show(location.hash.slice(1), false));
  show(location.hash.slice(1), false);

  // 复制标识符
  document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((btn) =>
    btn.addEventListener('click', () => {
      void navigator.clipboard?.writeText(btn.dataset.copy ?? '');
      const label = btn.textContent;
      btn.textContent = 'copied';
      setTimeout(() => (btn.textContent = label), 1200);
    }),
  );
}
