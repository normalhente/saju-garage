import { useMemo } from 'react';
import type { CarPart, ElementCarProfile } from '../lib/mapping';

const WHEEL_CENTER_Y = 166;
const CELL = 10;
const COLS = 46;
const ROWS = 20;

interface SilhouetteConfig {
  frontX: number;
  rearX: number;
  bodyBottomY: number;
  bumperH: number;
  hoodY: number;
  roofY: number;
  roofFrontX: number;
  roofRearX: number;
  wheelR: number;
  wheel1X: number;
  wheel2X: number;
  notch: boolean;
  trunkX: number;
  trunkY: number;
  rearBoxy: boolean;
}

const SILHOUETTES: Record<ElementCarProfile['silhouette'], SilhouetteConfig> = {
  sports: {
    frontX: 30, rearX: 430,
    bodyBottomY: 150, bumperH: 14,
    hoodY: 100, roofY: 74,
    roofFrontX: 268, roofRearX: 344,
    wheelR: 32, wheel1X: 120, wheel2X: 350,
    notch: false, trunkX: 0, trunkY: 0, rearBoxy: false,
  },
  suv: {
    frontX: 40, rearX: 420,
    bodyBottomY: 140, bumperH: 20,
    hoodY: 92, roofY: 46,
    roofFrontX: 168, roofRearX: 352,
    wheelR: 36, wheel1X: 130, wheel2X: 338,
    notch: false, trunkX: 0, trunkY: 0, rearBoxy: true,
  },
  coupe: {
    frontX: 35, rearX: 425,
    bodyBottomY: 145, bumperH: 13,
    hoodY: 98, roofY: 64,
    roofFrontX: 232, roofRearX: 312,
    wheelR: 33, wheel1X: 125, wheel2X: 345,
    notch: false, trunkX: 0, trunkY: 0, rearBoxy: false,
  },
  'sedan-sharp': {
    frontX: 35, rearX: 425,
    bodyBottomY: 146, bumperH: 13,
    hoodY: 99, roofY: 66,
    roofFrontX: 200, roofRearX: 288,
    wheelR: 31, wheel1X: 125, wheel2X: 345,
    notch: true, trunkX: 322, trunkY: 106, rearBoxy: false,
  },
  'sedan-fluid': {
    frontX: 35, rearX: 425,
    bodyBottomY: 147, bumperH: 13,
    hoodY: 101, roofY: 69,
    roofFrontX: 196, roofRearX: 294,
    wheelR: 31, wheel1X: 125, wheel2X: 345,
    notch: true, trunkX: 332, trunkY: 116, rearBoxy: false,
  },
};

