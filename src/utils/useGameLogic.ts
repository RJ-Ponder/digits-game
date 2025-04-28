import { useEffect, useState } from 'react';
import {
  generateDailyPuzzles,
  getDailyPuzzleSeed,
  saveDataToLocalStorage,
  loadDataFromLocalStorage,
} from './helpers';
import { DailyPuzzle, DailyPuzzleSet, GameStatistics, DayStats } from '../types';

const DAILY_PUZZLE_SET = 'dps';
const STATISTICS = 'stats';

// Helper function to get today's date in YYYY-MM-DD format
function getTodayString() {
  const date = new Date();
  const easternDate = new Date(date.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  return easternDate.toISOString().split('T')[0];
}

// Helper function to calculate streak
function calculateStreak(stats: GameStatistics): number {
  const today = getTodayString();
  const dates = Object.keys(stats.dailyStats).sort();
  if (dates.length === 0) return 0;
  
  const lastDate = dates[dates.length - 1];
  if (lastDate !== today && lastDate !== getTodayString()) return 0;
  
  let streak = 1;
  for (let i = dates.length - 2; i >= 0; i--) {
    const curr = new Date(dates[i + 1]);
    const prev = new Date(dates[i]);
    const diffDays = Math.floor((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays !== 1) break;
    streak++;
  }
  return streak;
}

type OperationGroup = {
  sign: string | null;
  function: ((a: number, b: number) => number) | null;
  result: number | null;
};

function useGameLogic() {
  const [puzzleSet, setPuzzleSet] = useState<DailyPuzzleSet>(() => {
    const loaded = loadDataFromLocalStorage<DailyPuzzleSet>(DAILY_PUZZLE_SET);
    const currentSeed = getDailyPuzzleSeed();
    
    if (!loaded || loaded.seed !== currentSeed) {
      const newPuzzles = generateDailyPuzzles();
      const newSet = {
        seed: currentSeed,
        puzzles: newPuzzles,
        currentPuzzleIndex: 0
      };
      saveDataToLocalStorage(DAILY_PUZZLE_SET, newSet);
      return newSet;
    }
    
    return loaded;
  });

  const currentPuzzle = puzzleSet.puzzles[puzzleSet.currentPuzzleIndex];

  const [numberSetHistory, setNumberSetHistory] = useState<(number | null)[][]>([currentPuzzle.numberSet]);
  const [currentMove, setCurrentMove] = useState<number>(0);
  const [firstOperandNumber, setFirstOperandNumber] = useState<number | null>(null);
  const [firstOperandPosition, setFirstOperandPosition] = useState<number | null>(null);
  const [operationGroup, setOperationGroup] = useState<OperationGroup>({ sign: null, function: null, result: null });
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const [selectedOperator, setSelectedOperator] = useState<string | null>(null);
  const [earnedStars, setEarnedStars] = useState<number>(0);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [positionHistory, setPositionHistory] = useState<(number | null)[]>([]);

  const [gamesPlayed, setGamesPlayed] = useState<number>(0);
  const [zeroStarGames, setZeroStarGames] = useState<number>(0);
  const [oneStarGames, setOneStarGames] = useState<number>(0);
  const [twoStarGames, setTwoStarGames] = useState<number>(0);
  const [threeStarGames, setThreeStarGames] = useState<number>(0);

  const [showSolution, setShowSolution] = useState<boolean>(() => currentPuzzle.solutionShown);
  const [canEarnMoreStars, setCanEarnMoreStars] = useState<boolean>(() => !currentPuzzle.solutionShown);
  const [showCollectModal, setShowCollectModal] = useState<boolean>(false);
  const [showNewGameWarning, setShowNewGameWarning] = useState<boolean>(false);
  const [showResetWarning, setShowResetWarning] = useState<boolean>(false);
  const [showSolutionWarning, setShowSolutionWarning] = useState<boolean>(false);

  const [shakePosition, setShakePosition] = useState<number | null>(null);
  const [showStatistics, setShowStatistics] = useState<boolean>(false);

  const [statistics, setStatistics] = useState<GameStatistics>(() => {
    const loaded = loadDataFromLocalStorage<GameStatistics>(STATISTICS) || {
      daysPlayed: 0,
      currentStreak: 0,
      bestStreak: 0,
      perfectDays: 0,
      totalStars: 0,
      lastPlayedDate: '',
      dailyStats: {}
    };
    return loaded;
  });

  function resetBoard(isUndo = false) {
    setOperationGroup({ sign: null, function: null, result: null });
    setSelectedOperator(null);
    if (!isUndo) {
      setSelectedPosition(null);
      setFirstOperandNumber(null);
      setFirstOperandPosition(null);
    }
  }

  function handleNumberClick(position: number) {
    const clickedNumber = numberSetHistory[currentMove][position];
    
    // Early return if clicking on empty position
    if (clickedNumber === null) return;

    // If clicking the same number, unselect it and reset
    if (firstOperandPosition === position) {
      resetBoard();
      return;
    }

    // If an operator is selected and we have a first operand, perform the operation
    if (operationGroup.function !== null && firstOperandNumber !== null) {
      performOperation(clickedNumber, position);
      return;
    }

    // Otherwise, this becomes the new first operand
    setFirstOperandNumber(clickedNumber);
    setFirstOperandPosition(position);
    setSelectedPosition(position);
  }

  function handleOperatorClick(fn: (a: number, b: number) => number, sign: string) {
    if (firstOperandNumber === null) {
      resetBoard();
    } else {
      setOperationGroup({ ...operationGroup, function: fn, sign });
      setSelectedOperator(sign);
    }
  }

  function performOperation(secondOperand: number, position: number) {
    if (!operationGroup.function || firstOperandNumber === null || firstOperandPosition === null) return;

    const result = operationGroup.function(firstOperandNumber, secondOperand);
    if (Number.isInteger(result)) {
      const newSet = [...numberSetHistory[currentMove]];
      newSet[firstOperandPosition] = null;
      newSet[position] = result;

      setNumberSetHistory([...numberSetHistory, newSet]);
      setCurrentMove(currentMove + 1);
      setMoveHistory([...moveHistory, `${firstOperandNumber} ${operationGroup.sign} ${secondOperand} = ${result}`]);
      setPositionHistory([...positionHistory, firstOperandPosition]);

      setFirstOperandNumber(result);
      setFirstOperandPosition(position);
      setSelectedPosition(position);
      setSelectedOperator(null);
      setOperationGroup({ sign: null, function: null, result: null });
    } else {
      setShakePosition(position);
      setTimeout(() => setShakePosition(null), 200);
      resetBoard();
    }
  }

  function handleUndoClick() {
    if (currentMove > 0) {
      const prevSet = numberSetHistory.slice(0, -1);
      const prevHistory = moveHistory.slice(0, -1);
      const prevPositions = positionHistory.slice(0, -1);

      setNumberSetHistory(prevSet);
      setMoveHistory(prevHistory);
      setPositionHistory(prevPositions);
      setCurrentMove(currentMove - 1);

      // Reset all selection state when undoing
      setSelectedPosition(null);
      setFirstOperandPosition(null);
      setFirstOperandNumber(null);
      setOperationGroup({ sign: null, function: null, result: null });
      setSelectedOperator(null);
    } else {
      resetBoard();
    }
  }

  function calculateStars(): number {
    const num = numberSetHistory[currentMove]?.[selectedPosition ?? 0];
    if (num !== currentPuzzle.target) return 0;
    
    const usedNumbers = moveHistory.length + 1;
    const isChain = isChainOperation();
    
    if (usedNumbers === 6 && isChain) return 3;
    if (usedNumbers === 6) return 2;
    return 1;
  }

  function handleCollectClick() {
    if (!canEarnMoreStars) return;
    
    const stars = calculateStars();
    if (stars > 0 && !showSolution) {
      setShowCollectModal(true);
      
      if (stars <= currentPuzzle.stars) {
        return;
      }
      
      const updatedPuzzles = [...puzzleSet.puzzles];
      updatedPuzzles[puzzleSet.currentPuzzleIndex] = {
        ...currentPuzzle,
        stars
      };
      
      const newPuzzleSet = {
        ...puzzleSet,
        puzzles: updatedPuzzles
      };
      
      setPuzzleSet(newPuzzleSet);
      saveDataToLocalStorage(DAILY_PUZZLE_SET, newPuzzleSet);
      
      // Update daily statistics
      const today = getTodayString();
      const currentStats = { ...statistics }; // Create a copy to work with
      if (!currentStats.dailyStats) {
        currentStats.dailyStats = {}; // Initialize if undefined
      }
      
      const todayStats = currentStats.dailyStats[today] || {
        date: today,
        puzzleStars: new Array(5).fill(0),
        totalStars: 0,
        isPerfect: false
      };
      
      todayStats.puzzleStars[puzzleSet.currentPuzzleIndex] = stars;
      todayStats.totalStars = todayStats.puzzleStars.reduce((a, b) => a + b, 0);
      todayStats.isPerfect = todayStats.puzzleStars.every(s => s === 3);
      
      const allDailyStats = { ...currentStats.dailyStats, [today]: todayStats };
      
      // Calculate total stars across all days properly
      const totalStars = Object.values(allDailyStats)
        .reduce((total, day) => total + (day?.totalStars || 0), 0);
      
      const newStats: GameStatistics = {
        ...currentStats,
        dailyStats: allDailyStats,
        daysPlayed: Object.keys(allDailyStats).length,
        totalStars,
        perfectDays: Object.values(allDailyStats)
          .filter(day => day?.isPerfect).length,
        lastPlayedDate: today
      };
      
      // Update streaks
      const currentStreak = calculateStreak(newStats);
      newStats.currentStreak = currentStreak;
      newStats.bestStreak = Math.max(currentStats.bestStreak || 0, currentStreak);
      
      setStatistics(newStats);
      saveDataToLocalStorage(STATISTICS, newStats);
    }
  }

  function handleGiveUp() {
    if (canEarnMoreStars) {
      setShowSolutionWarning(true);
    }
  }

  function confirmShowSolution() {
    setShowSolutionWarning(false);
    setCanEarnMoreStars(false);
    setShowSolution(true);
    
    // Mark the current puzzle as having its solution shown
    const updatedPuzzles = [...puzzleSet.puzzles];
    updatedPuzzles[puzzleSet.currentPuzzleIndex] = {
      ...currentPuzzle,
      solutionShown: true
    };
    
    const newPuzzleSet = {
      ...puzzleSet,
      puzzles: updatedPuzzles
    };
    
    setPuzzleSet(newPuzzleSet);
    saveDataToLocalStorage(DAILY_PUZZLE_SET, newPuzzleSet);
  }

  function confirmNewGame() {
    if (earnedStars > 0 && canEarnMoreStars) {
      setShowNewGameWarning(true);
    } else {
      startNewTestSet();
    }
  }

  function confirmResetStatistics() {
    setShowResetWarning(true);
  }

  function actuallyResetStatistics() {
    resetStatistics();
    setShowResetWarning(false);
  }

  function resetStatistics() {
    const newStats: GameStatistics = {
      daysPlayed: 0,
      currentStreak: 0,
      bestStreak: 0,
      perfectDays: 0,
      totalStars: 0,
      lastPlayedDate: '',
      dailyStats: {}
    };
    setStatistics(newStats);
    localStorage.removeItem(STATISTICS);
    saveDataToLocalStorage(STATISTICS, newStats);
    setGamesPlayed(0);
    setZeroStarGames(0);
    setOneStarGames(0);
    setTwoStarGames(0);
    setThreeStarGames(0);
  }

  function startNewTestSet() {
    const newPuzzles = generateDailyPuzzles();
    const newSet = {
      seed: Date.now().toString(),
      puzzles: newPuzzles,
      currentPuzzleIndex: 0
    };
    
    setPuzzleSet(newSet);
    saveDataToLocalStorage(DAILY_PUZZLE_SET, newSet);
    
    setNumberSetHistory([newPuzzles[0].numberSet]);
    setCurrentMove(0);
    setMoveHistory([]);
    setPositionHistory([]);
    setCanEarnMoreStars(true);
    setShowSolution(false);
    setEarnedStars(0);
    
    setShowCollectModal(false);
    setShowNewGameWarning(false);
    setShowSolutionWarning(false);
    setShowSolution(false);
    
    resetBoard();
  }

  function switchToPuzzle(index: number) {
    if (index === puzzleSet.currentPuzzleIndex) return;
    
    setPuzzleSet(prev => ({
      ...prev,
      currentPuzzleIndex: index
    }));
    
    const targetPuzzle = puzzleSet.puzzles[index];
    setNumberSetHistory([targetPuzzle.numberSet]);
    setCurrentMove(0);
    setMoveHistory([]);
    setPositionHistory([]);
    setCanEarnMoreStars(!targetPuzzle.solutionShown);
    setShowSolution(targetPuzzle.solutionShown);
    setEarnedStars(0);
    resetBoard();
    
    saveDataToLocalStorage(DAILY_PUZZLE_SET, {
      ...puzzleSet,
      currentPuzzleIndex: index
    });
  }

  useEffect(() => {
    const num = numberSetHistory[currentMove]?.[selectedPosition ?? 0];
    let stars = 0;
    if (num === currentPuzzle.target) {
      stars = 1;
      if (moveHistory.length === 5) stars = 2;
      if (isChainOperation()) stars = 3;
    }
    setEarnedStars(stars);
  }, [numberSetHistory, moveHistory, selectedPosition, currentPuzzle.target]);

  useEffect(() => {
    const stats = loadDataFromLocalStorage(STATISTICS) || {};
    const count = Object.keys(stats).length;
    const zero = Object.values(stats).filter((v: number) => v === 0).length;
    const one = Object.values(stats).filter((v: number) => v === 1).length;
    const two = Object.values(stats).filter((v: number) => v === 2).length;
    const three = Object.values(stats).filter((v: number) => v === 3).length;
    setGamesPlayed(count);
    setZeroStarGames(zero);
    setOneStarGames(one);
    setTwoStarGames(two);
    setThreeStarGames(three);
  }, []);

  function isChainOperation(): boolean {
    if (moveHistory.length !== 5) return false;
    for (let i = 1; i < moveHistory.length; i++) {
      const prev = moveHistory[i - 1].split('=')[1]?.trim();
      const curr = moveHistory[i].split(' ')[0];
      if (prev !== curr) return false;
    }
    return true;
  }

  function getStarRating(average: number): { message: string; color: string } {
    if (average >= 14) return { message: "🌟 Phenomenal!", color: "text-amber-400" };
    if (average >= 12) return { message: "✨ Outstanding!", color: "text-amber-400" };
    if (average >= 10) return { message: "💫 Excellent!", color: "text-amber-300" };
    if (average >= 8) return { message: "⭐ Great job!", color: "text-amber-300" };
    return { message: "🌠 Well done!", color: "text-amber-200" };
  }

  return {
    numberSetHistory,
    currentMove,
    earnedStars,
    selectedPosition,
    selectedOperator,
    moveHistory,
    handleNumberClick,
    handleOperatorClick,
    handleUndoClick,
    handleCollectClick,
    gamesPlayed,
    zeroStarGames,
    oneStarGames,
    twoStarGames,
    threeStarGames,
    resetStatistics,
    showSolution,
    setShowSolution,
    canEarnMoreStars,
    showCollectModal,
    showNewGameWarning,
    showResetWarning,
    showSolutionWarning,
    setShowSolutionWarning,
    handleGiveUp,
    confirmShowSolution,
    confirmNewGame,
    confirmResetStatistics,
    actuallyResetStatistics,
    setShowCollectModal,
    setShowNewGameWarning,
    setShowResetWarning,
    shakePosition,
    setShakePosition,
    showStatistics,
    setShowStatistics,
    puzzleSet,
    currentPuzzle,
    switchToPuzzle,
    startNewTestSet,
    firstOperandNumber,
    statistics,
    getStarRating,
  };
}

export default useGameLogic;
