import { v4 as uuidv4 } from "uuid";
import { TargetAndSolution } from "../types";

// Constants
const NUMBER_SET_SIZE = 6;
const NUMBER_SET_MIN = 1;
const NUMBER_SET_MAX = 15;
const TARGET_MIN = -20;
const TARGET_MAX = 50;

export function generateNumberSet(): number[] {
  const numberSet: number[] = [];

  while (numberSet.length < NUMBER_SET_SIZE) {
    const randomInt = getRandomIntInclusive(NUMBER_SET_MIN, NUMBER_SET_MAX);
    if (!numberSet.includes(randomInt)) {
      numberSet.push(randomInt);
    }
  }

  return numberSet.sort((a, b) => a - b);
}

function getRandomIntInclusive(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function generateTargetAndSolution(numberSet: (number | null)[]): TargetAndSolution {
  // Filter out null values and convert to number[]
  const validNumbers = numberSet.filter((n): n is number => n !== null);
  const shuffled = shuffle([...validNumbers]);
  let target = shuffled[0];
  const solution: string[] = [];

  for (let i = 1; i < shuffled.length; i++) {
    const operation = performValidRandomOperation(target, shuffled[i]);
    target = operation.result;
    solution.push(operation.operationText);
  }

  return { target, solution };
}

function shuffle<T>(array: T[]): T[] {
  return array.sort(() => Math.random() - 0.5);
}

function performValidRandomOperation(num1: number, num2: number) {
  let operation;
  let isValid = false;

  while (!isValid) {
    operation = performRandomOperation(num1, num2);
    isValid = isValidResult(operation.result);
  }

  return operation;
}

function performRandomOperation(num1: number, num2: number) {
  const operations = [
    { operator: "+", operation: (a: number, b: number) => a + b },
    { operator: "-", operation: (a: number, b: number) => a - b },
    { operator: "×", operation: (a: number, b: number) => a * b },
    { operator: "÷", operation: (a: number, b: number) => a / b },
    { operator: "÷", operation: (a: number, b: number) => a / b },
    { operator: "÷", operation: (a: number, b: number) => a / b }
  ];

  const choice = operations[Math.floor(Math.random() * operations.length)];
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
  if (append) {
    const existing = localStorage.getItem(key);
    const existingData = existing ? JSON.parse(existing) : {};
    const updated = { ...existingData, ...data };
    localStorage.setItem(key, JSON.stringify(updated));
  } else {
    localStorage.setItem(key, JSON.stringify(data));
  }
}

export function loadDataFromLocalStorage<T>(key: string): T | null {
  const raw = localStorage.getItem(key);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error("Error parsing localStorage data:", err);
    return null;
  }
}
