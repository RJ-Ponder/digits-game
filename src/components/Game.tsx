import React, { useState } from "react";
import useGameLogic from "../utils/useGameLogic";
import { SunIcon, MoonIcon, QuestionMarkCircleIcon, InformationCircleIcon, ArrowPathIcon, StarIcon, FlagIcon, ChartBarIcon } from "@heroicons/react/24/solid";

const Game: React.FC = () => {
  const {
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
    handleGiveUp,
    confirmNewGame,
    confirmResetStatistics,
    actuallyResetStatistics,
    setShowCollectModal,
    setShowNewGameWarning,
    setShowResetWarning,
    showSolutionWarning,
    setShowSolutionWarning,
    confirmShowSolution,
    shakePosition,
    showStatistics,
    setShowStatistics,
    puzzleSet,
    currentPuzzle,
    switchToPuzzle,
    startNewTestSet,
    firstOperandNumber,
  } = useGameLogic();

  const operators = [
    { sign: "+", fn: (a: number, b: number) => a + b },
    { sign: "-", fn: (a: number, b: number) => a - b },
    { sign: "×", fn: (a: number, b: number) => a * b },
    { sign: "÷", fn: (a: number, b: number) => a / b }
  ];

  const [darkMode, setDarkMode] = useState(true);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const handleModalOutsideClick = (e: React.MouseEvent<HTMLDivElement>, closeModal: () => void) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  return (
    <div className={`${darkMode ? "bg-zinc-900 text-white" : "bg-white text-zinc-900"} min-h-screen transition-colors duration-75 font-sans`}>
      <div className="max-w-xl mx-auto flex flex-col gap-6 items-center p-6">
        <div className="w-full flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors duration-75"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
            </button>
            <button
              onClick={() => setShowStatistics(true)}
              className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors duration-75"
              aria-label="Show statistics"
            >
              <ChartBarIcon className="w-6 h-6" />
            </button>
            <button
              onClick={() => setShowHowToPlay(true)}
              className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors duration-75"
              aria-label="How to play"
            >
              <QuestionMarkCircleIcon className="w-6 h-6" />
            </button>
            <button
              onClick={() => setShowAbout(true)}
              className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors duration-75"
              aria-label="About"
            >
              <InformationCircleIcon className="w-6 h-6" />
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleGiveUp}
              className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors duration-75"
              aria-label="Give up"
              disabled={!canEarnMoreStars}
            >
              <FlagIcon className={`w-6 h-6 ${!canEarnMoreStars ? "opacity-50" : ""}`} />
            </button>
            <button
              onClick={confirmNewGame}
              className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors duration-75"
              aria-label="New game"
            >
              <ArrowPathIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Add progress bar below top menu */}
        <div className="w-full flex gap-1">
          {puzzleSet.puzzles.map((puzzle, index) => (
            <button
              key={puzzle.id}
              onClick={() => switchToPuzzle(index)}
              className={`flex-1 h-2 rounded transition-colors duration-75 ${
                index === puzzleSet.currentPuzzleIndex
                  ? "bg-indigo-500"
                  : puzzle.stars > 0
                  ? "bg-amber-400"
                  : darkMode
                  ? "bg-zinc-700"
                  : "bg-zinc-200"
              }`}
              aria-label={`Puzzle ${index + 1}${puzzle.stars ? ` (${puzzle.stars} stars)` : ''}`}
            >
              {puzzle.stars > 0 && (
                <div className="relative">
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs">
                    {'⭐'.repeat(puzzle.stars)}
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="text-5xl font-bold text-center">{puzzleSet.puzzles[puzzleSet.currentPuzzleIndex].target}</div>

        <div className="grid grid-cols-3 gap-4">
          {numberSetHistory[currentMove].map((num, idx) => (
            <button
              key={idx}
              onClick={() => handleNumberClick(idx)}
              className={`w-20 h-20 rounded-full text-2xl font-bold border transition-colors duration-75
                ${selectedPosition === idx ? "bg-indigo-500 border-indigo-300" : darkMode ? "bg-zinc-800 border-zinc-700 hover:bg-zinc-700" : "bg-zinc-100 border-zinc-300 hover:bg-zinc-200"}
                ${num === null ? "invisible" : ""}
                ${shakePosition === idx ? "animate-[shake_0.2s_ease-in-out]" : ""}`}
            >
              {num ?? ""}
            </button>
          ))}
        </div>

        <div className="flex gap-4">
          {operators.map(({ sign, fn }) => (
            <button
              key={sign}
              onClick={() => handleOperatorClick(fn, sign)}
              disabled={firstOperandNumber === null}
              className={`w-14 h-14 rounded-full text-xl border transition
                ${selectedOperator === sign ? "bg-indigo-600 border-indigo-300" : darkMode ? "bg-zinc-800 border-zinc-700 hover:bg-zinc-700" : "bg-zinc-100 border-zinc-300 hover:bg-zinc-200"}
                ${firstOperandNumber === null ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {sign}
            </button>
          ))}
          <button
            onClick={handleUndoClick}
            className="w-14 h-14 rounded-full text-xl bg-amber-500 hover:bg-amber-600 text-black font-bold"
          >
            ↺
          </button>
        </div>

        <p className="text-xl">⭐ <span className="font-semibold text-amber-400">{earnedStars}</span> Earned</p>

        <button
          onClick={handleCollectClick}
          disabled={earnedStars === 0 || showSolution}
          className={`flex items-center gap-2 px-6 py-2 rounded-full font-medium transition-colors duration-75
            ${earnedStars > 0 && !showSolution
              ? "bg-amber-400 hover:bg-amber-500 text-black" 
              : "bg-zinc-300 text-zinc-500 cursor-not-allowed dark:bg-zinc-700 dark:text-zinc-500"}`}
        >
          <StarIcon className="w-5 h-5" />
          Collect Stars
        </button>

        <button
          onClick={startNewTestSet}
          className="px-4 py-2 text-sm bg-zinc-700 text-white rounded hover:bg-zinc-600"
        >
          New Test Set
        </button>

        {/* Solution and Moves section */}
        <div className="w-full flex flex-col gap-2">
          {showSolution && (
            <details className={`${darkMode ? "bg-zinc-800 border-zinc-700" : "bg-zinc-100 border-zinc-300"} w-full border rounded`}
                     open={showSolution}>
              <summary className="cursor-pointer font-semibold text-lg px-4 py-2">💡 Solution</summary>
              <div className="px-4 pb-4">
                <div className="space-y-2 mt-2">
                  {currentPuzzle.solution.map((step, index) => (
                    <p key={index} className="font-mono">{step}</p>
                  ))}
                </div>
              </div>
            </details>
          )}

          <details className={`${darkMode ? "bg-zinc-800 border-zinc-700" : "bg-zinc-100 border-zinc-300"} w-full border rounded`}>
            <summary className="cursor-pointer font-semibold text-lg px-4 py-2">📝 Moves</summary>
            <div className="px-4 pb-4">
              <ul className={`mt-2 text-sm max-h-40 overflow-y-auto ${darkMode ? "text-zinc-300" : "text-zinc-700"}`}>
                {moveHistory.length > 0 ? (
                  moveHistory.map((move, i) => <li key={i}>{move}</li>)
                ) : (
                  <li className="text-zinc-500">No moves yet.</li>
                )}
              </ul>
            </div>
          </details>
        </div>

        {/* Statistics Modal */}
        {showStatistics && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
               onClick={(e) => handleModalOutsideClick(e, () => setShowStatistics(false))}>
            <div className={`${darkMode ? "bg-zinc-800" : "bg-white"} p-6 rounded-lg max-w-md w-full text-center`}>
              <h2 className="text-xl font-bold mb-4">📊 Statistics</h2>
              <div className={`mt-2 space-y-3 text-sm ${darkMode ? "text-zinc-300" : "text-zinc-700"}`}>
                <p className="text-lg">Total Games: {gamesPlayed}</p>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-3xl mb-1">{zeroStarGames}</p>
                    <p>0⭐</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl mb-1">{oneStarGames}</p>
                    <p>1⭐</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl mb-1">{twoStarGames}</p>
                    <p>2⭐</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl mb-1">{threeStarGames}</p>
                    <p>3⭐</p>
                  </div>
                </div>
                <button
                  onClick={confirmResetStatistics}
                  className="mt-4 text-red-400 underline hover:text-red-600"
                >
                  Reset Statistics
                </button>
              </div>
              <button
                onClick={() => setShowStatistics(false)}
                className="w-full mt-6 bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Collection Modal */}
        {showCollectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
               onClick={(e) => handleModalOutsideClick(e, () => setShowCollectModal(false))}>
            <div className={`${darkMode ? "bg-zinc-800" : "bg-white"} p-6 rounded-lg max-w-md w-full text-center`}>
              {earnedStars === 3 ? (
                <>
                  <h2 className="text-2xl font-bold mb-4">🎉 Amazing Job! 🎉</h2>
                  <p className="mb-4">You earned all 3 ⭐⭐⭐ stars on puzzle {puzzleSet.currentPuzzleIndex + 1} by using all numbers in a perfect chain!</p>
                </>
              ) : earnedStars === 2 ? (
                <>
                  <h2 className="text-xl font-bold mb-4">🎯 Great Work!</h2>
                  <p className="mb-4">You earned 2 ⭐⭐ stars on puzzle {puzzleSet.currentPuzzleIndex + 1}! Want to try for 3 stars with a chain solution?</p>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold mb-4">👍 Good Job!</h2>
                  <p className="mb-4">You earned 1 ⭐ star on puzzle {puzzleSet.currentPuzzleIndex + 1}! Want to try using more numbers for additional stars?</p>
                </>
              )}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setShowCollectModal(false)}
                  className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
                >
                  Keep Playing
                </button>
                <button
                  onClick={() => {
                    setShowCollectModal(false);
                    switchToPuzzle((puzzleSet.currentPuzzleIndex + 1) % puzzleSet.puzzles.length);
                  }}
                  className="px-4 py-2 bg-amber-500 text-black rounded hover:bg-amber-600"
                >
                  Next Puzzle
                </button>
              </div>
            </div>
          </div>
        )}

        {/* New Game Warning Modal */}
        {showNewGameWarning && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
               onClick={(e) => handleModalOutsideClick(e, () => setShowNewGameWarning(false))}>
            <div className={`${darkMode ? "bg-zinc-800" : "bg-white"} p-6 rounded-lg max-w-md w-full text-center`}>
              <h2 className="text-xl font-bold mb-4">⚠️ Wait!</h2>
              <p className="mb-4">Starting a new game will lose your chance to collect {earnedStars} stars. Are you sure?</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setShowNewGameWarning(false)}
                  className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
                >
                  Keep Playing
                </button>
                <button
                  onClick={() => {
                    setShowNewGameWarning(false);
                    startNewTestSet();
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  New Game
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reset Warning Modal */}
        {showResetWarning && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
               onClick={(e) => handleModalOutsideClick(e, () => setShowResetWarning(false))}>
            <div className={`${darkMode ? "bg-zinc-800" : "bg-white"} p-6 rounded-lg max-w-md w-full text-center`}>
              <h2 className="text-xl font-bold mb-4">⚠️ Warning!</h2>
              <p className="mb-4">Resetting statistics will clear all your progress. This cannot be undone!</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setShowResetWarning(false)}
                  className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
                >
                  Cancel
                </button>
                <button
                  onClick={actuallyResetStatistics}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Reset Everything
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Solution Warning Modal */}
        {showSolutionWarning && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
               onClick={(e) => handleModalOutsideClick(e, () => setShowSolutionWarning(false))}>
            <div className={`${darkMode ? "bg-zinc-800" : "bg-white"} p-6 rounded-lg max-w-md w-full text-center`}>
              <h2 className="text-xl font-bold mb-4">⚠️ Warning!</h2>
              <p className="mb-4">Viewing the solution will prevent you from earning stars for this puzzle. Are you sure?</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setShowSolutionWarning(false)}
                  className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
                >
                  Keep Playing
                </button>
                <button
                  onClick={confirmShowSolution}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Show Solution
                </button>
              </div>
            </div>
          </div>
        )}

        {/* How to Play Modal */}
        {showHowToPlay && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
               onClick={(e) => handleModalOutsideClick(e, () => setShowHowToPlay(false))}>
            <div className={`${darkMode ? "bg-zinc-800" : "bg-white"} p-6 rounded-lg max-w-md w-full space-y-4`}>
              <h2 className="text-2xl font-bold">How to Play</h2>
              <div className="space-y-4">
                <p>Use the numbers and operators to reach the target number. You can earn stars based on how efficiently you solve the puzzle:</p>
                
                <div className="space-y-2">
                  <p className="flex items-center gap-2">
                    <span className="text-xl">⭐⭐⭐</span>
                    <span>Use all numbers in a chain (each result feeds into the next operation)</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-xl">⭐⭐</span>
                    <span>Use all numbers (in any order)</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-xl">⭐</span>
                    <span>Reach the target (using any number of moves)</span>
                  </p>
                </div>

                <p className="text-sm text-zinc-400">💡 Tip: You can collect stars at any time and keep trying for more, but giving up or starting a new game will prevent earning more stars for the current puzzle.</p>
              </div>
              <button
                onClick={() => setShowHowToPlay(false)}
                className="w-full bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
              >
                Got it!
              </button>
            </div>
          </div>
        )}

        {/* About Modal */}
        {showAbout && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
               onClick={(e) => handleModalOutsideClick(e, () => setShowAbout(false))}>
            <div className={`${darkMode ? "bg-zinc-800" : "bg-white"} p-6 rounded-lg max-w-md w-full`}>
              <h2 className="text-xl font-bold mb-4">About Digits</h2>
              <p className="mb-4">A mathematical puzzle game where you combine numbers to reach a target. Challenge yourself with new puzzles every day!</p>
              <button
                onClick={() => setShowAbout(false)}
                className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Game;
