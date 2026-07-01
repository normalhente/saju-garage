import {
  ELEMENTS,
  STEM_ELEMENT,
  BRANCH_ELEMENT,
  stemYinYang,
  branchYinYang,
  generates,
  overcomes,
  combinedIndex,
  type Element,
  type TenGod,
} from './constants';

export interface Pillar {
  stemIndex: number;
  branchIndex: number;
}

export type Gender = 'male' | 'female';

export interface BirthInput {
  year: number;
  month: number; // 1-12
  day: number; // 1-31
  hour: number | null; // 0-23, null이면 시간 모름
  gender: Gender;
}

export interface RoadSegment {
  pillar: Pillar;
  ageStart: number;
  ageEnd: number;
  roadType: 'highway' | 'slope' | 'curve' | 'tunnel';
  relation: TenGod;
}

export interface SajuResult {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  hour: Pillar | null;
  elementCounts: Record<Element, number>;
  dominantElement: Element;
  dayMasterElement: Element;
  dayMasterYinYang: boolean;
  strength: '신강' | '신약';
  strengthScore: number;
  tenGods: { year: TenGod; month: TenGod; hour: TenGod | null };
  topTenGods: TenGod[];
  daeUn: RoadSegment[];
}

// ---- 연주 계산: 1984년 = 갑자년(index 0) 기준 60갑자 순환 ----
function yearPillar(year: number): Pillar {
  const idx = (((year - 1984) % 60) + 60) % 60;
  return { stemIndex: idx % 10, branchIndex: idx % 12 };
}

// ---- 일주 계산: 1900-01-31 = 갑진일(combinedIndex 40) 기준 ----
const DAY_ANCHOR_UTC = Date.UTC(1900, 0, 31);
const DAY_ANCHOR_INDEX = 40; // 갑진 = stem0 % 10, branch4 % 12 -> combinedIndex 40

function dayPillar(year: number, month: number, day: number): Pillar {
  const target = Date.UTC(year, month - 1, day);
  const diffDays = Math.round((target - DAY_ANCHOR_UTC) / 86400000);
  const idx = (((DAY_ANCHOR_INDEX + diffDays) % 60) + 60) % 60;
  return { stemIndex: idx % 10, branchIndex: idx % 12 };
}

// ---- 월주 계산: 오호둔법 (절기 미반영, 달력 월 기준 근사) ----
function monthPillar(yearStemIndex: number, month: number): Pillar {
  const branchIndex = month % 12; // 1월->1(축) ... 12월->0(자), 2월->2(인)
  const group = yearStemIndex % 5;
  const inYueStem = [2, 4, 6, 8, 0][group]; // 인월(월지=2) 기준 시작 천간
  const offset = ((branchIndex - 2) % 12 + 12) % 12;
  const stemIndex = (inYueStem + offset) % 10;
  return { stemIndex, branchIndex };
}

// ---- 시주 계산: 오둔법 + 2시간 단위 지지 ----
function hourBranchIndex(hour: number): number {
  // 23:00-00:59 -> 자(0), 01:00-02:59 -> 축(1) ...
  return Math.floor((((hour + 1) % 24)) / 2);
}

function hourPillar(dayStemIndex: number, hour: number): Pillar {
  const branchIndex = hourBranchIndex(hour);
  const group = dayStemIndex % 5;
  const ziShiStem = [0, 2, 4, 6, 8][group]; // 자시(지지=0) 기준 시작 천간
  const stemIndex = (ziShiStem + branchIndex) % 10;
  return { stemIndex, branchIndex };
}

function tenGodOf(dayStemIndex: number, elementVal: Element, yinYangVal: boolean): TenGod {
  const dayElement = STEM_ELEMENT[dayStemIndex];
  const dayYinYang = stemYinYang(dayStemIndex);
  const same = dayYinYang === yinYangVal;

  if (elementVal === dayElement) return same ? '비견' : '겁재';
  if (generates(dayElement) === elementVal) return same ? '식신' : '상관';
  if (overcomes(dayElement) === elementVal) return same ? '편재' : '정재';
  if (overcomes(elementVal) === dayElement) return same ? '편관' : '정관';
  // generates(elementVal) === dayElement
  return same ? '편인' : '정인';
}

