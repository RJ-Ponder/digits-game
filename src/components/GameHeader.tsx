import React from 'react';
import { SunIcon, MoonIcon, QuestionMarkCircleIcon, InformationCircleIcon, FlagIcon, ChartBarIcon } from "@heroicons/react/24/solid";
import { DailyPuzzle } from '../types';

interface GameHeaderProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  onShowStatistics: () => void;
  onShowHowToPlay: () => void;
  onShowAbout: () => void;
  onGiveUp: () => void;
  canEarnMoreStars: boolean;
  puzzles: DailyPuzzle[];
  currentPuzzleIndex: number;
  onSwitchPuzzle: (index: number) => void;
}

const GameHeader: React.FC<GameHeaderProps> = ({
  darkMode,
  toggleDarkMode,
  onShowStatistics,
  onShowHowToPlay,
  onShowAbout,
  onGiveUp,
  canEarnMoreStars,
  puzzles,
  currentPuzzleIndex,
  onSwitchPuzzle,
}) => (
  <div className="w-full flex flex-col gap-4">
    <div className="w-full flex justify-between items-center">
      <a 
        href="https://pondergames.com" 
        className="text-lg font-bold tracking-tight hover:opacity-80 transition-opacity"
      >
        <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
          Ponder Games
        </span>
      </a>

      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-extrabold tracking-tighter bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
          Digits
        </span>
      </div>
    </div>

    <div className="w-full flex justify-between items-center">
      <div className="flex gap-2">
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors duration-75"
          aria-label="Toggle dark mode"
        >
          {darkMode ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
        </button>
        <button
          onClick={onShowStatistics}
          className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors duration-75"
          aria-label="Show statistics"
        >
          <ChartBarIcon className="w-6 h-6" />
        </button>
        <button
          onClick={onShowHowToPlay}
          className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors duration-75"
          aria-label="How to play"
        >
          <QuestionMarkCircleIcon className="w-6 h-6" />
        </button>
        <button
          onClick={onShowAbout}
          className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors duration-75"
          aria-label="About"
        >
          <InformationCircleIcon className="w-6 h-6" />
        </button>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onGiveUp}
          className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors duration-75"
          aria-label="Give up"
          disabled={!canEarnMoreStars}
        >
          <FlagIcon className={`w-6 h-6 ${!canEarnMoreStars ? "opacity-50" : ""}`} />
        </button>
      </div>
    </div>

    <div className="w-full flex gap-1">
      {puzzles.map((puzzle, index) => (
        <button
          key={puzzle.id}
          onClick={() => onSwitchPuzzle(index)}
          className={`flex-1 h-2 rounded transition-colors duration-75 ${
            index === currentPuzzleIndex
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
  </div>
);

export default GameHeader;