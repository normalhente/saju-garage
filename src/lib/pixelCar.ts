import type { CarPart, ElementCarProfile } from './mapping';

// 3/4 히어로 뷰 도트 스프라이트 렌더러.
// 측면 실루엣을 오블리크(oblique)로 압출해 상단면 + 전면 파시아를 합성 → 입체감.
// 하드코어 3D가 아니라 면별 색을 아트디렉션하는 2.5D 파세팅. 외부 이미지 생성 없음.

export const GRID_W = 200;
export const GRID_H = 104;

// 오블리크 압출 벡터 (원측이 우상단으로 물러남)
const DX = 22;
const DY = 14;

export type Mat =
  | 'top'
  | 'side'
  | 'sideLow'
  | 'far'
  | 'front'
  | 'grille'
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
  | 'neon'
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
  top: string;
  side: string;
  sideLow: string;
  far: string;
  front: string;
  outline: string;
  glass: string;
  glassHi: string;
  frame: string;
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
  const glass = mix(darken(body, 0.55), '#0e1b28', 0.6);
  return {
    top: lighten(body, 0.34),
    side: body,
    sideLow: darken(body, 0.2),
    far: darken(body, 0.4),
    front: darken(body, 0.3),
    outline: darken(body, 0.72),
    glass,
    glassHi: lighten(glass, 0.55),
    frame: darken(body, 0.5),
    tire: '#15161b',
    tireHi: '#2c2e35',
    rim: chrome ? '#e6ebef' : '#3d4048',
    rimHi: chrome ? '#ffffff' : '#5b5f69',
    hub: chrome ? '#9aa2ab' : '#202229',
    head: '#fff4c2',
    tail: '#ff4d5e',
    accent: profile.accentColor,
    accentDark: darken(profile.accentColor, 0.35),
  };
}

// ---- 실루엣 (측면 near-face 기준, front가 왼쪽) ----
interface Silhouette {
  topProfile: number[][]; // 앞→뒤 상단 외곽선 (front-top ... rear-top)
  frontTopY: number;
  bottomY: number;
  frontX: number;
  rearX: number;
  glass: number[][]; // near-side 측면 유리 폴리곤
  wheelR: number;
  wheelCY: number;
  wheelFX: number;
  wheelRX: number;
}

const S: Record<ElementCarProfile['silhouette'], Silhouette> = {
  sports: {
    topProfile: [[18, 50], [44, 46], [66, 44], [86, 28], [114, 26], [134, 38], [152, 46]],
    frontTopY: 50, bottomY: 62, frontX: 18, rearX: 152,
    glass: [[88, 30], [112, 28], [124, 40], [94, 42]],
    wheelR: 13, wheelCY: 60, wheelFX: 48, wheelRX: 128,
  },
  suv: {
    topProfile: [[20, 46], [34, 26], [60, 22], [118, 22], [136, 28], [152, 38]],
    frontTopY: 46, bottomY: 62, frontX: 20, rearX: 152,
    glass: [[44, 26], [114, 26], [122, 37], [44, 37]],
    wheelR: 15, wheelCY: 59, wheelFX: 52, wheelRX: 126,
  },
  coupe: {
    topProfile: [[18, 50], [48, 46], [70, 40], [94, 28], [118, 30], [138, 40], [152, 46]],
    frontTopY: 50, bottomY: 61, frontX: 18, rearX: 152,
    glass: [[94, 31], [116, 33], [124, 42], [98, 42]],
    wheelR: 13, wheelCY: 59, wheelFX: 48, wheelRX: 128,
  },
  'sedan-sharp': {
    topProfile: [[18, 48], [50, 45], [72, 36], [98, 30], [122, 30], [140, 38], [152, 44]],
    frontTopY: 48, bottomY: 61, frontX: 18, rearX: 152,
    glass: [[76, 35], [98, 32], [120, 32], [124, 40], [80, 40]],
    wheelR: 13, wheelCY: 59, wheelFX: 50, wheelRX: 126,
  },
  'sedan-fluid': {
    topProfile: [[18, 48], [52, 44], [74, 36], [100, 32], [122, 34], [142, 40], [152, 46]],
    frontTopY: 48, bottomY: 61, frontX: 18, rearX: 152,
    glass: [[78, 36], [100, 34], [120, 36], [124, 42], [82, 42]],
    wheelR: 13, wheelCY: 59, wheelFX: 50, wheelRX: 126,
  },
};

