import { useMemo } from 'react';
import type { CarPart, ElementCarProfile } from '../lib/mapping';

// 깔끔한 펜 일러스트(라인아트) 차량. 픽셀 래스터가 아니라 부드러운 SVG 베지어 선.
// 나이트 개러지 배경이 어두우므로 밝은 잉크 선 + 오행 색 워시로 그린다.

const VB_W = 360;
const VB_H = 190;

type Pt = [number, number];

interface Sil {
  frontX: number;
  rearX: number;
  bumperTopY: number;
  bottomY: number;
  top: Pt[]; // 보닛~루프~데크 상단 곡선 포인트 (앞→뒤)
  window: Pt[]; // 캐빈(유리) 폴리곤
  door: Pt[]; // 도어 라인
  wheelFX: number;
  wheelRX: number;
  wheelR: number;
  archR: number;
  hoodStripe: Pt[]; // 스트라이프 경로
  charLine: Pt[]; // 사이드 캐릭터 라인
}

const S: Record<ElementCarProfile['silhouette'], Sil> = {
  // 화: 낮고 긴 스포츠카
  sports: {
    frontX: 22, rearX: 340, bumperTopY: 112, bottomY: 132,
    top: [[64, 106], [116, 100], [150, 64], [210, 58], [252, 82], [302, 100]],
    window: [[158, 66], [206, 62], [236, 84], [170, 86]],
    door: [[214, 82], [216, 120]],
    wheelFX: 92, wheelRX: 276, wheelR: 27, archR: 34,
    hoodStripe: [[150, 64], [210, 58], [252, 82]],
    charLine: [[70, 104], [270, 100]],
  },
  // 토: 키 큰 SUV
  suv: {
    frontX: 26, rearX: 336, bumperTopY: 104, bottomY: 132,
    top: [[52, 92], [78, 50], [150, 44], [250, 46], [292, 60], [316, 84]],
    window: [[92, 54], [244, 52], [258, 92], [96, 92]],
    door: [[176, 56], [176, 120]],
    wheelFX: 96, wheelRX: 268, wheelR: 30, archR: 37,
    hoodStripe: [[78, 50], [150, 44], [250, 46]],
    charLine: [[60, 100], [300, 96]],
  },
  // 금: 저상 쿠페
  coupe: {
    frontX: 22, rearX: 340, bumperTopY: 110, bottomY: 130,
    top: [[62, 100], [120, 92], [168, 58], [214, 62], [258, 86], [306, 100]],
    window: [[176, 62], [210, 66], [232, 88], [186, 88]],
    door: [[216, 84], [218, 118]],
    wheelFX: 92, wheelRX: 276, wheelR: 27, archR: 34,
    hoodStripe: [[168, 58], [214, 62], [258, 86]],
    charLine: [[70, 100], [274, 98]],
  },
  // 목: 각진 세단
  'sedan-sharp': {
    frontX: 22, rearX: 340, bumperTopY: 108, bottomY: 130,
    top: [[60, 98], [120, 92], [162, 56], [232, 54], [268, 78], [304, 96]],
    window: [[168, 58], [230, 56], [250, 84], [178, 84]],
    door: [[218, 82], [220, 116]],
    wheelFX: 94, wheelRX: 272, wheelR: 27, archR: 34,
    hoodStripe: [[162, 56], [232, 54], [268, 78]],
    charLine: [[68, 98], [276, 96]],
  },
  // 수: 유선형 세단
  'sedan-fluid': {
    frontX: 22, rearX: 340, bumperTopY: 108, bottomY: 130,
    top: [[64, 96], [124, 88], [168, 60], [236, 56], [274, 78], [308, 98]],
    window: [[176, 62], [234, 58], [252, 86], [186, 86]],
    door: [[220, 84], [222, 116]],
    wheelFX: 94, wheelRX: 272, wheelR: 27, archR: 34,
    hoodStripe: [[168, 60], [236, 56], [274, 78]],
    charLine: [[70, 96], [280, 94]],
  },
};

