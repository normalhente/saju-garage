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

export default function CarStage({ profile, parts, acceleration, isAccelerating, onAccelerationComplete }: Props) {
  const carX = useMotionValue(0);
  const carSkew = useMotionValue(0);
  const roadX = useMotionValue(0);
  const roadBgPosition = useTransform(roadX, (v) => `${v}px 0`);
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

  useAnimationFrame((_, delta) => {
    const dt = Math.min(delta, 48) / 1000;
    let speed = 0;

    if (isAccelerating && startRef.current !== null) {
      const elapsed = performance.now() - startRef.current;
      const progress =
        elapsed > acceleration.delayMs ? Math.min(1, (elapsed - acceleration.delayMs) / acceleration.durationMs) : 0;
      speed = 1 - Math.pow(1 - progress, 2);
      carX.set(speed * 70);
      carSkew.set(-speed * 3);
      if (progress >= 1 && !doneRef.current) {
        doneRef.current = true;
        onAccelerationComplete?.();
      }
    } else {
      carX.set(carX.get() * 0.86);
      carSkew.set(carSkew.get() * 0.86);
    }

    roadX.set(roadX.get() - (36 + speed * 60) * dt);
  });

  return (
    <div className="car-stage-2d">
      <motion.div className="road-bg" style={{ backgroundPosition: roadBgPosition }} />
      <motion.div className="car-wrap" style={{ x: carX, skewX: carSkew }}>
        <CarIllustration profile={profile} parts={parts} />
      </motion.div>
    </div>
  );
}
