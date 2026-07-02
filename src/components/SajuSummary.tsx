import { motion } from 'framer-motion';
import type { SajuResult } from '../lib/saju';
import { pillarName } from '../lib/constants';
import { PART_FLAVOR, type CarSpec } from '../lib/mapping';

interface Props {
  saju: SajuResult;
  carSpec: CarSpec;
}

const ELEMENT_ORDER: Array<keyof SajuResult['elementCounts']> = ['목', '화', '토', '금', '수'];
const ELEMENT_COLOR: Record<string, string> = {
  목: '#2f8f4e',
  화: '#d7263d',
  토: '#a9744f',
  금: '#9aa4ad',
  수: '#1d4e89',
};

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 14, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.32, ease: 'easeOut' as const } },
};

export default function SajuSummary({ saju, carSpec }: Props) {
  const maxCount = Math.max(...ELEMENT_ORDER.map((e) => saju.elementCounts[e]), 1);

  return (
    <motion.div className="saju-summary" variants={listVariants} initial="hidden" animate="show">
      <motion.div className="summary-hero" variants={cardVariants}>
        <span className="hero-emoji">{carSpec.profile.emoji}</span>
        <div>
          <h2>{carSpec.profile.label}</h2>
          <p className="hero-tagline">{carSpec.profile.tagline}</p>
        </div>
      </motion.div>

      <motion.div className="reveal-card" variants={cardVariants}>
        <div className="reveal-card-title">
          <span>{carSpec.profile.emoji}</span>
          <strong>오행 엔진</strong>
        </div>
        <p>{carSpec.profile.description}</p>
        <div className="element-bars">
          {ELEMENT_ORDER.map((el) => (
            <div className="element-bar-row" key={el}>
              <span className="element-label">{el}</span>
              <div className="element-bar-track">
                <motion.div
                  className="element-bar-fill"
                  style={{ background: ELEMENT_COLOR[el] }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(saju.elementCounts[el] / maxCount) * 100}%` }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                />
              </div>
              <span className="element-count">{saju.elementCounts[el]}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div className="reveal-card" variants={cardVariants}>
        <div className="reveal-card-title">
          <span>{carSpec.acceleration.emoji}</span>
          <strong>가속 스타일 · {saju.strength}</strong>
        </div>
        <p>{carSpec.acceleration.description}</p>
      </motion.div>

      {carSpec.parts.length > 0 && (
        <motion.div className="reveal-card" variants={cardVariants}>
          <div className="reveal-card-title">
            <span>🔧</span>
            <strong>장착된 파츠</strong>
          </div>
          <div className="parts-grid">
            {carSpec.parts.map((p) => {
              const f = PART_FLAVOR[p];
              return (
                <div className="part-card" key={p}>
                  <span className="part-emoji">{f.emoji}</span>
                  <div>
                    <div className="part-title">
                      {f.title} <span className="part-source">{f.source}</span>
                    </div>
                    <div className="part-blurb">{f.blurb}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      <motion.div className="reveal-card pillars-card" variants={cardVariants}>
        <div className="reveal-card-title">
          <span>📜</span>
          <strong>사주 원국</strong>
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
      </motion.div>
    </motion.div>
  );
}
