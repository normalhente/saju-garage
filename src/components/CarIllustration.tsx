import { motion, type MotionValue } from 'framer-motion';
import type { CarPart, ElementCarProfile } from '../lib/mapping';

const WHEEL_CENTER_Y = 166;

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

interface Props {
  profile: ElementCarProfile;
  parts: CarPart[];
  wheelSpin?: MotionValue<number>;
}

export default function CarIllustration({ profile, parts, wheelSpin }: Props) {
  const cfg = SILHOUETTES[profile.silhouette];
  const bodyPath = buildBodyPath(cfg);
  const glassPath = buildGlassPath(cfg);
  const has = (p: CarPart) => parts.includes(p);
  const bumperTopY = cfg.bodyBottomY - cfg.bumperH;

  const wheelRimColor = has('chromeWheels') ? '#f2f5f7' : '#2a2d33';
  const wheelHubColor = has('chromeWheels') ? '#9aa4ad' : '#4b4f57';

  return (
    <svg viewBox="0 0 460 200" className="car-illustration" role="img" aria-label={profile.label}>
      <defs>
        <linearGradient id="bodyShine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="35%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <clipPath id="bodyClip">
          <path d={bodyPath} />
        </clipPath>
      </defs>

      {/* ground shadow */}
      <ellipse
        cx={(cfg.frontX + cfg.rearX) / 2}
        cy={WHEEL_CENTER_Y + cfg.wheelR + 6}
        rx={(cfg.rearX - cfg.frontX) / 2 + 10}
        ry={10}
        fill="#000"
        opacity={0.35}
      />

      {/* wheels (behind body) */}
      {[cfg.wheel1X, cfg.wheel2X].map((wx, i) => (
        <motion.g key={i} style={{ transformOrigin: `${wx}px ${WHEEL_CENTER_Y}px`, rotate: wheelSpin }}>
          <circle cx={wx} cy={WHEEL_CENTER_Y} r={cfg.wheelR} fill={wheelRimColor} stroke="#111" strokeWidth={3} />
          <circle cx={wx} cy={WHEEL_CENTER_Y} r={cfg.wheelR * 0.42} fill={wheelHubColor} />
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <line
              key={deg}
              x1={wx}
              y1={WHEEL_CENTER_Y}
              x2={wx + Math.cos((deg * Math.PI) / 180) * cfg.wheelR * 0.9}
              y2={WHEEL_CENTER_Y + Math.sin((deg * Math.PI) / 180) * cfg.wheelR * 0.9}
              stroke="#111"
              strokeWidth={2}
            />
          ))}
        </motion.g>
      ))}

      {/* body */}
      <path d={bodyPath} fill={profile.bodyColor} stroke="#00000055" strokeWidth={2} />
      <path d={bodyPath} fill="url(#bodyShine)" />

      {/* glass */}
      <path d={glassPath} fill={profile.glassColor} opacity={0.92} />

      {/* headlight + taillight */}
      <rect x={cfg.frontX + 3} y={bumperTopY + 2} width={9} height={cfg.bumperH - 4} rx={2.5} fill="#fff6cc" />
      <rect x={cfg.rearX - 12} y={bumperTopY + 2} width={9} height={cfg.bumperH - 4} rx={2.5} fill="#ff5b5b" />

      {/* racing stripe */}
      {has('racingStripe') && (
        <rect
          x={cfg.frontX}
          y={(cfg.hoodY + bumperTopY) / 2 - 4}
          width={cfg.rearX - cfg.frontX}
          height={8}
          fill={profile.accentColor}
          opacity={0.85}
          clipPath="url(#bodyClip)"
        />
      )}

      {/* sunroof glow */}
      {has('sunroofGlow') && (
        <rect
          x={cfg.roofFrontX + 20}
          y={cfg.roofY + 6}
          width={Math.max(20, cfg.roofRearX - cfg.roofFrontX - 40)}
          height={10}
          rx={4}
          fill={profile.accentColor}
          opacity={0.9}
        />
      )}

      {/* light bar */}
      {has('lightBar') && (
        <rect x={cfg.frontX - 4} y={bumperTopY + cfg.bumperH * 0.15} width={cfg.roofFrontX - cfg.frontX * 0.5 - 30} height={5} rx={2.5} fill={profile.accentColor} />
      )}

      {/* spoiler + flame */}
      {has('spoilerFlame') && (
        <g>
          <rect x={cfg.rearX - 40} y={cfg.roofY - 14} width={32} height={5} rx={2} fill="#20232b" stroke={profile.accentColor} strokeWidth={1} />
          <rect x={cfg.rearX - 40} y={cfg.roofY - 14} width={5} height={16} fill="#20232b" />
          <rect x={cfg.rearX - 13} y={cfg.roofY - 14} width={5} height={16} fill="#20232b" />
          <ellipse cx={cfg.rearX + 4} cy={cfg.bodyBottomY - cfg.bumperH * 0.4} rx={6} ry={7} fill={profile.accentColor} opacity={0.9} />
        </g>
      )}
    </svg>
  );
}
