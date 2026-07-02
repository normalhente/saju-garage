import type { CarPart, ElementCarProfile } from './mapping';

// 고해상 도트 스프라이트 렌더러.
// 벡터 자동 변환이 아니라, 실루엣별로 손으로 잡은 폴리곤 + 음영/아웃라인/디테일 휠을
// 자체 래스터라이저로 그려서 "설계된 픽셀아트" 느낌을 낸다. 외부 이미지 생성 없음.

export const GRID_W = 160;
export const GRID_H = 74;

export type Mat =
  | 'body'
  | 'glass'
  | 'glassHi'
  | 'frame'
  | 'tire'
  | 'tireHi'
  | 'rim'
  | 'rimHi'
  | 'hub'
  | 'head'
  | 'tail'
  | 'accent'
  | 'accentDark'
  | 'outline';

// ---- 색 유틸 ----
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const n = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)];
}
function rgbToHex(r: number, g: number, b: number): string {
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}
function mix(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  return rgbToHex(ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t);
}
const darken = (hex: string, t: number) => mix(hex, '#000000', t);
const lighten = (hex: string, t: number) => mix(hex, '#ffffff', t);

export interface Palette {
  bodyHi: string;
  bodyBase: string;
  bodyShadow: string;
  bodyDark: string;
  outline: string;
  glass: string;
  glassHi: string;
  tire: string;
  tireHi: string;
  rim: string;
  rimHi: string;
  hub: string;
  head: string;
  tail: string;
  accent: string;
  accentDark: string;
}

export function buildPalette(profile: ElementCarProfile, chrome: boolean): Palette {
  const body = profile.bodyColor;
  // 유리는 오행 공통으로 어둡게 틴팅된 색을 쓴다 (흰 판때기처럼 보이던 문제 해결).
  const glass = mix(darken(body, 0.55), '#0e1b28', 0.6);
  return {
    bodyHi: lighten(body, 0.32),
    bodyBase: body,
    bodyShadow: darken(body, 0.24),
    bodyDark: darken(body, 0.46),
    outline: darken(body, 0.68),
    glass,
    glassHi: lighten(glass, 0.5),
    tire: '#16171c',
    tireHi: '#2b2d34',
    rim: chrome ? '#e4e9ed' : '#3c3f47',
    rimHi: chrome ? '#ffffff' : '#585c66',
    hub: chrome ? '#9aa2ab' : '#20222a',
    head: '#fff2b0',
    tail: '#ff4d5e',
    accent: profile.accentColor,
    accentDark: darken(profile.accentColor, 0.35),
  };
}

// ---- 실루엣 지오메트리 (160x74 좌표계) ----
interface Silhouette {
  body: number[][]; // 닫힌 폴리곤 (시계방향)
  glass: number[][];
  wheelR: number;
  wheelCY: number;
  wheelFX: number; // 앞바퀴 중심 x
  wheelRX: number; // 뒷바퀴 중심 x
  // 파츠 앵커
  hood: { x: number; y: number }; // 보닛 라인 중앙 (스트라이프 시작)
  roof: { x1: number; x2: number; y: number }; // 루프 (선루프)
  rearTop: { x: number; y: number }; // 스포일러 위치
  frontBumper: { x: number; y: number };
  rockerY: number; // 사이드 스커트/라이트바 기준
}

