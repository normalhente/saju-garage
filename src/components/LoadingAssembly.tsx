import { useEffect } from 'react';
import { motion } from 'framer-motion';

interface Props {
  onDone: () => void;
}

const PARTS = [
  { emoji: '🔩', label: '사주 원국 분석 중...' },
  { emoji: '⚙️', label: '오행 밸런스 계산 중...' },
  { emoji: '🚗', label: '차체 조립 중...' },
  { emoji: '🎨', label: '컬러 & 파츠 도색 중...' },
];

export default function LoadingAssembly({ onDone }: Props) {
  useEffect(() => {
    const t = setTimeout(onDone, PARTS.length * 500 + 300);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      className="loading-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="loading-parts">
        {PARTS.map((part, i) => (
          <motion.div
            key={part.label}
            className="loading-part"
            initial={{ opacity: 0, scale: 0.4, rotate: -30 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: i * 0.5, duration: 0.4, type: 'spring' }}
          >
            <span className="loading-emoji">{part.emoji}</span>
            <span>{part.label}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