// Catmull-Rom → 부드러운 열린 곡선 path
function spline(pts: Pt[]): string {
  if (pts.length < 2) return '';
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2[0]} ${p2[1]}`;
  }
  return d;
}

function splineClosed(pts: Pt[]): string {
  return spline([...pts, pts[0]]) + ' Z';
}

function bodyOutline(s: Sil): string {
  const topPts: Pt[] = [
    [s.frontX, s.bottomY],
    [s.frontX, s.bumperTopY],
    ...s.top,
    [s.rearX, s.bumperTopY],
    [s.rearX, s.bottomY],
  ];
  let d = spline(topPts);
  // 하단 + 휠아치 (위로 오목)
  d += ` L ${s.wheelRX + s.archR} ${s.bottomY}`;
  d += ` A ${s.archR} ${s.archR} 0 0 0 ${s.wheelRX - s.archR} ${s.bottomY}`;
  d += ` L ${s.wheelFX + s.archR} ${s.bottomY}`;
  d += ` A ${s.archR} ${s.archR} 0 0 0 ${s.wheelFX - s.archR} ${s.bottomY}`;
  d += ` L ${s.frontX} ${s.bottomY} Z`;
  return d;
}

interface Props {
  profile: ElementCarProfile;
  parts: CarPart[];
}

export default function CarIllustration({ profile, parts }: Props) {
  const s = S[profile.silhouette];
  const has = (p: CarPart) => parts.includes(p);
  const ink = '#eef2f8';
  const accent = profile.accentColor;
  const chrome = has('chromeWheels');
  const wheelCY = s.bottomY + 6;

  const outline = useMemo(() => bodyOutline(s), [s]);
  const windowPath = useMemo(() => splineClosed(s.window), [s]);
  const winMinX = Math.min(...s.window.map((p) => p[0]));
  const winMaxX = Math.max(...s.window.map((p) => p[0]));
  const winMinY = Math.min(...s.window.map((p) => p[1]));
  const winMaxY = Math.max(...s.window.map((p) => p[1]));

  const strokeCommon = {
    fill: 'none',
    stroke: ink,
    strokeWidth: 2.6,
    strokeLinejoin: 'round' as const,
    strokeLinecap: 'round' as const,
  };

  const wheelSpokes = (cx: number) =>
    Array.from({ length: 6 }).map((_, i) => {
      const a = (i / 6) * Math.PI * 2 + 0.4;
      return (
        <line
          key={i}
          x1={cx + Math.cos(a) * (s.wheelR * 0.28)}
          y1={wheelCY + Math.sin(a) * (s.wheelR * 0.28)}
          x2={cx + Math.cos(a) * (s.wheelR * 0.62)}
          y2={wheelCY + Math.sin(a) * (s.wheelR * 0.62)}
          stroke={chrome ? accent : ink}
          strokeWidth={2}
          strokeLinecap="round"
        />
      );
    });

  const renderWheel = (cx: number) => (
    <g>
      <circle cx={cx} cy={wheelCY} r={s.wheelR} fill="#0d0f16" stroke={ink} strokeWidth={2.6} />
      <circle cx={cx} cy={wheelCY} r={s.wheelR * 0.62} fill="none" stroke={chrome ? accent : ink} strokeWidth={2.2} />
      {wheelSpokes(cx)}
      <circle cx={cx} cy={wheelCY} r={s.wheelR * 0.16} fill={chrome ? accent : ink} />
    </g>
  );

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      className="car-illustration line"
      role="img"
      aria-label={profile.label}
    >
      {/* 바디 채움 워시 */}
      <path d={outline} fill={profile.bodyColor} fillOpacity={0.32} stroke="none" />
      {/* 유리 */}
      <path d={windowPath} fill={accent} fillOpacity={0.14} stroke={ink} strokeWidth={2} strokeLinejoin="round" />
      {/* 유리 반사 스트릭 (창 안쪽에 짧게) */}
      {[0.28, 0.42].map((o, i) => {
        const wx = winMinX + (winMaxX - winMinX) * o;
        return (
          <line
            key={i}
            x1={wx}
            y1={winMinY + 3}
            x2={wx + 6}
            y2={winMinY + (winMaxY - winMinY) * 0.6}
            stroke={ink}
            strokeWidth={1.6}
            opacity={0.45}
            strokeLinecap="round"
          />
        );
      })}

      {/* 바디 외곽선 */}
      <path d={outline} {...strokeCommon} />

      {/* 휠아치 이너 라인 (펜더) */}
      {[s.wheelFX, s.wheelRX].map((cx, i) => (
        <path
          key={i}
          d={`M ${cx - s.archR + 3} ${s.bottomY} A ${s.archR - 3} ${s.archR - 3} 0 0 0 ${cx + s.archR - 3} ${s.bottomY}`}
          fill="none"
          stroke={ink}
          strokeWidth={1.6}
          opacity={0.6}
          strokeLinecap="round"
        />
      ))}

      {/* 도어 라인 */}
      <path d={spline(s.door)} fill="none" stroke={ink} strokeWidth={1.8} opacity={0.65} strokeLinecap="round" />

      {/* 사이드 캐릭터 라인 */}
      <path d={spline(s.charLine)} fill="none" stroke={ink} strokeWidth={1.4} opacity={0.4} strokeLinecap="round" />

      {/* 헤드라이트 / 테일라이트 */}
      <path
        d={`M ${s.frontX + 2} ${s.bumperTopY - 6} q -6 3 -2 12`}
        fill="none"
        stroke={accent}
        strokeWidth={2.4}
        strokeLinecap="round"
      />
      <line x1={s.rearX - 3} y1={s.bumperTopY - 4} x2={s.rearX - 3} y2={s.bumperTopY + 8} stroke="#ff5b6b" strokeWidth={3} strokeLinecap="round" />

      {/* 십신 파츠 */}
      {has('racingStripe') && (
        <path d={spline(s.hoodStripe)} fill="none" stroke={accent} strokeWidth={4} opacity={0.85} strokeLinecap="round" />
      )}
      {has('sunroofGlow') && (
        <line
          x1={(s.window[0][0] + s.window[1][0]) / 2 - 12}
          y1={(s.window[0][1] + s.window[1][1]) / 2 + 2}
          x2={(s.window[0][0] + s.window[1][0]) / 2 + 12}
          y2={(s.window[0][1] + s.window[1][1]) / 2 + 2}
          stroke={accent}
          strokeWidth={3}
          opacity={0.9}
          strokeLinecap="round"
        />
      )}
      {has('lightBar') && (
        <line x1={s.frontX + 6} y1={s.bottomY - 4} x2={s.frontX + 70} y2={s.bottomY - 4} stroke={accent} strokeWidth={3} strokeLinecap="round" />
      )}
      {has('spoilerFlame') && (
        <>
          <path
            d={`M ${s.rearX - 40} ${s.top[s.top.length - 1][1] - 14} L ${s.rearX - 6} ${s.top[s.top.length - 1][1] - 18}`}
            fill="none"
            stroke={ink}
            strokeWidth={3}
            strokeLinecap="round"
          />
          <line x1={s.rearX - 34} y1={s.top[s.top.length - 1][1] - 14} x2={s.rearX - 34} y2={s.top[s.top.length - 1][1] - 2} stroke={ink} strokeWidth={2.4} />
          <line x1={s.rearX - 10} y1={s.top[s.top.length - 1][1] - 18} x2={s.rearX - 10} y2={s.top[s.top.length - 1][1] - 4} stroke={ink} strokeWidth={2.4} />
          <path d={`M ${s.rearX + 2} ${s.bumperTopY + 6} q 12 2 20 -2 q -8 8 -20 6`} fill={accent} stroke="none" opacity={0.9} />
        </>
      )}

      {/* 바퀴 */}
      {renderWheel(s.wheelFX)}
      {renderWheel(s.wheelRX)}
    </svg>
  );
}