const S: Record<ElementCarProfile['silhouette'], Silhouette> = {
  // 화: 낮고 길게 깔린 스포츠카
  sports: {
    body: [
      [12, 56], [12, 47], [22, 43], [40, 40], [58, 38],
      [74, 26], [104, 25], [124, 33], [140, 36], [150, 42],
      [150, 56], [12, 56],
    ],
    glass: [[80, 26], [104, 26], [118, 34], [86, 34]],
    wheelR: 13, wheelCY: 54, wheelFX: 40, wheelRX: 122,
    hood: { x: 30, y: 42 }, roof: { x1: 84, x2: 108, y: 26 },
    rearTop: { x: 138, y: 30 }, frontBumper: { x: 12, y: 50 }, rockerY: 52,
  },
  // 토: 키 크고 각진 SUV
  suv: {
    body: [
      [14, 56], [14, 44], [22, 42], [34, 22], [58, 18],
      [112, 18], [128, 22], [140, 30], [148, 34], [148, 56], [14, 56],
    ],
    glass: [[40, 22], [110, 22], [120, 33], [40, 33]],
    wheelR: 15, wheelCY: 53, wheelFX: 42, wheelRX: 120,
    hood: { x: 30, y: 40 }, roof: { x1: 46, x2: 108, y: 19 },
    rearTop: { x: 140, y: 24 }, frontBumper: { x: 14, y: 48 }, rockerY: 50,
  },
  // 금: 정교한 저상 쿠페
  coupe: {
    body: [
      [12, 55], [12, 45], [24, 42], [46, 39], [66, 34],
      [90, 22], [110, 24], [128, 34], [142, 38], [150, 44],
      [150, 55], [12, 55],
    ],
    glass: [[76, 30], [98, 26], [110, 34], [82, 34]],
    wheelR: 13, wheelCY: 53, wheelFX: 40, wheelRX: 122,
    hood: { x: 32, y: 41 }, roof: { x1: 84, x2: 104, y: 25 },
    rearTop: { x: 140, y: 32 }, frontBumper: { x: 12, y: 49 }, rockerY: 51,
  },
  // 목: 곧게 뻗은 각진 세단
  'sedan-sharp': {
    body: [
      [12, 55], [12, 44], [24, 41], [48, 39], [66, 30],
      [92, 24], [116, 24], [128, 32], [140, 36], [150, 42],
      [150, 55], [12, 55],
    ],
    glass: [[72, 31], [92, 26], [114, 26], [120, 33], [76, 33]],
    wheelR: 13, wheelCY: 53, wheelFX: 42, wheelRX: 120,
    hood: { x: 32, y: 40 }, roof: { x1: 94, x2: 114, y: 25 },
    rearTop: { x: 140, y: 33 }, frontBumper: { x: 12, y: 48 }, rockerY: 51,
  },
  // 수: 유선형 곡선 세단
  'sedan-fluid': {
    body: [
      [12, 55], [12, 44], [26, 40], [50, 38], [70, 31],
      [96, 26], [118, 28], [132, 34], [142, 38], [150, 44],
      [150, 55], [12, 55],
    ],
    glass: [[74, 32], [96, 28], [116, 30], [122, 35], [78, 35]],
    wheelR: 13, wheelCY: 53, wheelFX: 42, wheelRX: 120,
    hood: { x: 34, y: 40 }, roof: { x1: 92, x2: 114, y: 27 },
    rearTop: { x: 140, y: 34 }, frontBumper: { x: 12, y: 48 }, rockerY: 51,
  },
};

// ---- 래스터 프리미티브 ----
type Grid = (Mat | null)[][];

function newGrid(): Grid {
  return Array.from({ length: GRID_H }, () => Array<Mat | null>(GRID_W).fill(null));
}

function fillPoly(grid: Grid, pts: number[][], mat: Mat, onlyOver?: Mat) {
  let minY = Infinity;
  let maxY = -Infinity;
  for (const [, y] of pts) {
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  minY = Math.max(0, Math.floor(minY));
  maxY = Math.min(GRID_H - 1, Math.ceil(maxY));
  for (let y = minY; y <= maxY; y++) {
    const xs: number[] = [];
    for (let i = 0; i < pts.length; i++) {
      const [x1, y1] = pts[i];
      const [x2, y2] = pts[(i + 1) % pts.length];
      if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y)) {
        xs.push(x1 + ((y - y1) / (y2 - y1)) * (x2 - x1));
      }
    }
    xs.sort((a, b) => a - b);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const xa = Math.round(xs[k]);
      const xb = Math.round(xs[k + 1]);
      for (let x = xa; x < xb; x++) {
        if (x < 0 || x >= GRID_W) continue;
        if (onlyOver && grid[y][x] !== onlyOver) continue;
        grid[y][x] = mat;
      }
    }
  }
}

function disc(grid: Grid, cx: number, cy: number, r: number, mat: Mat, onlyOver?: Mat) {
  for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) {
    for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
      if (x < 0 || x >= GRID_W || y < 0 || y >= GRID_H) continue;
      if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) {
        if (onlyOver && grid[y][x] !== onlyOver) continue;
        grid[y][x] = mat;
      }
    }
  }
}

function clearDisc(grid: Grid, cx: number, cy: number, r: number) {
  for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) {
    for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
      if (x < 0 || x >= GRID_W || y < 0 || y >= GRID_H) continue;
      if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) grid[y][x] = null;
    }
  }
}

function rectFill(grid: Grid, x0: number, y0: number, w: number, h: number, mat: Mat, onlyOver?: Mat) {
  for (let y = y0; y < y0 + h; y++) {
    for (let x = x0; x < x0 + w; x++) {
      if (x < 0 || x >= GRID_W || y < 0 || y >= GRID_H) continue;
      if (onlyOver && grid[y][x] !== onlyOver) continue;
      grid[y][x] = mat;
    }
  }
}

