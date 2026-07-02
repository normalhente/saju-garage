export type Element = '목' | '화' | '토' | '금' | '수';

export const ELEMENTS: Element[] = ['목', '화', '토', '금', '수'];

export const STEM_NAMES = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'] as const;
export const BRANCH_NAMES = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'] as const;
export const BRANCH_ANIMALS = ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지'] as const;
export const BRANCH_TIME_RANGE = [
  '23:00~01:00', '01:00~03:00', '03:00~05:00', '05:00~07:00',
  '07:00~09:00', '09:00~11:00', '11:00~13:00', '13:00~15:00',
  '15:00~17:00', '17:00~19:00', '19:00~21:00', '21:00~23:00',
] as const;

export const STEM_ELEMENT: Element[] = ['목', '목', '화', '화', '토', '토', '금', '금', '수', '수'];
export const BRANCH_ELEMENT: Element[] = ['수', '토', '목', '목', '토', '화', '화', '토', '금', '금', '토', '수'];

// index % 2 === 0 -> 양(true), odd -> 음(false)
export const stemYinYang = (i: number) => i % 2 === 0;
export const branchYinYang = (i: number) => i % 2 === 0;

export const elementIndex = (e: Element) => ELEMENTS.indexOf(e);

// 목->화->토->금->수->목 (생) 순환
export const generates = (e: Element): Element => ELEMENTS[(elementIndex(e) + 1) % 5];
// 목->토->수->화->금->목 (극) 순환
export const overcomes = (e: Element): Element => ELEMENTS[(elementIndex(e) + 2) % 5];

export const combinedIndex = (stemIndex: number, branchIndex: number): number => {
  for (let i = 0; i < 60; i++) {
    if (i % 10 === stemIndex && i % 12 === branchIndex) return i;
  }
  throw new Error('invalid stem/branch combination');
};

export const pillarName = (stemIndex: number, branchIndex: number) =>
  `${STEM_NAMES[stemIndex]}${BRANCH_NAMES[branchIndex]}`;

export type TenGod =
  | '비견' | '겁재'
  | '식신' | '상관'
  | '편재' | '정재'
  | '편관' | '정관'
  | '편인' | '정인';
