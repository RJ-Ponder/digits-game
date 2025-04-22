import React, { useState } from "react";
import useGameLogic from "../utils/useGameLogic";

const Game: React.FC = () => {
  const {
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
    resetStatistics
  } = useGameLogic();

  const { target } = targetAndSolution;
  const operators = [
    { sign: "+", fn: (a: number, b: number) => a + b },
    { sign: "-", fn: (a: number, b: number) => a - b },
    { sign: "×", fn: (a: number, b: number) => a * b },
    { sign: "÷", fn: (a: number, b: number) => a / b }
  ];

  const [darkMode, setDarkMode] = useState(true);

  return (
    <div className={`${darkMode ? "bg-zinc-900 text-white" : "bg-white text-zinc-900"} min-h-screen transition-colors duration-300 p-6 font-sans`}>
      <div className="max-w-xl mx-auto flex flex-col gap-6 items-center">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="self-end mb-4 text-sm bg-zinc-700 text-white px-3 py-1 rounded hover:bg-zinc-600"
        >
          Toggle {darkMode ? "Light" : "Dark"} Mode
        </button>

        <div className="text-5xl font-bold">🎯 {target}</div>

        <div className="grid grid-cols-3 gap-4">
          {numberSetHistory[currentMove].map((num, idx) => (
            <button
              key={idx}
              onClick={() => handleNumberClick(idx)}
              className={`w-20 h-20 rounded-full text-2xl font-bold border transition
                ${selectedPosition === idx ? "bg-indigo-500 border-indigo-300" : darkMode ? "bg-zinc-800 border-zinc-700 hover:bg-zinc-700" : "bg-zinc-100 border-zinc-300 hover:bg-zinc-200"}
                ${num === null ? "invisible" : ""}`}
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
              className={`w-14 h-14 rounded-full text-xl border transition
                ${selectedOperator === sign ? "bg-indigo-600 border-indigo-300" : darkMode ? "bg-zinc-800 border-zinc-700 hover:bg-zinc-700" : "bg-zinc-100 border-zinc-300 hover:bg-zinc-200"}`}
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

        <div className="text-center space-y-1">
          <p className="text-xl">⭐ <span className="font-semibold text-amber-400">{earnedStars}</span> Earned</p>
          <p className={`text-sm ${darkMode ? "text-zinc-400" : "text-zinc-600"}`}>Total Stars: {totalStars}</p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleCollectClick}
            className="bg-amber-400 hover:bg-amber-500 text-black px-4 py-1 rounded-full"
          >
            Share
          </button>
          <button
            onClick={startNewGame}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-1 rounded-full"
          >
            New Game
          </button>
        </div>

        <details className={`${darkMode ? "bg-zinc-800 border-zinc-700" : "bg-zinc-100 border-zinc-300"} w-full border rounded p-4`}>
          <summary className="cursor-pointer font-semibold text-lg">📊 Statistics</summary>
          <div className={`mt-2 space-y-1 text-sm ${darkMode ? "text-zinc-300" : "text-zinc-700"}`}>
            <p>Total Games: {gamesPlayed}</p>
            <p>0⭐: {zeroStarGames}</p>
            <p>1⭐: {oneStarGames}</p>
            <p>2⭐: {twoStarGames}</p>
            <p>3⭐: {threeStarGames}</p>
            <button
              onClick={resetStatistics}
              className="mt-2 text-red-400 underline hover:text-red-600"
            >
              Reset Statistics
            </button>
          </div>
        </details>

        <details className={`${darkMode ? "bg-zinc-800 border-zinc-700" : "bg-zinc-100 border-zinc-300"} w-full border rounded p-4`}>
          <summary className="cursor-pointer font-semibold text-lg">📝 Moves</summary>
          <ul className={`mt-2 text-sm list-disc pl-5 max-h-40 overflow-y-auto ${darkMode ? "text-zinc-300" : "text-zinc-700"}`}>
            {moveHistory.length > 0 ? (
              moveHistory.map((move, i) => <li key={i}>{move}</li>)
            ) : (
              <li className="text-zinc-500">No moves yet.</li>
            )}
          </ul>
        </details>
      </div>
    </div>
  );
};

export default Game;
