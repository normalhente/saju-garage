import type { Element, TenGod } from './constants';
import type { SajuResult } from './saju';

export type CarPart =
  | 'racingStripe'
  | 'spoilerFlame'
  | 'chromeWheels'
  | 'lightBar'
  | 'sunroofGlow';

export interface ElementCarProfile {
  label: string;
  bodyColor: string;
  accentColor: string;
  silhouette: 'sports' | 'suv' | 'coupe' | 'sedan-fluid' | 'sedan-sharp';
  description: string;
}

export const ELEMENT_CAR_PROFILE: Record<Element, ElementCarProfile> = {
  목: {
    label: '그린 스포츠 세단',
    bodyColor: '#2f8f4e',
    accentColor: '#bff2c8',
    silhouette: 'sedan-sharp',
    description: '곧게 뻗어나가는 성장의 기운, 날렵한 실루엣',
  },
  화: {
    label: '레드 스포츠카',
    bodyColor: '#d7263d',
    accentColor: '#ffb703',
    silhouette: 'sports',
    description: '터질 듯한 열정, 고출력 엔진',
  },
  토: {
    label: '베이지 SUV',
    bodyColor: '#a9744f',
    accentColor: '#e7d7c1',
    silhouette: 'suv',
    description: '흔들림 없는 안정감, 묵직한 존재감',
  },
  금: {
    label: '실버 럭셔리 쿠페',
    bodyColor: '#c7ccd1',
    accentColor: '#3a3f47',
    silhouette: 'coupe',
    description: '정교하게 벼려진 마감, 단단한 결단력',
  },
  수: {
    label: '블루 세단',
    bodyColor: '#1d4e89',
    accentColor: '#7fd8ff',
    silhouette: 'sedan-fluid',
    description: '막힘없이 흐르는 유연한 지혜',
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

export const PART_LABEL: Record<CarPart, string> = {
  racingStripe: '레이싱 스트라이프 (비견/겁재)',
  spoilerFlame: '스포일러 + 배기 이펙트 (식신/상관)',
  chromeWheels: '크롬 휠 (정재/편재)',
  lightBar: '바디킷 + 라이트바 (정관/편관)',
  sunroofGlow: '선루프 글로우 (정인/편인)',
};

export interface AccelerationProfile {
  label: string;
  description: string;
  delayMs: number;
  durationMs: number;
}

export const ACCELERATION_PROFILE: Record<SajuResult['strength'], AccelerationProfile> = {
  신강: {
    label: '즉각 반응 고출력',
    description: '페달을 밟는 순간 부우웅! 망설임 없이 튀어나가는 가속감',
    delayMs: 0,
    durationMs: 900,
  },
  신약: {
    label: '터보랙 뒤 폭발',
    description: '잠시 숨을 고른 뒤, 서서히 힘을 모아 터지는 가속감',
    delayMs: 500,
    durationMs: 1400,
  },
};

export const ROAD_TYPE_LABEL: Record<SajuResult['daeUn'][number]['roadType'], string> = {
  highway: '직선 고속도로 (순탄)',
  slope: '오르막·내리막 (변화)',
  curve: '급커브 (도전)',
  tunnel: '터널 구간 (고비)',
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
