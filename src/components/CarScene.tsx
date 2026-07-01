import { useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import CarModel, { type CarModelHandle } from './CarModel';
import type { AccelerationProfile, CarPart, ElementCarProfile } from '../lib/mapping';

interface RigProps {
  isAccelerating: boolean;
  delayMs: number;
  durationMs: number;
  carRef: React.RefObject<CarModelHandle | null>;
  groupRef: React.RefObject<THREE.Group | null>;
  onComplete?: () => void;
}

function Rig({ isAccelerating, delayMs, durationMs, carRef, groupRef, onComplete }: RigProps) {
  const { camera } = useThree();
  const startRef = useRef<number | null>(null);
  const doneRef = useRef(false);
  const baseFov = useRef((camera as THREE.PerspectiveCamera).fov);

  useEffect(() => {
    if (isAccelerating) {
      startRef.current = performance.now();
      doneRef.current = false;
    } else {
      startRef.current = null;
    }
  }, [isAccelerating]);

  useFrame(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const speedObj = carRef.current?.speed;

    if (!isAccelerating || startRef.current === null) {
      if (speedObj) speedObj.value = THREE.MathUtils.lerp(speedObj.value, 0, 0.08);
      if (groupRef.current) {
        groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, 0, 0.08);
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, 0.08);
      }
      cam.fov = THREE.MathUtils.lerp(cam.fov, baseFov.current, 0.08);
      cam.updateProjectionMatrix();
      return;
    }

    const elapsed = performance.now() - startRef.current;
    const progress = elapsed > delayMs ? Math.min(1, (elapsed - delayMs) / durationMs) : 0;
    const eased = 1 - Math.pow(1 - progress, 2);

    if (speedObj) speedObj.value = eased;
    if (groupRef.current) {
      groupRef.current.position.z = -eased * 3;
      groupRef.current.rotation.x = -eased * 0.08;
    }
    cam.fov = baseFov.current + eased * 18;
    cam.updateProjectionMatrix();

    if (progress >= 1 && !doneRef.current) {
      doneRef.current = true;
      onComplete?.();
    }
  });

  return null;
}

interface Props {
  profile: ElementCarProfile;
  parts: CarPart[];
  acceleration: AccelerationProfile;
  isAccelerating: boolean;
  onAccelerationComplete?: () => void;
}

export default function CarScene({ profile, parts, acceleration, isAccelerating, onAccelerationComplete }: Props) {
  const carRef = useRef<CarModelHandle>(null);
  const groupRef = useRef<THREE.Group>(null);

  return (
    <Canvas shadows camera={{ position: [4.5, 2.2, 6], fov: 40 }}>
      <color attach="background" args={['#0b0d12']} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
      <group ref={groupRef}>
        <CarModel ref={carRef} profile={profile} parts={parts} />
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#15181f" />
      </mesh>
      <gridHelper args={[40, 40, '#232733', '#1a1d24']} />
      <OrbitControls enablePan={false} minDistance={4} maxDistance={12} maxPolarAngle={Math.PI / 2.1} />
      <Rig
        isAccelerating={isAccelerating}
        delayMs={acceleration.delayMs}
        durationMs={acceleration.durationMs}
        carRef={carRef}
        groupRef={groupRef}
        onComplete={onAccelerationComplete}
      />
    </Canvas>
  );
}