// ---- 래스터 프리미티브 ----
type Grid = (Mat | null)[][];

function newGrid(): Grid {
  return Array.from({ length: GRID_H }, () => Array<Mat | null>(GRID_W).fill(null));
}

function fillPoly(grid: Grid, pts: number[][], mat: Mat, onlyOver?: (Mat | null)[]) {
  let minY = Infinity;
  let maxY = -Infinity;
  for (const [, y] of pts) {
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
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
      for (let x = Math.round(xs[k]); x < Math.round(xs[k + 1]); x++) {
        if (x < 0 || x >= GRID_W) continue;
        if (onlyOver && !onlyOver.includes(grid[y][x])) continue;
        grid[y][x] = mat;
      }
    }
  }
}

function disc(grid: Grid, cx: number, cy: number, r: number, mat: Mat, onlyOver?: (Mat | null)[]) {
  for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) {
    for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
      if (x < 0 || x >= GRID_W || y < 0 || y >= GRID_H) continue;
      if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) {
        if (onlyOver && !onlyOver.includes(grid[y][x])) continue;
        grid[y][x] = mat;
      }
    }
  }
}

function line(grid: Grid, x1: number, y1: number, x2: number, y2: number, mat: Mat, onlyOver?: (Mat | null)[]) {
  x1 = Math.round(x1); y1 = Math.round(y1); x2 = Math.round(x2); y2 = Math.round(y2);
  const dx = Math.abs(x2 - x1);
  const dy = Math.abs(y2 - y1);
  const sx = x1 < x2 ? 1 : -1;
  const sy = y1 < y2 ? 1 : -1;
  let err = dx - dy;
  let x = x1;
  let y = y1;
  for (;;) {
    if (x >= 0 && x < GRID_W && y >= 0 && y < GRID_H && (!onlyOver || onlyOver.includes(grid[y][x]))) {
      grid[y][x] = mat;
    }
    if (x === x2 && y === y2) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x += sx; }
    if (e2 < dx) { err += dx; y += sy; }
  }
}

const off = (p: number[]): number[] => [p[0] + DX, p[1] - DY];
const lerp = (a: number[], b: number[], t: number): number[] => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

function detailedWheel(grid: Grid, cx: number, cy: number, r: number, squish = 1) {
  const solid: (Mat | null)[] = ['side', 'sideLow', 'far', 'front', 'top', null];
  for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) {
    for (let x = Math.floor(cx - r * squish); x <= Math.ceil(cx + r * squish); x++) {
      if (x < 0 || x >= GRID_W || y < 0 || y >= GRID_H) continue;
      const d2 = ((x - cx) / squish) ** 2 + (y - cy) ** 2;
      if (d2 > r * r) continue;
      if (!solid.includes(grid[y][x]) && grid[y][x] !== null) continue;
      const d = Math.sqrt(d2);
      grid[y][x] = d > r - 2 ? 'tire' : d > r - 3 ? 'tireHi' : 'rim';
    }
  }
  for (let a = 0; a < 6; a++) {
    const ang = (a / 6) * Math.PI * 2 + 0.3;
    line(grid, cx, cy, cx + Math.cos(ang) * (r - 3) * squish, cy + Math.sin(ang) * (r - 3), 'hub', ['rim']);
  }
  disc(grid, cx, cy, Math.max(2, r * 0.3), 'hub', ['rim', 'hub', 'tireHi']);
  disc(grid, cx - r * 0.3, cy - r * 0.3, 1.4, 'rimHi', ['rim']);
}