function line(grid: Grid, x1: number, y1: number, x2: number, y2: number, mat: Mat, onlyOver?: Mat) {
  x1 = Math.round(x1); y1 = Math.round(y1); x2 = Math.round(x2); y2 = Math.round(y2);
  const dx = Math.abs(x2 - x1);
  const dy = Math.abs(y2 - y1);
  const sx = x1 < x2 ? 1 : -1;
  const sy = y1 < y2 ? 1 : -1;
  let err = dx - dy;
  let x = x1;
  let y = y1;
  for (;;) {
    if (x >= 0 && x < GRID_W && y >= 0 && y < GRID_H && (!onlyOver || grid[y][x] === onlyOver)) {
      grid[y][x] = mat;
    }
    if (x === x2 && y === y2) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x += sx; }
    if (e2 < dx) { err += dx; y += sy; }
  }
}

function detailedWheel(grid: Grid, cx: number, cy: number, r: number) {
  disc(grid, cx, cy, r, 'tire');
  disc(grid, cx, cy, r - 2, 'tireHi');
  disc(grid, cx, cy, r - 3, 'rim');
  // 스포크
  for (let a = 0; a < 6; a++) {
    const ang = (a / 6) * Math.PI * 2 + 0.3;
    line(grid, cx, cy, cx + Math.cos(ang) * (r - 3), cy + Math.sin(ang) * (r - 3), 'hub', 'rim');
  }
  disc(grid, cx, cy, Math.max(2, r * 0.32), 'hub');
  // 림 하이라이트 한 점
  disc(grid, cx - r * 0.35, cy - r * 0.35, 1.4, 'rimHi', 'rim');
}

// ---- 컬러라이즈 (음영) ----
function colorize(grid: Grid, pal: Palette): (string | null)[][] {
  // 각 열의 body 상/하단 y 계산 → 세로 음영 밴드
  const top: number[] = Array(GRID_W).fill(-1);
  const bot: number[] = Array(GRID_W).fill(-1);
  for (let x = 0; x < GRID_W; x++) {
    for (let y = 0; y < GRID_H; y++) {
      if (grid[y][x] === 'body' || grid[y][x] === 'glass') {
        if (top[x] < 0) top[x] = y;
        bot[x] = y;
      }
    }
  }

  const out: (string | null)[][] = Array.from({ length: GRID_H }, () => Array<string | null>(GRID_W).fill(null));
  for (let y = 0; y < GRID_H; y++) {
    for (let x = 0; x < GRID_W; x++) {
      const m = grid[y][x];
      if (!m) continue;
      let col: string;
      switch (m) {
        case 'body': {
          const t = top[x];
          const b = bot[x];
          const f = b > t ? (y - t) / (b - t) : 0;
          if (f < 0.14) col = pal.bodyHi;
          else if (f < 0.52) col = pal.bodyBase;
          else if (f < 0.82) col = pal.bodyShadow;
          else col = pal.bodyDark;
          break;
        }
        case 'glass': col = pal.glass; break;
        case 'glassHi': col = pal.glassHi; break;
        case 'frame': col = pal.bodyShadow; break;
        case 'tire': col = pal.tire; break;
        case 'tireHi': col = pal.tireHi; break;
        case 'rim': col = pal.rim; break;
        case 'rimHi': col = pal.rimHi; break;
        case 'hub': col = pal.hub; break;
        case 'head': col = pal.head; break;
        case 'tail': col = pal.tail; break;
        case 'accent': col = pal.accent; break;
        case 'accentDark': col = pal.accentDark; break;
        case 'outline': col = pal.outline; break;
        default: col = pal.bodyBase;
      }
      out[y][x] = col;
    }
  }
  return out;
}

function addOutline(grid: Grid) {
  const isSolid = (x: number, y: number) =>
    x >= 0 && x < GRID_W && y >= 0 && y < GRID_H && grid[y][x] !== null && grid[y][x] !== 'outline';
  const toSet: [number, number][] = [];
  for (let y = 0; y < GRID_H; y++) {
    for (let x = 0; x < GRID_W; x++) {
      if (grid[y][x] !== null) continue;
      if (isSolid(x - 1, y) || isSolid(x + 1, y) || isSolid(x, y - 1) || isSolid(x, y + 1)) {
        toSet.push([x, y]);
      }
    }
  }
  for (const [x, y] of toSet) grid[y][x] = 'outline';
}

export interface RenderedCar {
  pixels: (string | null)[][];
  w: number;
  h: number;
}

