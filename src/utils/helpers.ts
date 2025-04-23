import { v4 as uuidv4 } from "uuid";
import { TargetAndSolution, DailyPuzzle } from "../types";
import CryptoJS from 'crypto-js';

// Constants
const NUMBER_SET_SIZE = 6;
const NUMBER_SET_MIN = 1;
const NUMBER_SET_MAX = 15;
const TARGET_MIN = -25;
const TARGET_MAX = 50;
const PUZZLES_PER_DAY = 5;
const ENCRYPTION_KEY = 'digits-game-v1'; // Base encryption key
const DAILY_SEEDS = [
  'morning-puzzle',
  'noon-puzzle',
  'afternoon-puzzle',
  'evening-puzzle',
  'night-puzzle'
];

// Helper function to generate a daily encryption key
function getDailyEncryptionKey() {
  const date = new Date();
  const easternDate = new Date(date.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const dateString = `${easternDate.getFullYear()}-${easternDate.getMonth()}-${easternDate.getDate()}`;
  return ENCRYPTION_KEY + '-' + dateString;
}

export function getDailyPuzzleSeed() {
  const date = new Date();
  const easternDate = new Date(date.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  return `${easternDate.getFullYear()}-${easternDate.getMonth()}-${easternDate.getDate()}`;
}

// Deterministic random number generator using a seed string
function seededRandom(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }
  const x = Math.sin(hash) * 10000;
  return x - Math.floor(x);
}

function getRandomIntWithSeed(min: number, max: number, seed: string) {
  const random = seededRandom(seed);
  return Math.floor(random * (max - min + 1)) + min;
}

export function generateDailyPuzzles(): DailyPuzzle[] {
  const seed = getDailyPuzzleSeed();
  const puzzles: DailyPuzzle[] = [];

  for (let i = 0; i < PUZZLES_PER_DAY; i++) {
    // Use consistent daily seeds for each puzzle
    const puzzleSeed = `${seed}-${DAILY_SEEDS[i]}`;
    const numberSet = generateNumberSetWithSeed(puzzleSeed);
    const { target, solution } = generateTargetAndSolution(numberSet, puzzleSeed);
    puzzles.push({
      id: i,
      numberSet,
      target,
      solution,
      stars: 0,
      solutionShown: false
    });
  }

  return puzzles;
}

export function generateNumberSetWithSeed(seed: string): number[] {
  const numberSet: number[] = [];
  
  // Generate numbers in a deterministic order
  for (let i = 0; i < NUMBER_SET_SIZE; i++) {
    let num;
    let attempts = 0;
    do {
      num = getRandomIntWithSeed(
        NUMBER_SET_MIN,
        NUMBER_SET_MAX,
        `${seed}-number-${i}-${attempts}`
      );
      attempts++;
    } while (numberSet.includes(num) && attempts < 100);
    
    if (!numberSet.includes(num)) {
      numberSet.push(num);
    }
  }

  return numberSet.sort((a, b) => a - b);
}

function shuffle<T>(array: T[], seed: string): T[] {
  const shuffled = [...array];
  let currentIndex = shuffled.length;
  
  while (currentIndex > 0) {
    const randomIndex = Math.floor(seededRandom(`${seed}-${currentIndex}`) * currentIndex);
    currentIndex--;
    
    [shuffled[currentIndex], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[currentIndex]
    ];
  }
  
  return shuffled;
}

export function generateTargetAndSolution(numberSet: (number | null)[], seed?: string): TargetAndSolution {
  const validNumbers = numberSet.filter((n): n is number => n !== null);
  const shuffled = shuffle([...validNumbers], seed || Date.now().toString());
  let target = shuffled[0];
  const solution: string[] = [];

  // Use deterministic operations
  for (let i = 1; i < shuffled.length; i++) {
    const operation = performValidRandomOperation(target, shuffled[i], `${seed}-operation-${i}`);
    target = operation.result;
    solution.push(operation.operationText);
  }

  return { target, solution };
}

function performValidRandomOperation(num1: number, num2: number, seed: string) {
  let operation;
  let attempts = 0;
  let isValid = false;

  while (!isValid && attempts < 100) {
    operation = performRandomOperation(num1, num2, `${seed}-attempt-${attempts}`);
    isValid = isValidResult(operation.result);
    attempts++;
  }

  if (!isValid) {
    // Fallback to addition if no valid operation found
    const result = num1 + num2;
    return {
      result,
      operationText: `${num1} + ${num2} = ${result}`
    };
  }

  return operation;
}

function performRandomOperation(num1: number, num2: number, seed: string) {
  const operations = [
    { operator: "+", operation: (a: number, b: number) => a + b },
    { operator: "-", operation: (a: number, b: number) => a - b },
    { operator: "×", operation: (a: number, b: number) => a * b },
    { operator: "÷", operation: (a: number, b: number) => a / b }
  ];

  const random = seededRandom(seed);
  const index = Math.floor(random * operations.length);
  const choice = operations[index];
  const result = choice.operation(num1, num2);
  const operationText = `${num1} ${choice.operator} ${num2} = ${result}`;

  return { result, operationText };
}

function isValidResult(result: number): boolean {
  return Number.isInteger(result) && result < TARGET_MAX && result > TARGET_MIN;
}

export function generateGameInfo() {
  return { id: uuidv4(), stars: 0 };
}

export function saveDataToLocalStorage(key: string, data: any, append = false): void {
  try {
    let dataToSave = data;
    
    if (append) {
      const existing = loadDataFromLocalStorage(key);
      const existingData = existing || {};
      dataToSave = { ...existingData, ...data };
    }

    // Encrypt the data before saving
    const encryptedData = CryptoJS.AES.encrypt(
      JSON.stringify(dataToSave),
      getDailyEncryptionKey()
    ).toString();
    
    localStorage.setItem(key, encryptedData);
  } catch (error) {
    console.error('Error saving encrypted data:', error);
  }
}

export function loadDataFromLocalStorage<T>(key: string): T | null {
  try {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;

    // Try to decrypt with today's key
    try {
      const decrypted = CryptoJS.AES.decrypt(encrypted, getDailyEncryptionKey());
      const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
      if (decryptedString) {
        return JSON.parse(decryptedString) as T;
      }
    } catch (error) {
      console.error('Error decrypting data:', error);
    }

    // If decryption fails, data might be old/invalid, remove it
    localStorage.removeItem(key);
    return null;
  } catch (error) {
    console.error('Error loading encrypted data:', error);
    return null;
  }
}
