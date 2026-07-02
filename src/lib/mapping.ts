import type { Element, TenGod } from './constants';
import type { SajuResult } from './saju';

export type CarPart =
  | 'racingStripe'
  | 'spoilerFlame'
  | 'chromeWheels'
  | 'lightBar'
  | 'sunroofGlow';

export interface ElementCarProfile {
  emoji: string;
  label: string;
  tagline: string;
  bodyColor: string;
  accentColor: string;
  glassColor: string;
  silhouette: 'sports' | 'suv' | 'coupe' | 'sedan-fluid' | 'sedan-sharp';
  description: string;
}

export const ELEMENT_CAR_PROFILE: Record<Element, ElementCarProfile> = {
  목: {
    emoji: '🌳',
    label: '그린 스포츠 세단',
    tagline: '멈추지 않고 뻗어나가는 성장형 드라이버',
    bodyColor: '#2f8f4e',
    accentColor: '#bff2c8',
    glassColor: '#e8fff0',
    silhouette: 'sedan-sharp',
    description: '직진이 답! 나무처럼 곧게 자라나며 거침없이 뻗어나가는 타입',
  },
  화: {
    emoji: '🔥',
    label: '레드 스포츠카',
    tagline: '보는 사람 심장까지 뛰게 만드는 열정 그 자체',
    bodyColor: '#d7263d',
    accentColor: '#ffb703',
    glassColor: '#2b1015',
    silhouette: 'sports',
    description: '액셀은 항상 끝까지! 망설임 없이 질주하는 타고난 스피드광',
  },
  토: {
    emoji: '⛰️',
    label: '베이지 SUV',
    tagline: '흔들림 없는 존재감, 어디서든 든든한 뒷배경',
    bodyColor: '#a9744f',
    accentColor: '#e7d7c1',
    glassColor: '#fff6ea',
    silhouette: 'suv',
    description: '급할 거 없다, 내 페이스대로. 묵직하게 자리를 지키는 타입',
  },
  금: {
    emoji: '⚙️',
    label: '실버 럭셔리 쿠페',
    tagline: '디테일 하나까지 완벽하게 벼려낸 결단력',
    bodyColor: '#c7ccd1',
    accentColor: '#3a3f47',
    glassColor: '#1c2026',
    silhouette: 'coupe',
    description: '한번 정하면 칼같이! 정교하고 날카롭게 승부를 보는 타입',
  },
  수: {
    emoji: '💧',
    label: '블루 세단',
    tagline: '막히면 돌아가면 그만, 어떤 길이든 유연하게',
    bodyColor: '#1d4e89',
    accentColor: '#7fd8ff',
    glassColor: '#e7f8ff',
    silhouette: 'sedan-fluid',
    description: '흐르는 물처럼 상황 따라 자유자재, 눈치 빠른 전략가 타입',
  },
};

export const TEN_GOD_PART: Record<TenGod, CarPart> = {
  비견: 'racingStripe',
  겁재: 'racingStripe',
  식신: 'spoilerFlame',
  상관: 'spoilerFlame',
  정재: 'chromeWheels',
  편재: 'chromeWheels',
  정관: 'lightBar',
  편관: 'lightBar',
  정인: 'sunroofGlow',
  편인: 'sunroofGlow',
};

export interface PartFlavor {
  emoji: string;
  title: string;
  source: string;
  blurb: string;
}

export const PART_FLAVOR: Record<CarPart, PartFlavor> = {
  racingStripe: {
    emoji: '🏎️',
    title: '레이싱 스트라이프',
    source: '비견 · 겁재',
    blurb: '내 스타일대로! 남 눈치 안 보는 마이웨이 기질',
  },
  spoilerFlame: {
    emoji: '💥',
    title: '스포일러 + 배기 플레임',
    source: '식신 · 상관',
    blurb: '끼와 표현력 폭발, 어디서든 시선을 강탈하는 기질',
  },
  chromeWheels: {
    emoji: '💰',
    title: '크롬 휠',
    source: '정재 · 편재',
    blurb: '실속과 자산관리 만렙, 반짝이는 걸 알아보는 기질',
  },
  lightBar: {
    emoji: '🚨',
    title: '바디킷 + 라이트바',
    source: '정관 · 편관',
    blurb: '규칙과 책임감 그 자체, 카리스마 넘치는 리더 기질',
  },
  sunroofGlow: {
    emoji: '📖',
    title: '선루프 글로우',
    source: '정인 · 편인',
    blurb: '생각이 많고 배움을 즐기는, 은은히 빛나는 기질',
  },
};

export interface AccelerationProfile {
  emoji: string;
  label: string;
  description: string;
  delayMs: number;
  durationMs: number;
}

export const ACCELERATION_PROFILE: Record<SajuResult['strength'], AccelerationProfile> = {
  신강: {
    emoji: '⚡',
    label: '즉각 반응 고출력',
    description: '페달 밟자마자 부우웅! 망설임 없이 튀어나가는 스타일',
    delayMs: 0,
    durationMs: 700,
  },
  신약: {
    emoji: '🌀',
    label: '터보랙 뒤 폭발',
    description: '처음엔 조용히, 그러다 한순간 확 터지는 스타일',
    delayMs: 500,
    durationMs: 1100,
  },
};

export interface RoadFlavor {
  emoji: string;
  label: string;
  blurb: string;
}

export const ROAD_TYPE_FLAVOR: Record<SajuResult['daeUn'][number]['roadType'], RoadFlavor> = {
  highway: { emoji: '🛣️', label: '직선 고속도로', blurb: '탄탄대로! 순풍에 돛단 듯 시원하게 뻗어나가는 구간' },
  slope: { emoji: '🌄', label: '오르막·내리막', blurb: '오르막과 내리막이 교차하는 변화무쌍한 구간' },
  curve: { emoji: '🌀', label: '급커브', blurb: '급커브 연속! 정신 바짝 차려야 하는 도전 구간' },
  tunnel: { emoji: '🕳️', label: '터널', blurb: '앞이 잘 안 보이는 터널 구간, 그래도 끝은 있다' },
};

export interface CarSpec {
  profile: ElementCarProfile;
  acceleration: AccelerationProfile;
  parts: CarPart[];
}

export function buildCarSpec(saju: SajuResult): CarSpec {
  const profile = ELEMENT_CAR_PROFILE[saju.dominantElement];
  const acceleration = ACCELERATION_PROFILE[saju.strength];
  const parts = [...new Set(saju.topTenGods.map((g) => TEN_GOD_PART[g]))];
  return { profile, acceleration, parts };
}