function buildBodyPath(c: SilhouetteConfig): string {
  const bumperTopY = c.bodyBottomY - c.bumperH;
  const parts: string[] = [];

  parts.push(`M ${c.frontX} ${c.bodyBottomY}`);
  parts.push(`L ${c.frontX} ${bumperTopY}`);

  // front fender + hood + windshield up to roof front
  const fc1x = c.frontX + (c.roofFrontX - c.frontX) * 0.5;
  const fc2x = c.roofFrontX - (c.roofFrontX - c.frontX) * 0.12;
  const fc2y = c.roofY + (bumperTopY - c.roofY) * 0.18;
  parts.push(`C ${fc1x} ${bumperTopY}, ${fc2x} ${fc2y}, ${c.roofFrontX} ${c.roofY}`);

  // roof line
  parts.push(`L ${c.roofRearX} ${c.roofY}`);

  if (c.notch) {
    const rc1x = c.roofRearX + (c.trunkX - c.roofRearX) * 0.6;
    parts.push(`C ${rc1x} ${c.roofY}, ${c.trunkX - 10} ${c.trunkY}, ${c.trunkX} ${c.trunkY}`);
    const tEndX = c.trunkX + (c.rearX - c.trunkX) * 0.35;
    parts.push(`L ${tEndX} ${c.trunkY}`);
    const tc2x = c.rearX - (c.rearX - tEndX) * 0.2;
    parts.push(`C ${tEndX + 14} ${c.trunkY}, ${tc2x} ${bumperTopY}, ${c.rearX} ${bumperTopY}`);
  } else if (c.rearBoxy) {
    const rc1x = c.roofRearX + (c.rearX - c.roofRearX) * 0.15;
    const rc2x = c.rearX - (c.rearX - c.roofRearX) * 0.08;
    parts.push(`C ${rc1x} ${c.roofY}, ${rc2x} ${bumperTopY}, ${c.rearX} ${bumperTopY}`);
  } else {
    const rc1x = c.roofRearX + (c.rearX - c.roofRearX) * 0.3;
    const rc1y = c.roofY + (bumperTopY - c.roofY) * 0.2;
    const rc2x = c.rearX - (c.rearX - c.roofRearX) * 0.42;
    parts.push(`C ${rc1x} ${rc1y}, ${rc2x} ${bumperTopY}, ${c.rearX} ${bumperTopY}`);
  }

  parts.push(`L ${c.rearX} ${c.bodyBottomY}`);

  // bottom edge with wheel arches (rear -> front)
  const archR2 = c.wheelR + 8;
  const archR1 = c.wheelR + 8;
  parts.push(`L ${c.wheel2X + archR2} ${c.bodyBottomY}`);
  parts.push(`A ${archR2} ${archR2} 0 0 0 ${c.wheel2X - archR2} ${c.bodyBottomY}`);
  parts.push(`L ${c.wheel1X + archR1} ${c.bodyBottomY}`);
  parts.push(`A ${archR1} ${archR1} 0 0 0 ${c.wheel1X - archR1} ${c.bodyBottomY}`);
  parts.push(`L ${c.frontX} ${c.bodyBottomY}`);
  parts.push('Z');

  return parts.join(' ');
}

function buildGlassPath(c: SilhouetteConfig): string {
  const inset = 14;
  const beltY = c.roofY + (c.hoodY - c.roofY) * 0.62;
  const rrx = c.notch ? c.trunkX - 18 : c.roofRearX + (c.rearBoxy ? 6 : -4);
  const parts: string[] = [];
  parts.push(`M ${c.roofFrontX + 6} ${beltY}`);
  parts.push(
    `C ${c.roofFrontX + 6} ${c.roofY + inset * 0.3}, ${c.roofFrontX + 14} ${c.roofY + inset}, ${c.roofFrontX + 26} ${c.roofY + inset}`,
  );
  parts.push(`L ${c.roofRearX - 10} ${c.roofY + inset}`);
  parts.push(`C ${c.roofRearX + 4} ${c.roofY + inset}, ${rrx} ${beltY - 6}, ${rrx} ${beltY}`);
  parts.push('Z');
  return parts.join(' ');
}

interface RectZone {
  x: number;
  y: number;
  w: number;
  h: number;
}

const inRect = (x: number, y: number, r: RectZone | null): boolean =>
  !!r && x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;

interface EllipseZone {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}

const inEllipse = (x: number, y: number, e: EllipseZone | null): boolean => {
  if (!e) return false;
  const dx = (x - e.cx) / e.rx;
  const dy = (y - e.cy) / e.ry;
  return dx * dx + dy * dy <= 1;
};

interface PixelCell {
  x: number;
  y: number;
  color: string;
}

