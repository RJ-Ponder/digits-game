import { useState, useEffect } from 'react';
import {
	generateNumberSet,
	generateTargetAndSolution,
	generateGameInfo,
	saveDataToLocalStorage,
	loadDataFromLocalStorage,
} from './helpers';

const STARTING_NUMBER_SET = 'sns';
const TARGET_AND_SOLUTION = 'tas';
const GAME_INFO = 'gi';
const TOTAL_STARS = 'ts';
const STATISTICS = 'stats';


const useGameLogic = () => {
	const useLocalStorageState = (key, defaultValue, calculate = (v) => v) => {
		// Load from localStorage or use the default
		const [state, setState] = useState(() => {
			const loaded = loadDataFromLocalStorage(key);
			const valueToSave = loaded !== null ? calculate(loaded) : defaultValue;
			saveDataToLocalStorage(key, valueToSave);
			return valueToSave;
		});
	
		// Save to localStorage whenever it changes
		useEffect(() => {
			saveDataToLocalStorage(key, state);
		}, [key, state]);
	
		return [state, setState];
	};
	
	const [startingNumberSet, setStartingNumberSet] = useLocalStorageState(STARTING_NUMBER_SET, generateNumberSet());
	const [targetAndSolution, setTargetAndSolution] = useLocalStorageState(TARGET_AND_SOLUTION, generateTargetAndSolution(startingNumberSet));
	const [gameInfo, setGameInfo] = useLocalStorageState(GAME_INFO, generateGameInfo());
	const [totalStars, setTotalStars] = useLocalStorageState(TOTAL_STARS, 0);

	const { target, solution } = targetAndSolution;

    const [numberSetHistory, setNumberSetHistory] = useState([startingNumberSet]);
    const [currentMove, setCurrentMove] = useState(0);
  
    const [firstOperandNumber, setFirstOperandNumber] = useState(null);
    const [firstOperandPosition, setFirstOperandPosition] = useState(null);
  
    const [operationGroup, setOperationGroup] = useState({
      sign: null,
      function: null,
      result: null
    });
  
    const [selectedPosition, setSelectedPosition] = useState(null);
    const [selectedOperator, setSelectedOperator] = useState(null);
  
    const [earnedStars, setEarnedStars] = useState(0);
    const [moveHistory, setMoveHistory] = useState([]);
	const [positionHistory, setPositionHistory] = useState([]);

	const [gamesPlayed, setGamesPlayed] = useState(0);
	const [zeroStarGames, setZeroStarGames] = useState(0);
	const [oneStarGames, setOneStarGames] = useState(0);
	const [twoStarGames, setTwoStarGames] = useState(0);
	const [threeStarGames, setThreeStarGames] = useState(0);
    
    function startNewGame() {
		console.log('Start New Game function called');
		const gameInfo = localStorage.getItem(GAME_INFO);
		const { id, stars } = JSON.parse(gameInfo);
		const state = { [id]: stars }

		saveDataToLocalStorage(STATISTICS, state, true);

        const newStartingNumberSet = generateNumberSet();
        const newTargetAndSolution = generateTargetAndSolution(newStartingNumberSet);
        const newGameInfo = generateGameInfo();
    
        setStartingNumberSet(newStartingNumberSet);
        setTargetAndSolution(newTargetAndSolution);
        setGameInfo(newGameInfo);
        setNumberSetHistory([newStartingNumberSet]);
        setCurrentMove(0);
        setMoveHistory([]);
		setPositionHistory([]);
        clearBoard();
		console.log('Start New Game function completed');
    }

	function getGameStatistics() {
		const statistics = localStorage.getItem(STATISTICS);
		if (!statistics) {
			return {};
		}
		const parsedStatistics = JSON.parse(statistics);
		// count the number of games played
		const numberOfGames = Object.keys(parsedStatistics).length;
		// count the number of games where 0 stars were collected
		const numberOfZeroStars = Object.values(parsedStatistics).filter((value) => value === 0).length;
		// count the number of games where 1 star was collected
		const numberOfOneStars = Object.values(parsedStatistics).filter((value) => value === 1).length;
		// count the number of games where 2 stars were collected
		const numberOfTwoStars = Object.values(parsedStatistics).filter((value) => value === 2).length;
		// count the number of games where 3 stars were collected
		const numberOfThreeStars = Object.values(parsedStatistics).filter((value) => value === 3).length;

		console.log(`Number of games played: ${numberOfGames}`);
		console.log(`Number of games where 0 stars were collected: ${numberOfZeroStars}`);
		console.log(`Number of games where 1 star was collected: ${numberOfOneStars}`);
		console.log(`Number of games where 2 stars were collected: ${numberOfTwoStars}`);
		console.log(`Number of games where 3 stars were collected: ${numberOfThreeStars}`);

		setGamesPlayed(numberOfGames);
		setZeroStarGames(numberOfZeroStars);
		setOneStarGames(numberOfOneStars);
		setTwoStarGames(numberOfTwoStars);
		setThreeStarGames(numberOfThreeStars);
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

    // checkStarStatus will be called whenever any of the dependencies changes
    useEffect(() => {
        checkEarnedStars();
    }, [numberSetHistory, moveHistory, selectedPosition]);

	useEffect(() => {
        getGameStatistics();
    }, [gameInfo]);

    function handleNumberClick(clickedPosition) {
		const clickedNumber = numberSetHistory[currentMove][clickedPosition];
		const isUnselectingNumber = firstOperandPosition === clickedPosition || clickedNumber === null;
		const isSelectingFirstNumber = firstOperandNumber === null || (firstOperandNumber !== null && operationGroup.function === null);
		const isSelectingSecondNumber = firstOperandNumber !== null && operationGroup.function !== null;
	
		if (isUnselectingNumber) {
			clearBoard();
		} else if (isSelectingFirstNumber) {
			selectFirstNumber(clickedPosition, clickedNumber)
		} else if (isSelectingSecondNumber) {
			performValidOperation(clickedNumber, clickedPosition);
		} else {
			clearBoard();
		}
    }
  
    function selectFirstNumber(clickedPosition, clickedNumber) {
      setFirstOperandNumber(clickedNumber);
      setFirstOperandPosition(clickedPosition);
      setSelectedPosition(clickedPosition);
    }
  
    function handleOperatorClick(clickedOperatorFunction, clickedOperatorSign) {
        if (firstOperandNumber === null) {
            clearBoard();
        } else if (firstOperandNumber !== null && operationGroup.sign === null) {
            setOperationGroup({
            ...operationGroup,
            function: clickedOperatorFunction,
            sign: clickedOperatorSign
            });
            setSelectedOperator(clickedOperatorSign);
        } else if (
            firstOperandNumber !== null &&
            operationGroup.function !== null &&
            operationGroup.sign === clickedOperatorSign
        ) {
            setOperationGroup({
            ...operationGroup,
            function: null,
            sign: null
            });
            setSelectedOperator(null);
        } else if (
            firstOperandNumber !== null &&
            operationGroup.sign !== clickedOperatorSign
        ) {
            setOperationGroup({
            ...operationGroup,
            function: clickedOperatorFunction,
            sign: clickedOperatorSign
            });
            setSelectedOperator(clickedOperatorSign);
        } else {
            clearBoard();
        }
    }
  
    // function handleUndoClick() {  
	// 	if (currentMove > 0) {
	// 		clearBoard(true);
	// 		setSelectedPosition(positionHistory[currentMove - 1]);
	// 		setPositionHistory(positionHistory.slice(0, -1));
	// 		setNumberSetHistory(numberSetHistory.slice(0, -1));
	// 		setCurrentMove(currentMove - 1);
	// 		setMoveHistory(moveHistory.slice(0, -1)); // Remove the latest operation from the history
	// 	} else {
	// 		clearBoard();
	// 	}
    // }

    function handleCollectClick() {
		const collectedStars = loadDataFromLocalStorage(GAME_INFO).stars;
        if (collectedStars < earnedStars) {
        	const gameId = loadDataFromLocalStorage(GAME_INFO).id;
            setGameInfo({id: gameId, stars: earnedStars});
            saveDataToLocalStorage(GAME_INFO, {id: gameId, stars: earnedStars});
            const totalCollectedStars = totalStars + earnedStars - collectedStars;
            setTotalStars(totalCollectedStars);
        }
		setEarnedStars(0);
    }
  
    // function clearBoard(isUndo = false) {		
    //   	setFirstOperandNumber(null);
    //   	setFirstOperandPosition(null);
  
	// 	setOperationGroup({
	// 		function: null,
	// 		sign: null,
	// 		result: null
	// 	});
  
	// 	setSelectedOperator(null);

	// 	if (!isUndo) {
	// 		setSelectedPosition(null);
	// 	}
    // }

	// This function handles the action to undo the last move made.
function handleUndoClick() {
	// Check if there is a move to undo.
	if (currentMove > 0) {
		console.log(moveHistory);
		const firstOperand = parseFirstOperandFromLastMoveHistory();
	  // Clear the board while maintaining the undo state.
	  clearBoardForUndo();
	  // Revert to the previous position.
	  revertToPreviousPosition();
	  setFirstOperandNumber(firstOperand);
	  // Update the history to reflect the undone move.
	  updateHistoryForUndo();
	  // Decrement the move counter.
	  decrementCurrentMove();
	} else {
	  // If there are no moves to undo, simply clear the board.
	  clearBoard();
	}
  }

  function parseFirstOperandFromLastMoveHistory() {
		// Use a regular expression to match the first operand
		const match = moveHistory[currentMove - 1].match(/^(-?\d+)/);
	
		// If there's a match, extract the matched value and convert it to an integer
		if (match) {
			const firstOperand = parseInt(match[0], 10);
			return firstOperand;
		}

		return null;
  }
  
  // This function clears the board and, if it is an undo action, maintains the last selected position.
  function clearBoard(isUndo = false) {
	
	resetOperationGroup();
  
	// Clear the selected operator, this happens regardless of undo.
	setSelectedOperator(null);
  
	// If the clearBoard is not part of an undo, also clear the selected position.
	if (!isUndo) {
	  setSelectedPosition(null);
	  resetOperands();
	}
  }
  
  // Clears the board specifically for an undo action, encapsulating the shared logic.
  function clearBoardForUndo() {
	clearBoard(true);
  }
  
  // Reverts the selected position to the one before the current move.
  function revertToPreviousPosition() {
	setSelectedPosition(positionHistory[currentMove - 1]);
	
		setFirstOperandPosition(positionHistory[currentMove - 1]);
  }
  
  // Updates the various histories for an undo action by removing the last entry.
  function updateHistoryForUndo() {
	setPositionHistory(positionHistory.slice(0, -1));
	setNumberSetHistory(numberSetHistory.slice(0, -1));
	setMoveHistory(moveHistory.slice(0, -1)); // Remove the latest operation from the history.
  }
  
  // Decrements the current move counter as part of an undo action.
  function decrementCurrentMove() {
	setCurrentMove(currentMove - 1);
  }
  
  // Resets the first operand number and position to null.
  function resetOperands() {
		setFirstOperandNumber(null);
		setFirstOperandPosition(null);
  }
  
  // Resets the operation group to null values.
	function resetOperationGroup() {
		setOperationGroup({
			function: null,
			sign: null,
			result: null
		});
	}
  
    function performValidOperation(clickedNumber, clickedPosition) {
        const result = operationGroup.function(firstOperandNumber, clickedNumber);
        // allowing negative numbers for now, otherwise add && result >= 0
        if (result % 1 === 0) {
            let newNumberSet = [...numberSetHistory[currentMove]];
            newNumberSet[firstOperandPosition] = null;
            newNumberSet[clickedPosition] = result;
            setNumberSetHistory([...numberSetHistory, newNumberSet]);
            setCurrentMove(currentMove + 1);
			setPositionHistory([...positionHistory, firstOperandPosition]);
    
            setFirstOperandNumber(result);
            setFirstOperandPosition(clickedPosition);
    
            setOperationGroup({
            ...operationGroup,
            function: null,
            sign: null
            });
    
            setSelectedPosition(clickedPosition);
            setSelectedOperator(null);
    
            const operationText = `${firstOperandNumber} ${operationGroup.sign} ${clickedNumber} = ${result}`;
            setMoveHistory([...moveHistory, operationText]);
        } else {
            setOperationGroup({
            ...operationGroup,
            function: null,
            sign: null
            });
    
            setSelectedPosition(firstOperandPosition);
            setSelectedOperator(null);
        }
    }
  
    function checkEarnedStars() {
		const number = numberSetHistory[currentMove][selectedPosition];
      	// const collectedStars = loadDataFromLocalStorage(GAME_INFO).stars;
      	let earnedStars = 0;
      	if (number === target && isChainOperation() && isAllNumbersUsed()) {
    		earnedStars = 3;
		} else if (number === target && isAllNumbersUsed()) {
			earnedStars = 2;
		} else if (number === target) {
			earnedStars = 1;
		}
		
		// if (earnedStars > collectedStars) {
			setEarnedStars(earnedStars);
		// }
    }

    function isChainOperation() {
		if (isAllNumbersUsed() === false) {
			return false;
		} else {
			for (let i = 1; i < moveHistory.length; i++) {
				const currentOperation = moveHistory[i];
				const previousOperation = moveHistory[i - 1];
				const currentOperand = getOperandFromOperation(currentOperation);
				const previousResult = getResultFromOperation(previousOperation);
				if (currentOperand !== previousResult) {
					return false;
				}
			}
			return true;
		}
    }
  
    function isAllNumbersUsed() {
      	return moveHistory.length === 5;
    }
  
    function getOperandFromOperation(operation) {
		if (typeof operation !== "string" || operation.trim() === "") {
			// Handle the case when the operation is undefined, not a string, or an empty string
			return "";
		}
	
		const operands = operation.split(" ");
		if (operands.length > 0) {
			return operands[0];
		}
	
		return "";
    }
  
    function getResultFromOperation(operation) {
		if (typeof operation !== "string" || operation.trim() === "") {
			return "";
		}
	
		const result = operation.split("=")[1];
		if (typeof result !== "string") {
			return "";
		}
	
		return result.trim();
    }
  
    function getOperandsFromOperation(operation) {
		if (typeof operation !== "string" || operation.trim() === "") {
			return [];
		}
	
		const operands = operation
			.split(/[+\-×÷=]/)
			.map((operand) => operand.trim());
		return operands.filter(
			(operand) => typeof operand === "string" && operand !== ""
		);
    }

	// // ...rest of your state definitions

	// // Define any functions that manipulate the state here, such as:
	// const startNewGame = () => {
	//   const newStartingNumberSet = generateNumberSet();
	//   const newTargetAndSolution = generateTargetAndSolution(newStartingNumberSet);
	//   const newGameInfo = generateGameInfo();

	//   setStartingNumberSet(newStartingNumberSet);
	//   setTargetAndSolution(newTargetAndSolution);
	//   setGameInfo(newGameInfo);
	//   // ...rest of the startNewGame logic
	// };

	// // ...rest of your functions

	// Return only what is necessary for the component
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
	};
};

export default useGameLogic;

// In this useGameLogic hook:

// useLocalStorageState is a custom hook within the useGameLogic hook that abstracts the pattern of loading from and saving to localStorage. This keeps the code DRY and focused.
// The hook encapsulates all the game state and logic, providing a clear API to the main Game component.
// Functions that update the state, like startNewGame, are included in the hook.
// The hook returns an object containing only the state and functions needed by the Game component.
// To use this hook in your Game component, you would simply call const gameLogic = useGameLogic(); at the beginning of your Game component and then use gameLogic.startingNumberSet, gameLogic.startNewGame, etc., wherever you need to access the state or functions managed by the hook.

// Remember, the useGameLogic hook would need to be implemented with all the game logic functions that were originally in your Game component. The example above shows how to start this process and provides the structure to build upon.