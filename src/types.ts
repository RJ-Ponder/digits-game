export interface TargetAndSolution {
  target: number;
  solution: string[];
}

export interface OperationGroup {
  sign: string | null;
  function: ((a: number, b: number) => number) | null;
  result: number | null;
}

export interface GameInfo {
  id: string;
  stars: number;
}
