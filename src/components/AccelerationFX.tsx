import type { CSSProperties } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface Props {
  isAccelerating: boolean;
  onFire: () => void;
  label: string;
  description: string;
  accentColor: string;
}

const LINE_COUNT = 28;

export default function AccelerationFX({ isAccelerating, onFire, label, description, accentColor }: Props) {
  return (
    <>
      <AnimatePresence>
        {isAccelerating && (
          <motion.div
            className="speed-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="speed-lines">
              {Array.from({ length: LINE_COUNT }).map((_, i) => (
                <motion.span
                  key={i}
                  style={{ '--angle': `${(360 / LINE_COUNT) * i}deg`, background: accentColor } as CSSProperties}
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 0.75 }}
                  transition={{ duration: 0.5, delay: i * 0.008 }}
                />
              ))}
            </div>
            <motion.div
              className="speed-flash"
              initial={{ opacity: 0.55 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="accel-panel">
        <div className="accel-info">
          <strong>{label}</strong>
          <span>{description}</span>
        </div>
        <button className="accel-btn" onClick={onFire} disabled={isAccelerating}>
          {isAccelerating ? '가속 중...' : '🏁 출발!'}
        </button>
      </div>
    </>
  );
}
