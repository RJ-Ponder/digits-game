import { useEffect, useState } from 'react';
import {
  generateDailyPuzzles,
  getDailyPuzzleSeed,
  saveDataToLocalStorage,
  loadDataFromLocalStorage,
} from './helpers';
import { DailyPuzzle, DailyPuzzleSet } from '../types';

const DAILY_PUZZLE_SET = 'dps';
const STATISTICS = 'stats';

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

  const [showSolution, setShowSolution] = useState<boolean>(false);
  const [canEarnMoreStars, setCanEarnMoreStars] = useState<boolean>(true);
  const [showCollectModal, setShowCollectModal] = useState<boolean>(false);
  const [showNewGameWarning, setShowNewGameWarning] = useState<boolean>(false);
  const [showResetWarning, setShowResetWarning] = useState<boolean>(false);
  const [showSolutionWarning, setShowSolutionWarning] = useState<boolean>(false);

  const [shakePosition, setShakePosition] = useState<number | null>(null);
  const [showStatistics, setShowStatistics] = useState<boolean>(false);

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

    // If no number is selected, this becomes the first operand
    if (firstOperandNumber === null) {
      setFirstOperandNumber(clickedNumber);
      setFirstOperandPosition(position);
      setSelectedPosition(position);
      return;
    }

    // Only allow selecting a second number if an operator is selected
    if (operationGroup.function !== null) {
      performOperation(clickedNumber, position);
    }
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

      const lastPos = prevPositions[prevPositions.length - 1] ?? null;
      setSelectedPosition(lastPos);
      setFirstOperandPosition(lastPos);
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
      
      const stats = loadDataFromLocalStorage(STATISTICS) || {};
      stats[currentPuzzle.id] = stars;
      saveDataToLocalStorage(STATISTICS, stats);
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
    localStorage.removeItem(STATISTICS);
    setGamesPlayed(0);
    setZeroStarGames(0);
    setOneStarGames(0);
    setTwoStarGames(0);
    setThreeStarGames(0);
  }

  function startNewTestSet() {
    const newPuzzles = generateDailyPuzzles(Date.now().toString());
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
  };
}

export default useGameLogic;
