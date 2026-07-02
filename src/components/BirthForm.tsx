import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import type { BirthInput, Gender } from '../lib/saju';
import { hourBranchIndex } from '../lib/saju';
import { BRANCH_NAMES, BRANCH_ANIMALS, BRANCH_TIME_RANGE } from '../lib/constants';

interface Props {
  onSubmit: (input: BirthInput) => void;
}

export default function BirthForm({ onSubmit }: Props) {
  const [year, setYear] = useState(1995);
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);
  const [time, setTime] = useState('12:00');
  const [unknownHour, setUnknownHour] = useState(false);
  const [gender, setGender] = useState<Gender>('female');

  const hour = Number(time.split(':')[0] ?? 12);
  const branchIndex = hourBranchIndex(hour);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({
      year,
      month,
      day,
      hour: unknownHour ? null : hour,
      gender,
    });
  };

  return (
    <motion.form
      className="birth-form"
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.4 }}
    >
      <h1>사주 개러지</h1>
      <p className="subtitle">생년월일시를 입력하면 당신의 사주를 자동차로 조립해 드립니다</p>

      <div className="field-row">
        <label>
          년
          <input
            type="number"
            value={year}
            min={1900}
            max={2100}
            onChange={(e) => setYear(Number(e.target.value))}
          />
        </label>
        <label>
          월
          <input
            type="number"
            value={month}
            min={1}
            max={12}
            onChange={(e) => setMonth(Number(e.target.value))}
          />
        </label>
        <label>
          일
          <input
            type="number"
            value={day}
            min={1}
            max={31}
            onChange={(e) => setDay(Number(e.target.value))}
          />
        </label>
      </div>

      <div className="time-field">
        <div className="time-field-header">
          <span>태어난 시각</span>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={unknownHour}
              onChange={(e) => setUnknownHour(e.target.checked)}
            />
            모름
          </label>
        </div>
        <input
          type="time"
          className="time-input"
          value={time}
          disabled={unknownHour}
          onChange={(e) => setTime(e.target.value)}
        />
        {!unknownHour && (
          <motion.p
            key={branchIndex}
            className="time-hint"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
          >
            🕐 {BRANCH_NAMES[branchIndex]}시 ({BRANCH_ANIMALS[branchIndex]}띠 시간) · {BRANCH_TIME_RANGE[branchIndex]}
          </motion.p>
        )}
        {unknownHour && <p className="time-hint muted">시주 없이 년·월·일주로만 풀이해요</p>}
      </div>

      <div className="field-row gender-row">
        <span>성별 (대운 방향 계산용)</span>
        <div className="gender-toggle">
          <button
            type="button"
            className={gender === 'female' ? 'active' : ''}
            onClick={() => setGender('female')}
          >
            여성
          </button>
          <button
            type="button"
            className={gender === 'male' ? 'active' : ''}
            onClick={() => setGender('male')}
          >
            남성
          </button>
        </div>
      </div>

      <button type="submit" className="submit-btn">
        내 차 조립하기 →
      </button>

      <p className="disclaimer">
        * 절기(입춘) 경계 미반영, 대운 시작 나이는 흐름 참고용 근사치입니다. 양력 기준.
      </p>
    </motion.form>
  );
}
