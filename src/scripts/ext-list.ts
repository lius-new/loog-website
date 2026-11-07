// 扩展列表页的交互:搜索过滤、左侧索引(点击跳转、滚动时高亮当前分区)、按 / 聚焦搜索框。
// 没有脚本时页面仍然是完整的列表,只是不能过滤。

export function initExtensionList(): void {
  const input = document.getElementById('q');
  const rail = document.getElementById('rail');
  const none = document.getElementById('none');
  if (!(input instanceof HTMLInputElement) || !rail || !none) return;
  const search: HTMLInputElement = input;
  const noneEl: HTMLElement = none;

  const sections = [...document.querySelectorAll<HTMLElement>('.sec')];
  const railLinks = new Map<string, HTMLAnchorElement>();
  rail.querySelectorAll<HTMLAnchorElement>('a[data-k]').forEach((a) => railLinks.set(a.dataset.k ?? '', a));

  function filter(): void {
    // 文件类型存的是不带点的 "rs",人们常输入 ".rs":忽略开头的点
    const v = search.value.trim().toLowerCase().replace(/^\./, '');
    let total = 0;
    for (const sec of sections) {
      let n = 0;
      sec.querySelectorAll<HTMLElement>('.row').forEach((row) => {
        const match = !v || (row.dataset.s ?? '').includes(v);
        row.hidden = !match;
        if (match) n++;
      });
      total += n;
      sec.hidden = n === 0;
      const count = sec.querySelector('.cnt');
      if (count) count.textContent = String(n);
      const link = railLinks.get(sec.dataset.k ?? '');
      if (link) {
        link.hidden = n === 0;
        const em = link.querySelector('em');
        if (em) em.textContent = String(n);
      }
    }
    noneEl.hidden = total > 0;
  }
  search.addEventListener('input', filter);

  // 点击索引:平滑滚动到分区(CSS 的 scroll-margin-top 给吸顶的顶栏留位置)
  rail.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[data-k]');
    if (!a) return;
    e.preventDefault();
    document.getElementById(`sec-${a.dataset.k}`)?.scrollIntoView();
  });

  // 滚动时高亮当前分区
  const spy = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        railLinks.forEach((link, k) => link.setAttribute('aria-current', String(k === (entry.target as HTMLElement).dataset.k)));
      }
    },
    { rootMargin: '-100px 0px -65% 0px' },
  );
  sections.forEach((s) => spy.observe(s));
  railLinks.values().next().value?.setAttribute('aria-current', 'true');

  addEventListener('keydown', (e) => {
    if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
    if (document.activeElement === search) return;
    e.preventDefault();
    search.focus();
  });
}
