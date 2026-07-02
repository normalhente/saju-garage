import { AnimatePresence, motion } from 'framer-motion';

interface Props {
  isAccelerating: boolean;
  onFire: () => void;
  label: string;
  description: string;
  accentColor: string;
}

export default function AccelerationFX({ isAccelerating, onFire, label, description, accentColor }: Props) {
  return (
    <>
      <AnimatePresence>
        {isAccelerating && (
          <motion.div
            className="rev-flash"
            style={{ background: `radial-gradient(circle at 50% 60%, ${accentColor}22, transparent 60%)` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.8, 0.2, 0.5] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        )}
      </AnimatePresence>

      <div className="accel-panel">
        <div className="accel-info">
          <strong>{label}</strong>
          <span>{description}</span>
        </div>
        <button className="accel-btn" onClick={onFire} disabled={isAccelerating}>
          {isAccelerating ? '레브 중...' : '🔑 시동 걸기'}
        </button>
      </div>
    </>
  );
}