function buildDaeUn(
  monthP: Pillar,
  yearP: Pillar,
  gender: Gender,
  dayMasterElement: Element,
): RoadSegment[] {
  const yearIsYang = stemYinYang(yearP.stemIndex);
  const forward = (yearIsYang && gender === 'male') || (!yearIsYang && gender === 'female');
  const direction = forward ? 1 : -1;
  const startIdx = combinedIndex(monthP.stemIndex, monthP.branchIndex);

  const segments: RoadSegment[] = [];
  for (let k = 0; k < 8; k++) {
    const idx = (((startIdx + direction * (k + 1)) % 60) + 60) % 60;
    const stemIndex = idx % 10;
    const branchIndex = idx % 12;
    const element = STEM_ELEMENT[stemIndex];
    // relation(십신)은 일간이 필요하므로 calculateSaju에서 채워 넣는다
    segments.push({
      pillar: { stemIndex, branchIndex },
      ageStart: k * 10,
      ageEnd: k * 10 + 10,
      roadType: roadTypeFor(dayMasterElement, element),
      relation: '비견',
    });
  }
  return segments;
}

function roadTypeFor(dayMasterElement: Element, other: Element): RoadSegment['roadType'] {
  if (other === dayMasterElement || generates(other) === dayMasterElement) return 'highway'; // 비겁/인성
  if (generates(dayMasterElement) === other) return 'slope'; // 식상 (설기, 변화)
  if (overcomes(dayMasterElement) === other) return 'curve'; // 재성 (도전)
  return 'tunnel'; // 관성 (나를 극함, 험난)
}

export function calculateSaju(input: BirthInput): SajuResult {
  const yearP = yearPillar(input.year);
  const dayP = dayPillar(input.year, input.month, input.day);
  const monthP = monthPillar(yearP.stemIndex, input.month);
  const hourP = input.hour === null ? null : hourPillar(dayP.stemIndex, input.hour);

  const dayMasterElement = STEM_ELEMENT[dayP.stemIndex];
  const dayMasterYinYang = stemYinYang(dayP.stemIndex);

  const elementCounts: Record<Element, number> = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  const pillars = [yearP, monthP, dayP, ...(hourP ? [hourP] : [])];
  for (const p of pillars) {
    elementCounts[STEM_ELEMENT[p.stemIndex]]++;
    elementCounts[BRANCH_ELEMENT[p.branchIndex]]++;
  }

  const dominantElement = ELEMENTS.reduce((a, b) =>
    elementCounts[b] > elementCounts[a] ? b : a,
  );

  // 신강/신약: 일간 본인을 제외한 나머지 글자들로 판정
  let support = 0;
  let pressure = 0;
  for (const p of pillars) {
    // 일주의 천간(일간 자신)은 제외, 일주의 지지는 포함
    const stemEl = STEM_ELEMENT[p.stemIndex];
    const branchEl = BRANCH_ELEMENT[p.branchIndex];
    const isDayStemItself = p === dayP;
    const candidates: Element[] = isDayStemItself ? [branchEl] : [stemEl, branchEl];
    for (const el of candidates) {
      if (el === dayMasterElement || generates(el) === dayMasterElement) support++;
      else pressure++;
    }
  }
  const strengthScore = support - pressure;
  const strength: SajuResult['strength'] = strengthScore >= 0 ? '신강' : '신약';

  const tenGods = {
    year: tenGodOf(dayP.stemIndex, STEM_ELEMENT[yearP.stemIndex], stemYinYang(yearP.stemIndex)),
    month: tenGodOf(dayP.stemIndex, STEM_ELEMENT[monthP.stemIndex], stemYinYang(monthP.stemIndex)),
    hour: hourP
      ? tenGodOf(dayP.stemIndex, STEM_ELEMENT[hourP.stemIndex], stemYinYang(hourP.stemIndex))
      : null,
  };

  const tenGodCounts = new Map<TenGod, number>();
  for (const g of [tenGods.year, tenGods.month, tenGods.hour]) {
    if (!g) continue;
    tenGodCounts.set(g, (tenGodCounts.get(g) ?? 0) + 1);
  }
  const topTenGods = [...tenGodCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([g]) => g);

  const daeUn = buildDaeUn(monthP, yearP, input.gender, dayMasterElement).map((seg) => ({
    ...seg,
    relation: tenGodOf(dayP.stemIndex, STEM_ELEMENT[seg.pillar.stemIndex], stemYinYang(seg.pillar.stemIndex)),
  }));

  return {
    year: yearP,
    month: monthP,
    day: dayP,
    hour: hourP,
    elementCounts,
    dominantElement,
    dayMasterElement,
    dayMasterYinYang,
    strength,
    strengthScore,
    tenGods,
    topTenGods,
    daeUn,
  };
}

export function currentYearGanji(): Pillar {
  return yearPillar(new Date().getFullYear());
}

export { branchYinYang };
