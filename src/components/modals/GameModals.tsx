import React from 'react';
import { StarIcon } from "@heroicons/react/24/solid";
import { GameStatistics } from '../../types';

interface ModalProps {
  darkMode: boolean;
  onClose: () => void;
  handleModalOutsideClick: (e: React.MouseEvent<HTMLDivElement>, closeModal: () => void) => void;
}

interface StatisticsModalProps extends ModalProps {
  statistics: GameStatistics;
  confirmResetStatistics: () => void;
  getStarRating: (average: number) => { message: string; color: string };
}

export const StatisticsModal: React.FC<StatisticsModalProps> = ({
  darkMode,
  statistics,
  confirmResetStatistics,
  onClose,
  handleModalOutsideClick,
  getStarRating
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
       onClick={(e) => handleModalOutsideClick(e, onClose)}>
    <div className={`${darkMode ? "bg-zinc-800" : "bg-white"} p-6 rounded-lg max-w-md w-full text-center`}>
      <h2 className="text-2xl font-bold mb-6">📊 Statistics</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatBox darkMode={darkMode} value={statistics.daysPlayed} label="Days Played" />
        <StatBox darkMode={darkMode} value={statistics.currentStreak} label="Current Streak" />
        <StatBox darkMode={darkMode} value={statistics.bestStreak} label="Best Streak" />
        <StatBox darkMode={darkMode} value={statistics.perfectDays} label="Perfect Days" />
      </div>

      {statistics.daysPlayed > 0 && (
        <AverageStarsBox
          darkMode={darkMode}
          statistics={statistics}
          getStarRating={getStarRating}
        />
      )}

      <button
        onClick={confirmResetStatistics}
        className="text-sm px-3 py-1.5 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors duration-75"
      >
        Reset Statistics
      </button>
      
      <button
        onClick={onClose}
        className="w-full mt-6 bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
      >
        Close
      </button>
    </div>
  </div>
);

interface CollectStarsModalProps extends ModalProps {
  earnedStars: number;
  puzzleIndex: number;
  onKeepPlaying: () => void;
  onNextPuzzle: () => void;
}

export const CollectStarsModal: React.FC<CollectStarsModalProps> = ({
  darkMode,
  earnedStars,
  puzzleIndex,
  onKeepPlaying,
  onNextPuzzle,
  handleModalOutsideClick
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
       onClick={(e) => handleModalOutsideClick(e, onKeepPlaying)}>
    <div className={`${darkMode ? "bg-zinc-800" : "bg-white"} p-6 rounded-lg max-w-md w-full text-center`}>
      <CollectStarsContent earnedStars={earnedStars} puzzleIndex={puzzleIndex} />
      <div className="flex gap-4 justify-center">
        <button
          onClick={onKeepPlaying}
          className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
        >
          Keep Playing
        </button>
        <button
          onClick={onNextPuzzle}
          className="px-4 py-2 bg-amber-500 text-black rounded hover:bg-amber-600"
        >
          Next Puzzle
        </button>
      </div>
    </div>
  </div>
);

interface HowToPlayModalProps extends ModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({
  darkMode,
  onClose,
  handleModalOutsideClick
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
       onClick={(e) => handleModalOutsideClick(e, onClose)}>
    <div className={`${darkMode ? "bg-zinc-800" : "bg-white"} p-6 rounded-lg max-w-md w-full space-y-4`}>
      <h2 className="text-2xl font-bold">How to Play</h2>
      <div className="space-y-4">
        <p>Use the numbers and operators to reach the target number. You can earn stars based on how efficiently you solve the puzzle:</p>
        
        <div className="space-y-2">
          <StarDescription stars={3} description="Use all numbers in a chain (each result feeds into the next operation)" />
          <StarDescription stars={2} description="Use all numbers (in any order)" />
          <StarDescription stars={1} description="Reach the target (using any number of moves)" />
        </div>

        <p className="text-sm text-zinc-400">
          💡 Tip: You can collect stars at any time and keep trying for more, but giving up will prevent earning more stars for the current puzzle.
        </p>
      </div>
      <button
        onClick={onClose}
        className="w-full bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
      >
        Got it!
      </button>
    </div>
  </div>
);

export const AboutModal: React.FC<ModalProps> = ({
  darkMode,
  onClose,
  handleModalOutsideClick
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
       onClick={(e) => handleModalOutsideClick(e, onClose)}>
    <div className={`${darkMode ? "bg-zinc-800" : "bg-white"} p-6 rounded-lg max-w-md w-full`}>
      <h2 className="text-xl font-bold mb-4">About Digits</h2>
      <p className="mb-4">A mathematical puzzle game where you combine numbers to reach a target. Challenge yourself with new puzzles every day!</p>
      <button
        onClick={onClose}
        className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
      >
        Close
      </button>
    </div>
  </div>
);

// Helper Components
const StatBox: React.FC<{ darkMode: boolean; value: number; label: string }> = ({ darkMode, value, label }) => (
  <div className={`${darkMode ? "bg-zinc-700" : "bg-zinc-100"} p-4 rounded-lg`}>
    <p className="text-3xl font-bold mb-1">{value}</p>
    <p className="text-sm text-zinc-400">{label}</p>
  </div>
);

const AverageStarsBox: React.FC<{
  darkMode: boolean;
  statistics: GameStatistics;
  getStarRating: (average: number) => { message: string; color: string };
}> = ({ darkMode, statistics, getStarRating }) => {
  const average = statistics.totalStars / statistics.daysPlayed;
  const rating = getStarRating(average);
  
  return (
    <div className={`${darkMode ? "bg-zinc-700" : "bg-zinc-100"} p-4 rounded-lg mb-6`}>
      <div className="flex items-baseline justify-center gap-2 mb-2">
        <p className="text-2xl font-bold">{average.toFixed(1)}</p>
        <p className="text-sm text-zinc-400">stars per day</p>
      </div>
      <p className={`${rating.color} text-lg font-medium`}>
        {rating.message}
      </p>
    </div>
  );
};

const StarDescription: React.FC<{ stars: number; description: string }> = ({ stars, description }) => (
  <p className="flex items-center gap-2">
    <span className="text-xl">{'⭐'.repeat(stars)}</span>
    <span>{description}</span>
  </p>
);

const CollectStarsContent: React.FC<{ earnedStars: number; puzzleIndex: number }> = ({ earnedStars, puzzleIndex }) => {
  if (earnedStars === 3) {
    return (
      <>
        <h2 className="text-2xl font-bold mb-4">🎉 Amazing Job! 🎉</h2>
        <p className="mb-4">You earned all 3 ⭐⭐⭐ stars on puzzle {puzzleIndex + 1} by using all numbers in a perfect chain!</p>
      </>
    );
  }
  
  if (earnedStars === 2) {
    return (
      <>
        <h2 className="text-xl font-bold mb-4">🎯 Great Work!</h2>
        <p className="mb-4">You earned 2 ⭐⭐ stars on puzzle {puzzleIndex + 1}! Want to try for 3 stars with a chain solution?</p>
      </>
    );
  }
  
  return (
    <>
      <h2 className="text-xl font-bold mb-4">👍 Good Job!</h2>
      <p className="mb-4">You earned 1 ⭐ star on puzzle {puzzleIndex + 1}! Want to try using more numbers for additional stars?</p>
    </>
  );
};