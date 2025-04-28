import React, { useState, useEffect } from "react";
import useGameLogic from "../utils/useGameLogic";
import GameHeader from "./GameHeader";
import NumberGrid from "./NumberGrid";
import GameControls from "./GameControls";
import GameHistory from "./GameHistory";
import { StatisticsModal, CollectStarsModal, HowToPlayModal, AboutModal, ResetWarningModal } from "./modals/GameModals";

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
    showSolution,
    canEarnMoreStars,
    showCollectModal,
    handleGiveUp,
    confirmResetStatistics,
    resetStatistics,
    setShowCollectModal,
    showSolutionWarning,
    setShowSolutionWarning,
    confirmShowSolution,
    shakePosition,
    showStatistics,
    setShowStatistics,
    puzzleSet,
    currentPuzzle,
    switchToPuzzle,
    firstOperandNumber,
    statistics,
    getStarRating,
  } = useGameLogic();

  const [darkMode, setDarkMode] = useState(true);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showResetWarning, setShowResetWarning] = useState(false);

  // Add effect to update HTML class and theme-color when dark mode changes
  useEffect(() => {
    const htmlElement = document.documentElement;
    if (darkMode) {
      htmlElement.classList.add('dark-mode');
      htmlElement.classList.remove('light-mode');
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#18181b');
    } else {
      htmlElement.classList.add('light-mode');
      htmlElement.classList.remove('dark-mode');
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#ffffff');
    }
  }, [darkMode]);

  const actuallyResetStatistics = () => {
    resetStatistics();
    setShowResetWarning(false);
    setShowStatistics(true); // Show statistics modal again after reset
  };

  const handleResetStatisticsClick = () => {
    setShowResetWarning(true);
    setShowStatistics(false);
  };

  // Add handler for cancel action
  const handleCancelReset = () => {
    setShowResetWarning(false);
    setShowStatistics(true); // Show statistics modal again after cancel
  };

  const operators = [
    { sign: "+", fn: (a: number, b: number) => a + b },
    { sign: "-", fn: (a: number, b: number) => a - b },
    { sign: "×", fn: (a: number, b: number) => a * b },
    { sign: "÷", fn: (a: number, b: number) => a / b }
  ];

  const handleModalOutsideClick = (e: React.MouseEvent<HTMLDivElement>, closeModal: () => void) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  return (
    <div className={`${darkMode ? "bg-zinc-900 text-white" : "bg-white text-zinc-900"} min-h-screen transition-colors duration-75 font-sans`}>
      <div className="max-w-xl mx-auto flex flex-col gap-6 items-center p-6">
        <GameHeader 
          darkMode={darkMode}
          toggleDarkMode={() => setDarkMode(!darkMode)}
          onShowStatistics={() => setShowStatistics(true)}
          onShowHowToPlay={() => setShowHowToPlay(true)}
          onShowAbout={() => setShowAbout(true)}
          onGiveUp={handleGiveUp}
          canEarnMoreStars={canEarnMoreStars}
          puzzles={puzzleSet.puzzles}
          currentPuzzleIndex={puzzleSet.currentPuzzleIndex}
          onSwitchPuzzle={switchToPuzzle}
        />

        <div className="text-5xl font-bold text-center">{currentPuzzle.target}</div>

        <NumberGrid
          numbers={numberSetHistory[currentMove]}
          selectedPosition={selectedPosition}
          shakePosition={shakePosition}
          handleNumberClick={handleNumberClick}
          darkMode={darkMode}
        />

        <GameControls
          operators={operators}
          firstOperandNumber={firstOperandNumber}
          selectedOperator={selectedOperator}
          handleOperatorClick={handleOperatorClick}
          handleUndoClick={handleUndoClick}
          darkMode={darkMode}
        />

        <p className="text-xl">⭐ <span className="font-semibold text-amber-400">{earnedStars}</span> Earned</p>

        <button
          onClick={handleCollectClick}
          disabled={earnedStars === 0 || showSolution}
          className={`flex items-center gap-2 px-6 py-2 rounded-full font-medium transition-colors duration-75
            ${earnedStars > 0 && !showSolution
              ? "bg-amber-400 hover:bg-amber-500 text-black" 
              : "bg-zinc-300 text-zinc-500 cursor-not-allowed dark:bg-zinc-700 dark:text-zinc-500"}`}
        >
          Collect Stars
        </button>

        <GameHistory 
          darkMode={darkMode}
          showSolution={showSolution}
          solution={currentPuzzle.solution}
          moveHistory={moveHistory}
        />

        {/* Modals */}
        {showSolutionWarning && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
            onClick={(e) => handleModalOutsideClick(e, () => setShowSolutionWarning(false))}
          >
            <div className={`${darkMode ? "bg-zinc-800" : "bg-white"} p-6 rounded-lg shadow-lg max-w-sm w-full`}>
              <h2 className="text-xl font-bold mb-4">🔍 Show Solution?</h2>
              <p className="mb-6">Showing the solution will prevent you from earning any more stars for this puzzle. Are you sure you want to continue?</p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setShowSolutionWarning(false)}
                  className={`px-4 py-2 rounded-lg ${darkMode ? "bg-zinc-700 hover:bg-zinc-600" : "bg-gray-200 hover:bg-gray-300"}`}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmShowSolution}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-black"
                >
                  Show Solution
                </button>
              </div>
            </div>
          </div>
        )}

        {showStatistics && (
          <StatisticsModal
            darkMode={darkMode}
            statistics={statistics}
            confirmResetStatistics={handleResetStatisticsClick}
            onClose={() => setShowStatistics(false)}
            handleModalOutsideClick={handleModalOutsideClick}
            getStarRating={getStarRating}
          />
        )}

        {showResetWarning && (
          <ResetWarningModal
            darkMode={darkMode}
            onClose={handleCancelReset}
            onConfirm={actuallyResetStatistics}
            handleModalOutsideClick={handleModalOutsideClick}
          />
        )}

        {showCollectModal && (
          <CollectStarsModal
            darkMode={darkMode}
            earnedStars={earnedStars}
            puzzleIndex={puzzleSet.currentPuzzleIndex}
            onKeepPlaying={() => setShowCollectModal(false)}
            onNextPuzzle={() => {
              setShowCollectModal(false);
              switchToPuzzle((puzzleSet.currentPuzzleIndex + 1) % puzzleSet.puzzles.length);
            }}
            handleModalOutsideClick={handleModalOutsideClick}
            onClose={() => setShowCollectModal(false)}
          />
        )}

        {showHowToPlay && (
          <HowToPlayModal
            darkMode={darkMode}
            onClose={() => setShowHowToPlay(false)}
            handleModalOutsideClick={handleModalOutsideClick}
          />
        )}

        {showAbout && (
          <AboutModal
            darkMode={darkMode}
            onClose={() => setShowAbout(false)}
            handleModalOutsideClick={handleModalOutsideClick}
          />
        )}
      </div>
    </div>
  );
};

export default Game;
