import React from "react";

interface MenuProps {
  startNewGame: () => void;
  solution: string;
  resetStatistics: () => void;
}

const Menu: React.FC<MenuProps> = ({ startNewGame, solution, resetStatistics }) => {
  return <div>Menu Component</div>;
};

export default Menu;
