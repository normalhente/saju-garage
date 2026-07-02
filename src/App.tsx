import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import './App.css';
import BirthForm from './components/BirthForm';
import LoadingAssembly from './components/LoadingAssembly';
import CarStage from './components/CarStage';
import AccelerationFX from './components/AccelerationFX';
import SajuSummary from './components/SajuSummary';
import FortuneRoad from './components/FortuneRoad';
import { calculateSaju, type BirthInput, type SajuResult } from './lib/saju';
import { buildCarSpec } from './lib/mapping';

type Screen = 'input' | 'loading' | 'result';

function App() {
  const [screen, setScreen] = useState<Screen>('input');
  const [saju, setSaju] = useState<SajuResult | null>(null);
  const [isAccelerating, setIsAccelerating] = useState(false);

  const carSpec = useMemo(() => (saju ? buildCarSpec(saju) : null), [saju]);

  const handleSubmit = (input: BirthInput) => {
    setSaju(calculateSaju(input));
    setScreen('loading');
  };

  return (
    <div className="app-root" style={carSpec ? ({ '--accent': carSpec.profile.accentColor } as React.CSSProperties) : undefined}>
      <AnimatePresence mode="wait">
        {screen === 'input' && <BirthForm key="input" onSubmit={handleSubmit} />}

        {screen === 'loading' && (
          <LoadingAssembly key="loading" onDone={() => setScreen('result')} />
        )}

        {screen === 'result' && saju && carSpec && (
          <motion.div
            key="result"
            className="result-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="car-stage">
              <CarStage
                profile={carSpec.profile}
                parts={carSpec.parts}
                acceleration={carSpec.acceleration}
                isAccelerating={isAccelerating}
                onAccelerationComplete={() => setIsAccelerating(false)}
              />
              <AccelerationFX
                isAccelerating={isAccelerating}
                onFire={() => setIsAccelerating(true)}
                label={carSpec.acceleration.label}
                description={carSpec.acceleration.description}
                accentColor={carSpec.profile.accentColor}
              />
            </div>

            <SajuSummary saju={saju} carSpec={carSpec} />
            <FortuneRoad daeUn={saju.daeUn} accentColor={carSpec.profile.accentColor} />

            <button className="restart-btn" onClick={() => setScreen('input')}>
              다시 만들기
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
