// 手机 / 平板:窗口示意按 760px 的设计宽度排好完整的三栏,再按容器宽度等比缩放(<= 1),内容不删减。
// 比例写在 .hero 的 --win-scale 上,由 styles/responsive.css 里的 zoom 使用。

const DESIGN_WIDTH = 760;

export function initWindowScale(): void {
  const hero = document.getElementById('hero');
  const stage = document.getElementById('stage');
  if (!hero || !stage) return;

  const fit = () => {
    const scale = Math.min(1, Math.max(0.28, stage.clientWidth / DESIGN_WIDTH));
    hero.style.setProperty('--win-scale', scale.toFixed(3));
  };
  new ResizeObserver(fit).observe(stage);
  fit();
}
