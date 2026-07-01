import { useRef, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { CarPart, ElementCarProfile } from '../lib/mapping';

interface SilhouetteParams {
  bodyLength: number;
  bodyHeight: number;
  bodyWidth: number;
  cabinLength: number;
  cabinHeight: number;
  cabinOffsetZ: number;
  wheelRadius: number;
}

const SILHOUETTES: Record<ElementCarProfile['silhouette'], SilhouetteParams> = {
  sports: { bodyLength: 4.4, bodyHeight: 0.5, bodyWidth: 1.9, cabinLength: 1.8, cabinHeight: 0.5, cabinOffsetZ: 0.2, wheelRadius: 0.42 },
  suv: { bodyLength: 4.2, bodyHeight: 0.9, bodyWidth: 1.95, cabinLength: 2.6, cabinHeight: 1.1, cabinOffsetZ: -0.1, wheelRadius: 0.5 },
  coupe: { bodyLength: 4.3, bodyHeight: 0.6, bodyWidth: 1.85, cabinLength: 2.0, cabinHeight: 0.6, cabinOffsetZ: 0.1, wheelRadius: 0.44 },
  'sedan-sharp': { bodyLength: 4.5, bodyHeight: 0.65, bodyWidth: 1.85, cabinLength: 2.3, cabinHeight: 0.75, cabinOffsetZ: 0, wheelRadius: 0.44 },
  'sedan-fluid': { bodyLength: 4.5, bodyHeight: 0.65, bodyWidth: 1.85, cabinLength: 2.2, cabinHeight: 0.7, cabinOffsetZ: -0.05, wheelRadius: 0.44 },
};

export interface CarModelHandle {
  speed: { value: number };
}

interface Props {
  profile: ElementCarProfile;
  parts: CarPart[];
}

const CarModel = forwardRef<CarModelHandle, Props>(({ profile, parts }, ref) => {
  const speedRef = useRef({ value: 0 });
  useImperativeHandle(ref, () => ({ speed: speedRef.current }), []);

  const wheelRefs = useRef<(THREE.Mesh | null)[]>([]);
  const s = SILHOUETTES[profile.silhouette];
  const hasPart = (p: CarPart) => parts.includes(p);

  useFrame((_, delta) => {
    const idle = 0.6;
    const boost = speedRef.current.value * 14;
    const rot = (idle + boost) * delta;
    for (const w of wheelRefs.current) {
      if (w) w.rotation.x += rot;
    }
  });

  const wheelX = s.bodyWidth / 2 + 0.05;
  const wheelPositions: [number, number, number][] = [
    [-wheelX, s.wheelRadius, s.bodyLength / 2 - s.wheelRadius - 0.2],
    [wheelX, s.wheelRadius, s.bodyLength / 2 - s.wheelRadius - 0.2],
    [-wheelX, s.wheelRadius, -s.bodyLength / 2 + s.wheelRadius + 0.2],
    [wheelX, s.wheelRadius, -s.bodyLength / 2 + s.wheelRadius + 0.2],
  ];

  const wheelColor = hasPart('chromeWheels') ? '#e8ecef' : '#1c1c1c';
  const wheelMetalness = hasPart('chromeWheels') ? 1 : 0.2;

  return (
    <group position={[0, s.wheelRadius, 0]}>
      {/* body */}
      <mesh position={[0, s.bodyHeight / 2, 0]} castShadow>
        <boxGeometry args={[s.bodyWidth, s.bodyHeight, s.bodyLength]} />
        <meshStandardMaterial color={profile.bodyColor} metalness={0.4} roughness={0.35} />
      </mesh>

      {/* cabin */}
      <mesh
        position={[0, s.bodyHeight + s.cabinHeight / 2, s.cabinOffsetZ]}
        castShadow
      >
        <boxGeometry args={[s.bodyWidth * 0.85, s.cabinHeight, s.cabinLength]} />
        <meshStandardMaterial color={profile.bodyColor} metalness={0.3} roughness={0.4} />
      </mesh>

      {/* racing stripe */}
      {hasPart('racingStripe') && (
        <mesh position={[0, s.bodyHeight + s.cabinHeight + 0.01, 0]}>
          <boxGeometry args={[s.bodyWidth * 0.25, 0.02, s.bodyLength * 0.95]} />
          <meshStandardMaterial color={profile.accentColor} />
        </mesh>
      )}

      {/* sunroof glow */}
      {hasPart('sunroofGlow') && (
        <mesh position={[0, s.bodyHeight + s.cabinHeight + 0.01, s.cabinOffsetZ]}>
          <boxGeometry args={[s.bodyWidth * 0.6, 0.02, s.cabinLength * 0.7]} />
          <meshStandardMaterial color={profile.accentColor} emissive={profile.accentColor} emissiveIntensity={1.2} />
        </mesh>
      )}

      {/* light bar (front bumper accent) */}
      {hasPart('lightBar') && (
        <mesh position={[0, s.bodyHeight * 0.5, s.bodyLength / 2 + 0.02]}>
          <boxGeometry args={[s.bodyWidth * 0.9, 0.12, 0.05]} />
          <meshStandardMaterial color={profile.accentColor} emissive={profile.accentColor} emissiveIntensity={1.5} />
        </mesh>
      )}

      {/* spoiler + exhaust flame */}
      {hasPart('spoilerFlame') && (
        <group position={[0, s.bodyHeight + 0.35, -s.bodyLength / 2 + 0.15]}>
          <mesh>
            <boxGeometry args={[s.bodyWidth * 0.9, 0.06, 0.3]} />
            <meshStandardMaterial color="#111" />
          </mesh>
          <mesh position={[-s.bodyWidth * 0.35, -0.35, 0]}>
            <boxGeometry args={[0.06, 0.35, 0.06]} />
            <meshStandardMaterial color="#111" />
          </mesh>
          <mesh position={[s.bodyWidth * 0.35, -0.35, 0]}>
            <boxGeometry args={[0.06, 0.35, 0.06]} />
            <meshStandardMaterial color="#111" />
          </mesh>
          <mesh position={[0, -s.bodyHeight - 0.35, -s.bodyLength / 2 - 0.05]}>
            <coneGeometry args={[0.12, 0.4, 8]} />
            <meshStandardMaterial
              color={profile.accentColor}
              emissive={profile.accentColor}
              emissiveIntensity={2}
            />
          </mesh>
        </group>
      )}

      {/* wheels */}
      {wheelPositions.map((pos, i) => (
        <mesh
          key={i}
          ref={(el) => {
            wheelRefs.current[i] = el;
          }}
          position={pos}
          rotation={[0, 0, Math.PI / 2]}
          castShadow
        >
          <cylinderGeometry args={[s.wheelRadius, s.wheelRadius, 0.35, 20]} />
          <meshStandardMaterial color={wheelColor} metalness={wheelMetalness} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
});

CarModel.displayName = 'CarModel';
export default CarModel;
