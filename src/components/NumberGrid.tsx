import React from 'react';

interface NumberGridProps {
  numbers: (number | null)[];
  selectedPosition: number | null;
  shakePosition: number | null;
  handleNumberClick: (position: number) => void;
  darkMode: boolean;
}

const NumberGrid: React.FC<NumberGridProps> = ({
  numbers,
  selectedPosition,
  shakePosition,
  handleNumberClick,
  darkMode,
}) => (
  <div className="grid grid-cols-3 gap-4">
    {numbers.map((num, idx) => (
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
);

export default NumberGrid;