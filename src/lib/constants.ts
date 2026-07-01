export type Element = '목' | '화' | '토' | '금' | '수';

export const ELEMENTS: Element[] = ['목', '화', '토', '금', '수'];

export const STEM_NAMES = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'] as const;
export const BRANCH_NAMES = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'] as const;

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
