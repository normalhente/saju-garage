import { useEffect, useRef } from 'react';
import { motion, useAnimationFrame, useMotionValue, useTransform } from 'framer-motion';
import CarIllustration from './CarIllustration';
import type { AccelerationProfile, CarPart, ElementCarProfile } from '../lib/mapping';

interface Props {
  profile: ElementCarProfile;
  parts: CarPart[];
  acceleration: AccelerationProfile;
  isAccelerating: boolean;
  onAccelerationComplete?: () => void;
}

const MAX_RPM = 9000;

export default function CarStage({ profile, parts, acceleration, isAccelerating, onAccelerationComplete }: Props) {
  const rpm = useMotionValue(0.1);
  const shakeX = useMotionValue(0);
  const shakeY = useMotionValue(0);
  const tilt = useMotionValue(0);

  const needleAngle = useTransform(rpm, [0, 1], [-118, 118]);
  const rpmText = useTransform(rpm, (v) => `${Math.round((v * MAX_RPM) / 100) * 100}`);
  const redGlow = useTransform(rpm, [0.7, 1], [0, 1]);
  const exhaustOpacity = useTransform(rpm, [0.4, 0.85], [0, 1]);

  const startRef = useRef<number | null>(null);
  const doneRef = useRef(false);

  useEffect(() => {
    if (isAccelerating) {
      startRef.current = performance.now();
      doneRef.current = false;
    } else {
      startRef.current = null;
    }
  }, [isAccelerating]);

  useAnimationFrame(() => {
    const now = performance.now();
    let target = 0.1 + Math.sin(now / 130) * 0.02; // idle flutter
    let revving = false;

    if (isAccelerating && startRef.current !== null) {
      const el = now - startRef.current;
      if (el < acceleration.delayMs) {
        target = 0.12; // 터보랙 구간: 낮게
      } else {
        const p = Math.min(1, (el - acceleration.delayMs) / acceleration.durationMs);
        const ramp = 1 - Math.pow(1 - p, 3);
        target = 0.2 + ramp * 0.74 + Math.sin(now / 38) * 0.05 * ramp;
        revving = ramp > 0.15;
      }
      if (el >= acceleration.delayMs + acceleration.durationMs && !doneRef.current) {
        doneRef.current = true;
        onAccelerationComplete?.();
      }
    }

    rpm.set(rpm.get() + (target - rpm.get()) * 0.25);
    const cur = rpm.get();
    const amp = (revving ? cur * 3.4 : cur * 0.5);
    shakeX.set((Math.random() - 0.5) * amp);
    shakeY.set((Math.random() - 0.5) * amp * 0.7);
    tilt.set(-cur * 1.5 + (Math.random() - 0.5) * amp * 0.15);
  });

  return (
    <div className="car-stage-2d">
      <div className="garage-floor" />

      <div className="car-holder">
        <motion.div className="car-wrap" style={{ x: shakeX, y: shakeY, rotate: tilt }}>
          <CarIllustration profile={profile} parts={parts} />
        </motion.div>
        <div className="car-reflection" aria-hidden>
          <motion.div className="car-wrap" style={{ x: shakeX, rotate: tilt }}>
            <CarIllustration profile={profile} parts={parts} />
          </motion.div>
        </div>

        {/* 배기 연기 */}
        <motion.div className="exhaust" style={{ opacity: exhaustOpacity }} aria-hidden>
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              animate={{ x: [-2, -20 - i * 8], y: [0, -6 - i * 4], opacity: [0.6, 0], scale: [0.6, 1.8] }}
              transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.18, ease: 'easeOut' }}
            />
          ))}
        </motion.div>
      </div>

      {/* RPM 타코미터 */}
      <div className="tacho">
        <svg viewBox="0 0 120 76" className="tacho-svg">
          <path d="M 12 66 A 48 48 0 0 1 108 66" fill="none" stroke="#2a2e37" strokeWidth="8" strokeLinecap="round" />
          <motion.path
            d="M 78 20 A 48 48 0 0 1 108 66"
            fill="none"
            stroke="#ff3b46"
            strokeWidth="8"
            strokeLinecap="round"
            style={{ opacity: redGlow }}
          />
          {Array.from({ length: 10 }).map((_, i) => {
            const a = (-118 + (236 / 9) * i) * (Math.PI / 180);
            const x1 = 60 + Math.sin(a) * 40;
            const y1 = 66 - Math.cos(a) * 40;
            const x2 = 60 + Math.sin(a) * 46;
            const y2 = 66 - Math.cos(a) * 46;
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#5a6070" strokeWidth={i >= 7 ? 2.5 : 1.5} />;
          })}
          <motion.line
            x1={60}
            y1={66}
            x2={60}
            y2={22}
            stroke={profile.accentColor}
            strokeWidth={3}
            strokeLinecap="round"
            style={{ rotate: needleAngle, originX: '60px', originY: '66px' }}
          />
          <circle cx={60} cy={66} r={5} fill={profile.accentColor} />
        </svg>
        <div className="tacho-readout">
          <motion.span className="tacho-num">{rpmText}</motion.span>
          <span className="tacho-unit">RPM</span>
        </div>
      </div>
    </div>
  );
}
