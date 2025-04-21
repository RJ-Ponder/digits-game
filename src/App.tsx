import React from "react";
// import "./styles.css";
import Menu from "./components/Menu";
import Game from "./components/Game";
import useGameLogic from "./utils/useGameLogic";

const App: React.FC = () => {
    const {
        startingNumberSet,
        targetAndSolution,
        gameInfo,
        totalStars,
        numberSetHistory,
        currentMove,
        setStartingNumberSet,
        setGameInfo,
        setTargetAndSolution,
        setTotalStars,
        handleNumberClick,
        handleOperatorClick,
        handleUndoClick,
        handleCollectClick,
        earnedStars,
        selectedPosition,
        selectedOperator,
        moveHistory,
        startNewGame,
        gamesPlayed,
        zeroStarGames,
        oneStarGames,
        twoStarGames,
        threeStarGames,
        resetStatistics
    } = useGameLogic();

    const { target, solution } = targetAndSolution;

    return (
        <div id="app">
            <div id="main-content">
                <Menu
                    startNewGame={startNewGame}
                    solution = {solution}
                    resetStatistics={resetStatistics}
                />
                <Game 
                    startingNumberSet={startingNumberSet}
                    targetAndSolution={targetAndSolution}
                    gameInfo={gameInfo}
                    totalStars={totalStars}
                    numberSetHistory={numberSetHistory}
                    currentMove={currentMove}
                    setStartingNumberSet={setStartingNumberSet}
                    setGameInfo={setGameInfo}
                    setTargetAndSolution={setTargetAndSolution}
                    setTotalStars={setTotalStars}
                    handleNumberClick={handleNumberClick}
                    handleOperatorClick={handleOperatorClick}
                    handleUndoClick={handleUndoClick}
                    handleCollectClick={handleCollectClick}
                    earnedStars={earnedStars}
                    selectedPosition={selectedPosition}
                    selectedOperator={selectedOperator}
                    moveHistory={moveHistory}
                    startNewGame={startNewGame}
                    gamesPlayed={gamesPlayed}
                    zeroStarGames={zeroStarGames}
                    oneStarGames={oneStarGames}
                    twoStarGames={twoStarGames}
                    threeStarGames={threeStarGames}
                    resetStatistics={resetStatistics}
                />
            </div>
        </div>
    );
};

export default App;

// Notes:
// - try to collect as many stars as possible
// - max of 3 stars per game, can also earn 1 or 2
// - if you give up to see solution you lose the right to earn any more stars than what you already collected
// - when you choose to collect, you have the chance to keep playing for more stars or start a new game
// - keep track of the number of 1 star games, 2 star games, and 3 star games
// - have a way to reset all statistics
// - user clicks on the total stars to see the break down
// - find a way to obfuscate the data in local storage so it’s not easy for a user to cheat and modify the number of stars they have
// - do data validation when reading from local storage
// - if a user starts a new game they lose the chance to collect any more stars
// - add messaging for each of the paths
// - add instructions and a simple menu
// - allow the user to start as many new games as they want
// - handle case where user can modify local storage and get an error

// npm install crypto-js
// const CryptoJS = require('crypto-js');

// .env or .env.local file to store which you add to gitignore
// SECRET_KEY=YourSecretKeyHere

// require('dotenv').config();

// // Retrieve the secret key
// const secretKey = process.env.SECRET_KEY;

// Encryption:

// When saving data to local storage, encrypt the JSON object using a secret key:
// // Your JSON object
// const dataToEncrypt = { stars: 10, score: 100 };

// // Convert the JSON object to a string
// const jsonString = JSON.stringify(dataToEncrypt);

// // Secret encryption key (keep this secure)
// const secretKey = 'YourSecretKey';

// // Encrypt the data
// const encryptedData = CryptoJS.AES.encrypt(jsonString, secretKey).toString();

// // Save the encrypted data to local storage
// localStorage.setItem('encryptedData', encryptedData);

// Decryption:

// When retrieving data from local storage, decrypt it using the same secret key:
// // Retrieve the encrypted data from local storage
// const encryptedData = localStorage.getItem('encryptedData');

// // Secret decryption key (must be the same as the one used for encryption)
// const secretKey = 'YourSecretKey';

// // Decrypt the data
// const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);

// // Convert the decrypted bytes back to a JSON object
// const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));

// // Now you have the decrypted JSON object
// console.log(decryptedData);