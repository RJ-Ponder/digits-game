import React from "react";

interface GameProps {
  [key: string]: any; // Use this temporarily until you bring over real types
}

const Game: React.FC<GameProps> = (props) => {
  return <div>Game Component</div>;
};

export default Game;
