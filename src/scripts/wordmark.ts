// 顶栏左边的点阵字标:和首页同一个做法(见 dots.ts),只是缩小到顶栏高度,并且没有粉色波带。
//
// 把 "Loog" 画到离屏画布,按覆盖率采样成点阵,奶油色的点组成字母。鼠标移上去时附近的点变大变粉。
// 画布大小来自 CSS(.gh .logo),不写任何影响版面的属性,所以不会引起布局跳动。

type Dot = [x: number, y: number, r: number];

const FAMILY = '"Bricolage Grotesque Variable", "Segoe UI", system-ui, sans-serif';
const CREAM = '#fff4ea';
const THREAD = '#ff758f';
const S = 4; // 点距(CSS 像素)

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

export function initWordmark(): void {
  const el = document.getElementById('wordmark');
  if (!(el instanceof HTMLCanvasElement)) return;
  const ctx = el.getContext('2d');
  if (!ctx) return;
  const canvas: HTMLCanvasElement = el;
  const g: CanvasRenderingContext2D = ctx;

  let dots: Dot[] = [];
  let W = 0;
  let H = 0;
  let dpr = 1;
  let mx = -1e4;
  let my = -1e4;
  let raf = 0;

  function build(): void {
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    if (!W || !H) return;
    dpr = Math.min(devicePixelRatio || 1, 3);
    canvas.width = W * dpr;
    canvas.height = H * dpr;

    const capTop = 9;
    const fs = (H - capTop - 4) / 1.02;
    const baseline = capTop + fs * 0.72;
    const off = document.createElement('canvas');
    off.width = W;
    off.height = H;
    const o = off.getContext('2d', { willReadFrequently: true });
    if (!o) return;
    o.letterSpacing = '-0.03em';
    o.font = `800 ${fs}px ${FAMILY}`;
    o.filter = `blur(${(S * 0.32).toFixed(1)}px)`;
    o.fillStyle = '#fff';
    o.textBaseline = 'alphabetic';
    o.fillText('Loog', 1, baseline);
    const img = o.getImageData(0, 0, W, H).data;

    dots = [];
    for (let y = 0, row = 0; y < H + S; y += S, row++) {
      for (let x = ((row % 2) * S) / 2; x < W + S; x += S) {
        const a = img[(Math.min(H - 1, y | 0) * W + Math.min(W - 1, x | 0)) * 4 + 3] / 255;
        const c = clamp((a - 0.1) / 0.75);
        if (c > 0.05) dots.push([x, y, S * 0.47 * c]);
      }
    }
    draw();
    canvas.dataset.ready = '';
  }

  function draw(): void {
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, H);
    const reach2 = (S * 9) ** 2;
    for (const d of dots) {
      let r = d[2];
      let pink = false;
      const dx = d[0] - mx;
      const dy = d[1] - my;
      const dd = dx * dx + dy * dy;
      if (dd < reach2) {
        const b = Math.exp(-dd / (reach2 * 0.24));
        r += S * 0.3 * b;
        if (b > 0.3) pink = true;
      }
      g.fillStyle = pink ? THREAD : CREAM;
      g.beginPath();
      g.arc(d[0], d[1], r, 0, Math.PI * 2);
      g.fill();
    }
  }

  canvas.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    mx = e.clientX - r.left;
    my = e.clientY - r.top;
    if (!raf) {
      raf = requestAnimationFrame(() => {
        raf = 0;
        draw();
      });
    }
  });
  canvas.addEventListener('pointerleave', () => {
    mx = my = -1e4;
    draw();
  });

  let resizeTimer: ReturnType<typeof setTimeout>;
  new ResizeObserver(() => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(build, 80);
  }).observe(canvas);

  // 等字体就绪再画字标;最多等 1.5 秒,避免字体加载失败时字标永远不出现
  const fontsReady = document.fonts
    ? Promise.all([document.fonts.load(`800 100px ${FAMILY}`), document.fonts.ready]).catch(() => {})
    : Promise.resolve();
  Promise.race([fontsReady, new Promise((resolve) => setTimeout(resolve, 1500))]).then(build);
}
