import React from "react";
import "./App.css";
import Game from "./components/Game";

const App: React.FC = () => {
    return (
        <div id="app">
            <div id="main-content">
                <Game />
            </div>
        </div>
    );
};

export default App;