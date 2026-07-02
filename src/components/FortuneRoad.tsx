import { useState } from 'react';
import { motion } from 'framer-motion';
import type { RoadSegment } from '../lib/saju';
import { ROAD_TYPE_FLAVOR } from '../lib/mapping';
import { pillarName } from '../lib/constants';

interface Props {
  daeUn: RoadSegment[];
  accentColor: string;
}

export default function FortuneRoad({ daeUn, accentColor }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = daeUn[activeIndex];
  const activeFlavor = active ? ROAD_TYPE_FLAVOR[active.roadType] : null;

  return (
    <div className="fortune-road">
      <h2>간이 대운 로드 (참고용)</h2>
      <p className="road-sub">10년 단위 흐름을 도로 구간으로 표현했어요. 드래그하거나 구간을 눌러 살펴보세요.</p>

      <div className="road-track">
        {daeUn.map((seg, i) => (
          <button
            key={i}
            className={`road-tile ${seg.roadType} ${i === activeIndex ? 'active' : ''}`}
            onClick={() => setActiveIndex(i)}
          >
            <span className="road-tile-icon">{ROAD_TYPE_FLAVOR[seg.roadType].emoji}</span>
            <span className="road-tile-age">{seg.ageStart}~{seg.ageEnd}세</span>
          </button>
        ))}
        <motion.div
          className="road-car-marker"
          animate={{ left: `${(activeIndex + 0.5) * (100 / daeUn.length)}%` }}
          transition={{ type: 'spring', stiffness: 220, damping: 24 }}
        >
          🚗
        </motion.div>
      </div>

      <input
        type="range"
        className="road-slider"
        min={0}
        max={daeUn.length - 1}
        value={activeIndex}
        onChange={(e) => setActiveIndex(Number(e.target.value))}
      />

      {active && activeFlavor && (
        <motion.div
          key={activeIndex}
          className="road-detail"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          style={{ borderColor: accentColor }}
        >
          <strong>{pillarName(active.pillar.stemIndex, active.pillar.branchIndex)}대운 · {activeFlavor.label}</strong>
          <span>{activeFlavor.blurb} · 관계: {active.relation}</span>
        </motion.div>
      )}
    </div>
  );
}
