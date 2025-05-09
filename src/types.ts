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

export interface DailyPuzzle {
  id: number;
  numberSet: number[];
  target: number;
  solution: string[];
  stars: number;
  solutionShown: boolean;
}

export interface DailyPuzzleSet {
  seed: string;
  puzzles: DailyPuzzle[];
  currentPuzzleIndex: number;
}

export interface GameStatistics {
  daysPlayed: number;
  currentStreak: number;
  bestStreak: number;
  perfectDays: number;
  totalStars: number;
  lastPlayedDate: string;
  dailyStats: Record<string, DayStats>;
}

export interface DayStats {
  date: string;
  puzzleStars: number[];
  totalStars: number;
  isPerfect: boolean;
}
