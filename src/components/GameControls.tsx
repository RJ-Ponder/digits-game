import React from 'react';

interface GameControlsProps {
  operators: { sign: string; fn: (a: number, b: number) => number }[];
  firstOperandNumber: number | null;
  selectedOperator: string | null;
  handleOperatorClick: (fn: (a: number, b: number) => number, sign: string) => void;
  handleUndoClick: () => void;
  darkMode: boolean;
}

const GameControls: React.FC<GameControlsProps> = ({
  operators,
  firstOperandNumber,
  selectedOperator,
  handleOperatorClick,
  handleUndoClick,
  darkMode,
}) => (
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
);

export default GameControls;