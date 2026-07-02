import { useMemo } from 'react';
import type { CarPart, ElementCarProfile } from '../lib/mapping';
import { renderPixelCar } from '../lib/pixelCar';

interface RunRect {
  x: number;
  y: number;
  w: number;
  color: string;
}

interface Props {
  profile: ElementCarProfile;
  parts: CarPart[];
}

export default function CarIllustration({ profile, parts }: Props) {
  const { rects, w, h } = useMemo(() => {
    const { pixels, w, h } = renderPixelCar(profile, parts);
    // 같은 색 가로 런 병합 → rect 수 최소화
    const rects: RunRect[] = [];
    for (let y = 0; y < h; y++) {
      let x = 0;
      while (x < w) {
        const color = pixels[y][x];
        if (!color) { x++; continue; }
        let end = x + 1;
        while (end < w && pixels[y][end] === color) end++;
        rects.push({ x, y, w: end - x, color });
        x = end;
      }
    }
    return { rects, w, h };
  }, [profile, parts]);

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="car-illustration pixel"
      shapeRendering="crispEdges"
      role="img"
      aria-label={profile.label}
    >
      <ellipse cx={w / 2} cy={h - 4} rx={w * 0.42} ry={3.2} fill="#000" opacity={0.3} />
      {rects.map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={r.w} height={1} fill={r.color} />
      ))}
    </svg>
  );
}