function addOutline(grid: Grid) {
  const solid = (x: number, y: number) =>
    x >= 0 && x < GRID_W && y >= 0 && y < GRID_H && grid[y][x] !== null && grid[y][x] !== 'outline';
  const set: [number, number][] = [];
  for (let y = 0; y < GRID_H; y++) {
    for (let x = 0; x < GRID_W; x++) {
      if (grid[y][x] !== null) continue;
      if (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1)) set.push([x, y]);
    }
  }
  for (const [x, y] of set) grid[y][x] = 'outline';
}

function neonRim(grid: Grid) {
  for (let x = 0; x < GRID_W; x++) {
    for (let y = 0; y < GRID_H; y++) {
      const m = grid[y][x];
      if (m && m !== 'outline') {
        if (y - 1 >= 0 && grid[y - 1][x] === 'outline') grid[y - 1][x] = 'neon';
        break;
      }
    }
  }
}

function colorize(grid: Grid, pal: Palette): (string | null)[][] {
  const out: (string | null)[][] = Array.from({ length: GRID_H }, () => Array<string | null>(GRID_W).fill(null));
  const map: Record<Mat, string> = {
    top: pal.top, side: pal.side, sideLow: pal.sideLow, far: pal.far, front: pal.front,
    grille: '#15171d', glass: pal.glass, glassHi: pal.glassHi, frame: pal.frame,
    tire: pal.tire, tireHi: pal.tireHi, rim: pal.rim, rimHi: pal.rimHi, hub: pal.hub,
    head: pal.head, tail: pal.tail, accent: pal.accent, accentDark: pal.accentDark,
    neon: lighten(pal.accent, 0.25), outline: pal.outline,
  };
  for (let y = 0; y < GRID_H; y++) {
    for (let x = 0; x < GRID_W; x++) {
      const m = grid[y][x];
      if (m) out[y][x] = map[m];
    }
  }
  return out;
}

export interface RenderedCar {
  pixels: (string | null)[][];
  w: number;
  h: number;
}

