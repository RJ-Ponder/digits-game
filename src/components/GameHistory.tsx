import React from 'react';

interface GameHistoryProps {
  darkMode: boolean;
  showSolution: boolean;
  solution: string[];
  moveHistory: string[];
}

const GameHistory: React.FC<GameHistoryProps> = ({
  darkMode,
  showSolution,
  solution,
  moveHistory,
}) => (
  <div className="w-full flex flex-col gap-2">
    {showSolution && (
      <details className={`${darkMode ? "bg-zinc-800 border-zinc-700" : "bg-zinc-100 border-zinc-300"} w-full border rounded`}
               open={showSolution}>
        <summary className="cursor-pointer font-semibold text-lg px-4 py-2">💡 Solution</summary>
        <div className="px-4 pb-4">
          <div className="space-y-2 mt-2">
            {solution.map((step, index) => (
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
);

export default GameHistory;