// 首屏的点阵画布。
//
// 把字标 "Loog" 画到离屏画布,按覆盖率采样成点阵,再叠一条粉色波带穿过字母。
// 加载动画分三轮,像铺路一样一层一层来:
//   第 1 轮  铺底:整片淡淡的点
//   第 2 轮  字标:奶油色的点
//   第 3 轮  粉线:压在字母上的粉色波带
// 桌面:铺底、粉线自左向右,字标自上而下逐行。手机(<= 900px):字标在页面顶部,三轮都自上而下。
//
// 调试参数:?static 跳过动画;?t=1.2 把动画定格在 1.2 秒。

type Dot = [x: number, y: number, r: number, pink: 0 | 1, alpha: number, start: number];

const FAMILY = '"Bricolage Grotesque Variable", "Segoe UI", system-ui, sans-serif';
const CREAM = '#fff4ea';
const THREAD = '#ff758f';

const POP = 0.4; // 每个点从无到有的时长(秒)
const LAYERS = [
  { s: 0, d: 1.0 }, // 铺底
  { s: 0.55, d: 1.25 }, // 字标
  { s: 1.3, d: 1.35 }, // 粉线
] as const;
const END = LAYERS[2].s + LAYERS[2].d + 0.05;

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeOutBack = (t: number) => {
  const c1 = 1.3;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

export function initDots(): void {
  const hero = document.getElementById('hero');
  const stage = document.getElementById('stage');
  const cv = document.getElementById('field');
  if (!hero || !stage || !(cv instanceof HTMLCanvasElement)) return;
  const ctx = cv.getContext('2d');
  if (!ctx) return;
  // 下面的 build()/draw() 是函数声明,TypeScript 不会把上面的收窄带进去,所以这里固定成带类型的别名
  const canvas: HTMLCanvasElement = cv;
  const heroEl: HTMLElement = hero;
  const stageEl: HTMLElement = stage;
  const g: CanvasRenderingContext2D = ctx;

  const params = new URLSearchParams(location.search);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches || params.has('static');
  const fixedT = parseFloat(params.get('t') ?? '');

  let W = 0;
  let H = 0;
  let dpr = 1;
  let s = 14; // 点距
  let dots: Dot[] = [];
  let T = reduce ? 99 : 0; // 动画时间(秒);99 = 已完成
  // 字标宽度(em),与 CSS 共用同一个常数
  const wordmarkEm = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--wm-em')) || 2.005;
  let mx = -1e4; // 鼠标位置(画布坐标)
  let my = -1e4;
  let raf = 0;
  let started = false;

  function build(): void {
    W = heroEl.clientWidth;
    H = heroEl.clientHeight;
    dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    s = W > 1700 ? 16 : W < 600 ? 10 : 14;

    const narrow = W <= 900;
    const off = document.createElement('canvas');
    off.width = W;
    off.height = H;
    const o = off.getContext('2d', { willReadFrequently: true });
    if (!o) return;
    o.letterSpacing = '-0.03em';
    const m = wordmarkEm * 100; // 100px 时字标的宽度(来自 CSS 常数,不现场测量,见 styles/tokens.css 的 --wm-em)
    const sr = stageEl.getBoundingClientRect();
    const hr = heroEl.getBoundingClientRect();
    const sx = sr.left - hr.left;
    const sw = sr.width;
    const vh = window.innerHeight;

    // 字标的尺寸与位置
    const capTop = narrow ? 56 : clamp(vh * 0.06, 40, 72);
    const fs0 = (100 * (narrow ? W * 0.88 : sw * 0.66)) / m;
    const fs = narrow ? fs0 : Math.min(fs0, (vh * 0.4 - capTop) / 1.02);
    const x0 = narrow ? W * 0.06 : sx;
    const baseline = capTop + fs * 0.72;
    o.font = `800 ${fs}px ${FAMILY}`;
    o.filter = `blur(${(s * 0.32).toFixed(1)}px)`;
    o.fillStyle = '#fff';
    o.textBaseline = 'alphabetic';
    o.fillText('Loog', x0, baseline);
    const img = o.getImageData(0, 0, W, H).data;

    // 字标的底边。窗口、左栏的位置由 CSS 的 --wm-bottom 用同一个公式算出,这里只用来给"逐行铺设"定行序。
    const wmBottom = baseline + fs * 0.3;

    const bandBase = capTop + fs * 0.34;
    const amp = fs * 0.2;
    const band = fs * 0.042;

    dots = [];
    for (let y = 0, row = 0; y < H + s; y += s, row++) {
      for (let x = ((row % 2) * s) / 2; x < W + s; x += s) {
        // 字母覆盖率 c、波带强度 g
        const a = img[(Math.min(H - 1, y | 0) * W + Math.min(W - 1, x | 0)) * 4 + 3] / 255;
        const c = clamp((a - 0.1) / 0.75);
        const wy = bandBase + Math.sin((x / W) * Math.PI * 2 * 1.25 + 0.5) * amp;
        const g = Math.exp(-(((y - wy) / band) ** 2));

        const letterR = s * 0.47 * c;
        const bandR = s * (0.14 + 0.3 * g);
        const pink = g > 0.32;
        const r0 = Math.max(letterR, g > 0.08 ? bandR : 0, s * 0.09);
        const alpha = c > 0.05 ? 1 : g > 0.08 ? 0.25 + 0.75 * g : 0.13;

        // 分层:粉线(含压在字母上的粉点) > 字标 > 底
        const lay = pink ? 2 : c > 0.05 ? 1 : g > 0.08 ? 2 : 0;
        const rx = x / W;
        const ry = clamp((y - capTop) / (wmBottom - capTop));
        let p: number;
        if (narrow) p = lay === 0 ? y / H : ry; // 手机:底层沿整页自上而下;字标、粉线在顶部这块里自上而下
        else p = lay === 1 ? clamp(0.85 * ry + 0.15 * rx) : rx; // 桌面:字标逐行;底层、粉线自左向右
        const L = LAYERS[lay];
        dots.push([x, y, r0, pink ? 1 : 0, alpha, L.s + p * (L.d - POP)]);
      }
    }
    draw();
  }

  function draw(): void {
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, H);
    for (const d of dots) {
      const grow = clamp((T - d[5]) / POP);
      if (grow <= 0) continue;
      let r = d[2] * easeOutBack(grow);
      let pink = d[3] === 1;
      let a = d[4] * clamp(grow * 1.6);

      // 鼠标附近的点变大、变粉
      const dx = d[0] - mx;
      const dy = d[1] - my;
      const dd = dx * dx + dy * dy;
      if (dd < 22000) {
        const b = Math.exp(-dd / 5200);
        r += s * 0.38 * b;
        a = Math.min(1, a + 0.6 * b);
        if (b > 0.3) pink = true;
      }

      g.globalAlpha = a;
      g.fillStyle = pink ? THREAD : CREAM;
      g.beginPath();
      g.arc(d[0], d[1], r, 0, Math.PI * 2);
      g.fill();
    }
    g.globalAlpha = 1;
  }

  const schedule = () => {
    if (!raf) {
      raf = requestAnimationFrame(() => {
        raf = 0;
        draw();
      });
    }
  };

  function play(): void {
    if (Number.isFinite(fixedT)) {
      T = fixedT;
      draw();
      return;
    }
    if (reduce) {
      T = 99;
      draw();
      return;
    }
    const t0 = performance.now();
    const step = (now: number) => {
      T = (now - t0) / 1000 - 0.1;
      if (T >= END) {
        T = 99;
        draw();
        return;
      }
      draw();
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  hero.addEventListener('pointermove', (e) => {
    const r = cv.getBoundingClientRect();
    mx = e.clientX - r.left;
    my = e.clientY - r.top;
    schedule();
  });
  hero.addEventListener('pointerleave', () => {
    mx = my = -1e4;
    schedule();
  });

  let resizeTimer: ReturnType<typeof setTimeout>;
  new ResizeObserver(() => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (started) build();
    }, 80);
  }).observe(hero);

  // 等字体就绪再画字标;最多等 1.5 秒,避免字体加载失败时画布永远不出现
  const fontsReady = document.fonts
    ? Promise.all([document.fonts.load(`800 100px ${FAMILY}`), document.fonts.ready]).catch(() => {})
    : Promise.resolve();
  Promise.race([fontsReady, new Promise((resolve) => setTimeout(resolve, 1500))]).then(() => {
    started = true;
    build();
    play();
  });
}