export function renderPixelCar(profile: ElementCarProfile, parts: CarPart[]): RenderedCar {
  const sil = S[profile.silhouette];
  const chrome = parts.includes('chromeWheels');
  const pal = buildPalette(profile, chrome);
  const grid = newGrid();

  // 1) 차체
  fillPoly(grid, sil.body, 'body');
  // 2) 휠 아치 파내기
  clearDisc(grid, sil.wheelFX, sil.wheelCY, sil.wheelR + 2);
  clearDisc(grid, sil.wheelRX, sil.wheelCY, sil.wheelR + 2);
  // 3) 유리 + 필러(창틀) + 반사 스트릭
  fillPoly(grid, sil.glass, 'glass', 'body');
  // 유리가 차체와 맞닿는 안쪽 경계 → 필러/창틀
  const framePts: [number, number][] = [];
  for (let y = 0; y < GRID_H; y++) {
    for (let x = 0; x < GRID_W; x++) {
      if (grid[y][x] !== 'glass') continue;
      if (grid[y][x - 1] === 'body' || grid[y][x + 1] === 'body' || grid[y - 1]?.[x] === 'body') {
        framePts.push([x, y]);
      }
    }
  }
  for (const [x, y] of framePts) grid[y][x] = 'frame';
  // 대각 반사 스트릭 2줄 (해칭 대신 깔끔하게)
  let gMinX = GRID_W;
  let gMaxX = 0;
  let gMinY = GRID_H;
  for (const [x, y] of sil.glass) {
    gMinX = Math.min(gMinX, x);
    gMaxX = Math.max(gMaxX, x);
    gMinY = Math.min(gMinY, y);
  }
  for (const off of [0.28, 0.52]) {
    const sxp = gMinX + (gMaxX - gMinX) * off;
    line(grid, sxp, gMinY, sxp + 10, gMinY + 12, 'glassHi', 'glass');
    line(grid, sxp + 1, gMinY, sxp + 11, gMinY + 12, 'glassHi', 'glass');
  }

  // 4) 사이드 캐릭터 라인(크레스트) — 은은한 그림자 라인
  const rocker = sil.rockerY;
  for (let x = 14; x < 150; x++) {
    if (grid[rocker] && grid[rocker][x] === 'body') grid[rocker][x] = 'body';
  }

  // 5) 라이트
  const fb = sil.frontBumper;
  rectFill(grid, fb.x + 1, fb.y - 3, 4, 5, 'head', 'body');
  rectFill(grid, 146, fb.y - 3, 4, 5, 'tail', 'body');

  // 6) 십신 파츠 오버레이
  if (parts.includes('racingStripe')) {
    const h = sil.hood;
    // 보닛~루프~트렁크 관통 스트라이프 2줄
    for (let x = 14; x < 150; x++) {
      const yTop = topAt(grid, x);
      if (yTop < 0) continue;
      if (grid[yTop + 1]?.[x] === 'body') grid[yTop + 1][x] = 'accent';
      if (grid[yTop + 3]?.[x] === 'body') grid[yTop + 3][x] = 'accentDark';
    }
    void h;
  }
  if (parts.includes('sunroofGlow')) {
    const r = sil.roof;
    rectFill(grid, r.x1 + 2, r.y + 1, r.x2 - r.x1 - 4, 2, 'accent', 'glass');
    rectFill(grid, r.x1 + 2, r.y + 1, r.x2 - r.x1 - 4, 2, 'accent', 'body');
  }
  if (parts.includes('lightBar')) {
    rectFill(grid, 16, sil.rockerY + 1, 60, 2, 'accent', 'body');
  }
  if (parts.includes('spoilerFlame')) {
    const rt = sil.rearTop;
    // 스포일러 윙
    rectFill(grid, rt.x - 16, rt.y - 6, 22, 2, 'outline');
    rectFill(grid, rt.x - 16, rt.y - 6, 2, 8, 'outline');
    rectFill(grid, rt.x + 3, rt.y - 6, 2, 8, 'outline');
    // 배기 플레임
    disc(grid, 152, fb.y + 1, 3, 'accent');
    disc(grid, 155, fb.y + 1, 2, 'head');
  }

  // 7) 휠 (아치 안에 얹기)
  detailedWheel(grid, sil.wheelFX, sil.wheelCY, sil.wheelR);
  detailedWheel(grid, sil.wheelRX, sil.wheelCY, sil.wheelR);

  // 8) 아웃라인
  addOutline(grid);

  return { pixels: colorize(grid, pal), w: GRID_W, h: GRID_H };
}

function topAt(grid: Grid, x: number): number {
  for (let y = 0; y < GRID_H; y++) {
    if (grid[y][x] === 'body' || grid[y][x] === 'glass') return y;
  }
  return -1;
}
