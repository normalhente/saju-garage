import { motion } from 'framer-motion';
import type { SajuResult } from '../lib/saju';
import { pillarName } from '../lib/constants';
import { PART_LABEL, type CarSpec } from '../lib/mapping';

interface Props {
  saju: SajuResult;
  carSpec: CarSpec;
}

const ELEMENT_ORDER: Array<keyof SajuResult['elementCounts']> = ['목', '화', '토', '금', '수'];

export default function SajuSummary({ saju, carSpec }: Props) {
  const maxCount = Math.max(...ELEMENT_ORDER.map((e) => saju.elementCounts[e]), 1);

  return (
    <motion.div
      className="saju-summary"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
    >
      <div className="summary-header">
        <h2>{carSpec.profile.label}</h2>
        <p>{carSpec.profile.description}</p>
      </div>

      <div className="pillars-row">
        <div className="pillar-chip">
          <span>년주</span>
          <strong>{pillarName(saju.year.stemIndex, saju.year.branchIndex)}</strong>
        </div>
        <div className="pillar-chip">
          <span>월주</span>
          <strong>{pillarName(saju.month.stemIndex, saju.month.branchIndex)}</strong>
        </div>
        <div className="pillar-chip highlight">
          <span>일주(일간)</span>
          <strong>{pillarName(saju.day.stemIndex, saju.day.branchIndex)}</strong>
        </div>
        {saju.hour && (
          <div className="pillar-chip">
            <span>시주</span>
            <strong>{pillarName(saju.hour.stemIndex, saju.hour.branchIndex)}</strong>
          </div>
        )}
      </div>

      <div className="element-bars">
        {ELEMENT_ORDER.map((el) => (
          <div className="element-bar-row" key={el}>
            <span className="element-label">{el}</span>
            <div className="element-bar-track">
              <motion.div
                className="element-bar-fill"
                initial={{ width: 0 }}
                animate={{ width: `${(saju.elementCounts[el] / maxCount) * 100}%` }}
                transition={{ duration: 0.6, delay: 0.3 }}
              />
            </div>
            <span className="element-count">{saju.elementCounts[el]}</span>
          </div>
        ))}
      </div>

      <div className="strength-line">
        <span className="tag">{saju.strength}</span>
        <span>{carSpec.acceleration.label} — {carSpec.acceleration.description}</span>
      </div>

      <div className="parts-list">
        {carSpec.parts.length === 0 && <span className="part-chip">기본 사양</span>}
        {carSpec.parts.map((p) => (
          <span className="part-chip" key={p}>{PART_LABEL[p]}</span>
        ))}
      </div>
    </motion.div>
  );
}
