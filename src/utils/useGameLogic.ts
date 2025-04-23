import { useEffect, useState } from 'react';
import {
  generateNumberSet,
  generateTargetAndSolution,
  generateGameInfo,
  saveDataToLocalStorage,
  loadDataFromLocalStorage
} from './helpers';

const STARTING_NUMBER_SET = 'sns';
const TARGET_AND_SOLUTION = 'tas';
const GAME_INFO = 'gi';
const TOTAL_STARS = 'ts';
const STATISTICS = 'stats';

type OperationGroup = {
  sign: string | null;
  function: ((a: number, b: number) => number) | null;
  result: number | null;
};

type GameInfo = {
  id: string;
  stars: number;
};

type TargetAndSolution = {
  target: number;
  solution: string[];
};

function useGameLogic() {
  const useLocalStorageState = <T,>(key: string, defaultValue: T, calculate = (v: any): T => v): [T, React.Dispatch<React.SetStateAction<T>>] => {
    const [state, setState] = useState<T>(() => {
      const loaded = loadDataFromLocalStorage(key);
      const valueToSave = loaded !== null ? calculate(loaded) : defaultValue;
      saveDataToLocalStorage(key, valueToSave);
      return valueToSave;
    });

    useEffect(() => {
      saveDataToLocalStorage(key, state);
    }, [key, state]);

    return [state, setState];
  };

  const [startingNumberSet, setStartingNumberSet] = useLocalStorageState<(number | null)[]>(STARTING_NUMBER_SET, generateNumberSet());
  const [targetAndSolution, setTargetAndSolution] = useLocalStorageState<TargetAndSolution>(TARGET_AND_SOLUTION, generateTargetAndSolution(startingNumberSet));
  const [gameInfo, setGameInfo] = useLocalStorageState<GameInfo>(GAME_INFO, generateGameInfo());
  const [totalStars, setTotalStars] = useLocalStorageState<number>(TOTAL_STARS, 0);

  const [numberSetHistory, setNumberSetHistory] = useState<(number | null)[][]>([startingNumberSet]);
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
    const isUnselecting = firstOperandPosition === position || clickedNumber === null;
    const isFirstOperand = firstOperandNumber === null || (firstOperandNumber !== null && operationGroup.function === null);
    const isSecondOperand = firstOperandNumber !== null && operationGroup.function !== null;

    if (isUnselecting) {
      resetBoard();
    } else if (isFirstOperand) {
      setFirstOperandNumber(clickedNumber);
      setFirstOperandPosition(position);
      setSelectedPosition(position);
    } else if (isSecondOperand) {
      performOperation(clickedNumber, position);
    } else {
      resetBoard();
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
    if (num !== targetAndSolution.target) return 0;
    
    const usedNumbers = moveHistory.length + 1;
    const isChain = isChainOperation();
    
    if (usedNumbers === 6 && isChain) return 3;
    if (usedNumbers === 6) return 2;
    return 1;
  }

  function handleCollectClick() {
    if (!canEarnMoreStars) return;
    
    const stars = calculateStars();
    if (stars > 0) {
      // Show the collection modal
      setShowCollectModal(true);
      
      // If we've already collected these stars, don't add them again
      if (stars <= gameInfo.stars) {
        return;
      }
      
      // Update game info and total stars
      const starDifference = stars - gameInfo.stars;
      const updatedGameInfo = { ...gameInfo, stars };
      setGameInfo(updatedGameInfo);
      setTotalStars(prev => prev + starDifference);
      
      // Update statistics
      const stats = loadDataFromLocalStorage(STATISTICS) || {};
      stats[gameInfo.id] = stars;
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
  }

  function confirmNewGame() {
    if (earnedStars > gameInfo.stars && canEarnMoreStars) {
      setShowNewGameWarning(true);
    } else {
      startNewGame();
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
    localStorage.removeItem(TOTAL_STARS);
    setGamesPlayed(0);
    setZeroStarGames(0);
    setOneStarGames(0);
    setTwoStarGames(0);
    setThreeStarGames(0);
    setTotalStars(0);
  }

  function startNewGame() {
    const newSet = generateNumberSet();
    const newTarget = generateTargetAndSolution(newSet);
    const newInfo = generateGameInfo();

    // Reset all local storage states first
    localStorage.removeItem(STARTING_NUMBER_SET);
    localStorage.removeItem(TARGET_AND_SOLUTION);
    localStorage.removeItem(GAME_INFO);

    // Set new states
    setStartingNumberSet(newSet);
    setTargetAndSolution(newTarget);
    setGameInfo(newInfo);
    
    // Reset game state
    setNumberSetHistory([newSet]);
    setCurrentMove(0);
    setMoveHistory([]);
    setPositionHistory([]);
    setCanEarnMoreStars(true);
    setShowSolution(false);
    setEarnedStars(0);
    
    // Reset all modal states
    setShowCollectModal(false);
    setShowNewGameWarning(false);
    setShowSolutionWarning(false);
    setShowSolution(false);
    
    resetBoard();
  }

  useEffect(() => {
    const num = numberSetHistory[currentMove]?.[selectedPosition ?? 0];
    let stars = 0;
    if (num === targetAndSolution.target) {
      stars = 1;
      if (moveHistory.length === 5) stars = 2;
      if (isChainOperation()) stars = 3;
    }
    setEarnedStars(stars);
  }, [numberSetHistory, moveHistory, selectedPosition]);

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
  }, [gameInfo]);

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
    startingNumberSet,
    targetAndSolution,
    gameInfo,
    totalStars,
    numberSetHistory,
    currentMove,
    earnedStars,
    selectedPosition,
    selectedOperator,
    moveHistory,
    setStartingNumberSet,
    setGameInfo,
    setTargetAndSolution,
    setTotalStars,
    handleNumberClick,
    handleOperatorClick,
    handleUndoClick,
    handleCollectClick,
    startNewGame,
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
  };
}

export default useGameLogic;
