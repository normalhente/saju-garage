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

const PAD = 2;

export default function CarIllustration({ profile, parts }: Props) {
  const { rects, vbX, vbY, vbW, vbH } = useMemo(() => {
    const { pixels, w, h } = renderPixelCar(profile, parts);
    const rects: RunRect[] = [];
    let minX = w, minY = h, maxX = 0, maxY = 0;
    for (let y = 0; y < h; y++) {
      let x = 0;
      while (x < w) {
        const color = pixels[y][x];
        if (!color) { x++; continue; }
        let end = x + 1;
        while (end < w && pixels[y][end] === color) end++;
        rects.push({ x, y, w: end - x, color });
        if (x < minX) minX = x;
        if (end > maxX) maxX = end;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        x = end;
      }
    }
    return {
      rects,
      vbX: minX - PAD,
      vbY: minY - PAD,
      vbW: maxX - minX + PAD * 2,
      vbH: maxY - minY + 1 + PAD * 2,
    };
  }, [profile, parts]);

  return (
    <svg
      viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
      className="car-illustration pixel"
      shapeRendering="crispEdges"
      role="img"
      aria-label={profile.label}
    >
      {rects.map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={r.w} height={1} fill={r.color} />
      ))}
    </svg>
  );
}