function rasterize(cfg: SilhouetteConfig, profile: ElementCarProfile, parts: CarPart[]): PixelCell[] {
  const has = (p: CarPart) => parts.includes(p);
  const bodyPath2D = new Path2D(buildBodyPath(cfg));
  const glassPath2D = new Path2D(buildGlassPath(cfg));
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  const bumperTopY = cfg.bodyBottomY - cfg.bumperH;
  const headlight: RectZone = { x: cfg.frontX + 3, y: bumperTopY + 2, w: 9, h: cfg.bumperH - 4 };
  const taillight: RectZone = { x: cfg.rearX - 12, y: bumperTopY + 2, w: 9, h: cfg.bumperH - 4 };
  const stripe: RectZone | null = has('racingStripe')
    ? { x: cfg.frontX, y: (cfg.hoodY + bumperTopY) / 2 - 4, w: cfg.rearX - cfg.frontX, h: 8 }
    : null;
  const sunroof: RectZone | null = has('sunroofGlow')
    ? { x: cfg.roofFrontX + 20, y: cfg.roofY + 6, w: Math.max(20, cfg.roofRearX - cfg.roofFrontX - 40), h: 10 }
    : null;
  const lightBar: RectZone | null = has('lightBar')
    ? { x: cfg.frontX - 4, y: bumperTopY + cfg.bumperH * 0.15, w: cfg.roofFrontX - cfg.frontX * 0.5 - 30, h: 5 }
    : null;
  const spoilerOn = has('spoilerFlame');
  const spoilerWing: RectZone = { x: cfg.rearX - 40, y: cfg.roofY - 14, w: 32, h: 5 };
  const spoilerStrut1: RectZone = { x: cfg.rearX - 40, y: cfg.roofY - 14, w: 5, h: 16 };
  const spoilerStrut2: RectZone = { x: cfg.rearX - 13, y: cfg.roofY - 14, w: 5, h: 16 };
  const flame: EllipseZone = { cx: cfg.rearX + 4, cy: cfg.bodyBottomY - cfg.bumperH * 0.4, rx: 6, ry: 7 };

  const tireColor = has('chromeWheels') ? '#e7ecef' : '#16181d';
  const hubColor = has('chromeWheels') ? '#8b95a0' : '#4b4f57';

  const cells: PixelCell[] = [];

  for (let ry = 0; ry < ROWS; ry++) {
    for (let rx = 0; rx < COLS; rx++) {
      const x = rx * CELL + CELL / 2;
      const y = ry * CELL + CELL / 2;
      let color: string | null = null;

      if (spoilerOn && (inRect(x, y, spoilerWing) || inRect(x, y, spoilerStrut1) || inRect(x, y, spoilerStrut2))) {
        color = '#20232b';
      } else if (spoilerOn && inEllipse(x, y, flame)) {
        color = profile.accentColor;
      } else if (inRect(x, y, lightBar)) {
        color = profile.accentColor;
      } else if (inRect(x, y, sunroof)) {
        color = profile.accentColor;
      } else if (inRect(x, y, stripe) && ctx.isPointInPath(bodyPath2D, x, y)) {
        color = profile.accentColor;
      } else if (inRect(x, y, headlight)) {
        color = '#fff6cc';
      } else if (inRect(x, y, taillight)) {
        color = '#ff5b5b';
      } else if (ctx.isPointInPath(bodyPath2D, x, y)) {
        color = ctx.isPointInPath(glassPath2D, x, y) ? profile.glassColor : profile.bodyColor;
      } else {
        const d1 = Math.hypot(x - cfg.wheel1X, y - WHEEL_CENTER_Y);
        const d2 = Math.hypot(x - cfg.wheel2X, y - WHEEL_CENTER_Y);
        const d = Math.min(d1, d2);
        if (d <= cfg.wheelR * 0.42) color = hubColor;
        else if (d <= cfg.wheelR) color = tireColor;
      }

      if (color) cells.push({ x: rx * CELL, y: ry * CELL, color });
    }
  }

  return cells;
}

interface Props {
  profile: ElementCarProfile;
  parts: CarPart[];
}

export default function CarIllustration({ profile, parts }: Props) {
  const cfg = SILHOUETTES[profile.silhouette];
  const cells = useMemo(() => rasterize(cfg, profile, parts), [cfg, profile, parts]);

  return (
    <svg
      viewBox={`0 0 ${COLS * CELL} ${ROWS * CELL}`}
      className="car-illustration pixel"
      shapeRendering="crispEdges"
      role="img"
      aria-label={profile.label}
    >
      <ellipse
        cx={(cfg.frontX + cfg.rearX) / 2}
        cy={WHEEL_CENTER_Y + cfg.wheelR + 10}
        rx={(cfg.rearX - cfg.frontX) / 2}
        ry={7}
        fill="#000"
        opacity={0.32}
      />
      {cells.map((c, i) => (
        <rect key={i} x={c.x} y={c.y} width={CELL} height={CELL} fill={c.color} />
      ))}
    </svg>
  );
}