export function renderPixelCar(profile: ElementCarProfile, parts: CarPart[]): RenderedCar {
  const s = S[profile.silhouette];
  const chrome = parts.includes('chromeWheels');
  const pal = buildPalette(profile, chrome);
  const grid = newGrid();

  const nearBottomFront = [s.frontX, s.bottomY];
  const nearBottomRear = [s.rearX, s.bottomY];
  // near-side 실루엣 폴리곤 (상단 프로필 + 하단 라인)
  const nearSide = [...s.topProfile, nearBottomRear, nearBottomFront];
  const farSide = nearSide.map(off);

  // 1) 원측면
  fillPoly(grid, farSide, 'far');

  // 2) 상단면 (near 상단 프로필 ↔ far 상단 프로필 사이 밴드)
  const topBand = [...s.topProfile, ...[...s.topProfile].reverse().map(off)];
  fillPoly(grid, topBand, 'top');

  // 3) 전면 파시아 (near 앞모서리 ↔ far 앞모서리)
  const nTop = [s.frontX, s.frontTopY];
  const nBot = [s.frontX, s.bottomY];
  const fTop = off(nTop);
  const fBot = off(nBot);
  fillPoly(grid, [nTop, nBot, fBot, fTop], 'front');
  // 그릴 + 듀얼 헤드라이트 + 인테이크
  const hl1 = lerp(nTop, fTop, 0.28);
  const hl2 = lerp(nTop, fTop, 0.62);
  disc(grid, hl1[0], hl1[1] + 2, 2.2, 'head', ['front']);
  disc(grid, hl2[0], hl2[1] + 2, 2.2, 'head', ['front']);
  const gA = lerp(nBot, fBot, 0.25);
  const gB = lerp(nBot, fBot, 0.75);
  fillPoly(grid, [
    [gA[0], gA[1] - 5], [gB[0], gB[1] - 5], [gB[0], gB[1] - 2], [gA[0], gA[1] - 2],
  ], 'grille', ['front']);

  // 4) 근측면
  fillPoly(grid, nearSide, 'side');
  // 하단 로커 음영
  for (let x = s.frontX; x <= s.rearX; x++) {
    for (let y = s.bottomY - 3; y < s.bottomY; y++) {
      if (grid[y]?.[x] === 'side') grid[y][x] = 'sideLow';
    }
  }

  // 5) 측면 유리 + 필러 + 반사
  fillPoly(grid, s.glass, 'glass', ['side']);
  const framePts: [number, number][] = [];
  for (let y = 0; y < GRID_H; y++) {
    for (let x = 0; x < GRID_W; x++) {
      if (grid[y][x] !== 'glass') continue;
      if (grid[y][x - 1] === 'side' || grid[y][x + 1] === 'side' || grid[y - 1]?.[x] === 'side') {
        framePts.push([x, y]);
      }
    }
  }
  for (const [x, y] of framePts) grid[y][x] = 'frame';
  let gMinX = GRID_W, gMaxX = 0, gMinY = GRID_H;
  for (const [x, y] of s.glass) { gMinX = Math.min(gMinX, x); gMaxX = Math.max(gMaxX, x); gMinY = Math.min(gMinY, y); }
  for (const o of [0.3, 0.55]) {
    const sxp = gMinX + (gMaxX - gMinX) * o;
    line(grid, sxp, gMinY + 1, sxp + 7, gMinY + 9, 'glassHi', ['glass']);
  }

  // 6) 근측 리어라이트 (뒤쪽 세로 라인)
  fillPoly(grid, [
    [s.rearX - 3, s.bottomY - 11], [s.rearX, s.bottomY - 12],
    [s.rearX, s.bottomY - 5], [s.rearX - 3, s.bottomY - 5],
  ], 'tail', ['side', 'sideLow', 'far']);

  // 7) 십신 파츠 오버레이
  if (parts.includes('racingStripe')) {
    // 상단면 중앙을 관통하는 스트라이프 (top mat 위에만)
    for (let i = 0; i < s.topProfile.length - 1; i++) {
      const a = lerp(s.topProfile[i], off(s.topProfile[i]), 0.5);
      const b = lerp(s.topProfile[i + 1], off(s.topProfile[i + 1]), 0.5);
      line(grid, a[0], a[1], b[0], b[1], 'accent', ['top']);
      line(grid, a[0], a[1] + 1, b[0], b[1] + 1, 'accentDark', ['top']);
    }
  }
  if (parts.includes('sunroofGlow')) {
    const mid = Math.floor(s.topProfile.length / 2);
    const c = lerp(s.topProfile[mid], off(s.topProfile[mid]), 0.5);
    fillPoly(grid, [[c[0] - 6, c[1] - 1], [c[0] + 6, c[1] - 2], [c[0] + 6, c[1] + 2], [c[0] - 6, c[1] + 3]], 'accent', ['top', 'glass']);
  }
  if (parts.includes('lightBar')) {
    for (let x = s.frontX + 4; x < s.frontX + 46; x++) {
      const y = s.bottomY - 2;
      if (grid[y]?.[x] === 'sideLow' || grid[y]?.[x] === 'side') grid[y][x] = 'accent';
    }
  }
  if (parts.includes('spoilerFlame')) {
    const rt = off(s.topProfile[s.topProfile.length - 2]);
    fillPoly(grid, [[rt[0] - 4, rt[1] - 8], [rt[0] + 14, rt[1] - 10], [rt[0] + 14, rt[1] - 7], [rt[0] - 4, rt[1] - 5]], 'outline');
    line(grid, rt[0] - 2, rt[1] - 7, rt[0] - 2, rt[1], 'outline');
    line(grid, rt[0] + 12, rt[1] - 9, rt[0] + 12, rt[1] - 2, 'outline');
    // 배기 플레임 (뒤쪽 하단)
    disc(grid, s.rearX + 1, s.bottomY - 4, 3, 'accent');
    disc(grid, s.rearX + 4, s.bottomY - 4, 2, 'head');
  }

  // 8) 근측 바퀴 (앞)
  detailedWheel(grid, s.wheelFX, s.wheelCY, s.wheelR);
  detailedWheel(grid, s.wheelRX, s.wheelCY, s.wheelR);

  // 9) 아웃라인 + 네온 림
  addOutline(grid);
  neonRim(grid);

  return { pixels: colorize(grid, pal), w: GRID_W, h: GRID_H };
}
