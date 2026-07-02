import type { SajuResult, Pillar } from './saju';
import { BRANCH_NAMES, STEM_NAMES, pillarName } from './constants';

// 대중적으로 널리 쓰이는 신살 위주의 간이 판정.
// (절기·복잡한 예외는 미반영. 결과 화면에 '간이 판정' 고지.)

export type SinsalKey =
  | '도화살' | '역마살' | '화개살' | '양인살'
  | '천을귀인' | '문창귀인' | '백호살' | '괴강살';

export interface SinsalHit {
  key: SinsalKey;
  evidence: string; // 어느 자리/간지에서 잡혔는지
}

export interface SinsalEquip {
  emoji: string;
  equip: string; // 자동차 특수 장비명
  trait: string; // 성향 한 줄
}

export const SINSAL_EQUIP: Record<SinsalKey, SinsalEquip> = {
  도화살: { emoji: '💗', equip: '네온 언더글로우 키트', trait: '어디서든 시선을 끄는 매력·인기 오라' },
  역마살: { emoji: '🧳', equip: '롱레인지 투어링 터보', trait: '한곳에 머물기보다 이동·변화·해외가 어울리는 기질' },
  화개살: { emoji: '🎨', equip: '아티스트 커스텀 도장', trait: '예술·종교·몰입, 독창적이고 깊이 파고드는 기질' },
  양인살: { emoji: '🗡️', equip: '레이싱 슬릭 & 공격형 튜닝', trait: '강한 추진력과 승부욕, 밀어붙이는 힘' },
  천을귀인: { emoji: '🛡️', equip: '가디언 어시스트 시스템', trait: '위기의 순간 돕는 귀인이 따르는 최고의 길신' },
  문창귀인: { emoji: '🧠', equip: '헤드업 디스플레이 · 지능형 내비', trait: '학습·표현·시험운, 총명함이 빛나는 기질' },
  백호살: { emoji: '🚨', equip: '롤케이지 & 경고등 패키지', trait: '강렬하고 극적인 에너지, 안전벨트 꽉 매야 하는 스릴' },
  괴강살: { emoji: '🏁', equip: '리미티드 에디션 배지', trait: '카리스마와 리더십, 극단적으로 강한 존재감' },
};

const TRIADS = [
  [2, 6, 10], // 인오술 (火)
  [5, 9, 1], // 사유축 (金)
  [8, 0, 4], // 신자진 (水)
  [11, 3, 7], // 해묘미 (木)
];
const DOHWA = [3, 6, 9, 0];
const YEOKMA = [8, 11, 2, 5];
const HWAGAE = [10, 1, 4, 7];

function triadIndex(branch: number): number {
  return TRIADS.findIndex((t) => t.includes(branch));
}

// 일간별 지지 신살 (양인/천을/문창)
const YANGIN: Record<number, number> = { 0: 3, 2: 6, 4: 6, 6: 9, 8: 0 };
const CHEONEUL: Record<number, number[]> = {
  0: [1, 7], 4: [1, 7], 6: [1, 7],
  1: [0, 8], 5: [0, 8],
  2: [11, 9], 3: [11, 9],
  7: [2, 6],
  8: [5, 3], 9: [5, 3],
};
const MUNCHANG: Record<number, number> = { 0: 5, 1: 6, 2: 8, 3: 9, 4: 8, 5: 9, 6: 11, 7: 0, 8: 2, 9: 3 };

// 특정 간지 (stemIndex, branchIndex)
const BAEKHO: [number, number][] = [[0, 4], [1, 7], [2, 10], [3, 1], [4, 4], [8, 10], [9, 1]];
const GOEGANG: [number, number][] = [[6, 4], [6, 10], [8, 4], [4, 10]];

interface LabeledPillar {
  label: string;
  pillar: Pillar;
}

export function detectSinsal(saju: SajuResult): SinsalHit[] {
  const pillars: LabeledPillar[] = [
    { label: '년지', pillar: saju.year },
    { label: '월지', pillar: saju.month },
    { label: '일지', pillar: saju.day },
    ...(saju.hour ? [{ label: '시지', pillar: saju.hour }] : []),
  ];
  const branches = pillars.map((p) => p.pillar.branchIndex);
  const dayStem = saju.day.stemIndex;

  const hits: SinsalHit[] = [];
  const seen = new Set<SinsalKey>();
  const add = (key: SinsalKey, evidence: string) => {
    if (seen.has(key)) return;
    seen.add(key);
    hits.push({ key, evidence });
  };

  const branchLabel = (target: number): string | null => {
    const idx = branches.indexOf(target);
    if (idx < 0) return null;
    return `${pillars[idx].label}에 ${BRANCH_NAMES[target]}`;
  };

  // 삼합 기준 신살 (일지 → 없으면 연지 기준)
  for (const ref of [saju.day.branchIndex, saju.year.branchIndex]) {
    const gi = triadIndex(ref);
    if (gi < 0) continue;
    const checks: [SinsalKey, number][] = [
      ['도화살', DOHWA[gi]],
      ['역마살', YEOKMA[gi]],
      ['화개살', HWAGAE[gi]],
    ];
    for (const [key, target] of checks) {
      const label = branchLabel(target);
      if (label) add(key, label);
    }
  }

  // 일간 기준 지지 신살
  if (YANGIN[dayStem] !== undefined) {
    const label = branchLabel(YANGIN[dayStem]);
    if (label) add('양인살', `일간 ${STEM_NAMES[dayStem]} · ${label}`);
  }
  if (CHEONEUL[dayStem]) {
    for (const t of CHEONEUL[dayStem]) {
      const label = branchLabel(t);
      if (label) add('천을귀인', `일간 ${STEM_NAMES[dayStem]} · ${label}`);
    }
  }
  {
    const label = branchLabel(MUNCHANG[dayStem]);
    if (label) add('문창귀인', `일간 ${STEM_NAMES[dayStem]} · ${label}`);
  }

  // 특정 간지 (기둥 전체)
  for (const p of pillars) {
    const si = p.pillar.stemIndex;
    const bi = p.pillar.branchIndex;
    if (BAEKHO.some(([s, b]) => s === si && b === bi)) {
      add('백호살', `${p.label.replace('지', '주')} ${pillarName(si, bi)}`);
    }
    if (GOEGANG.some(([s, b]) => s === si && b === bi)) {
      add('괴강살', `${p.label.replace('지', '주')} ${pillarName(si, bi)}`);
    }
  }

  return hits;
}
