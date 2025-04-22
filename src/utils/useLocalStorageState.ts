import { useState, useEffect } from "react";
import { loadDataFromLocalStorage, saveDataToLocalStorage } from "./helpers";

function useLocalStorageState<T>(
  key: string,
  defaultValue: T,
  calculate: (val: any) => T = (v) => v
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    const loaded = loadDataFromLocalStorage(key);
    const valueToSave = loaded !== null ? calculate(loaded) : defaultValue;
    saveDataToLocalStorage(key, valueToSave);
    return valueToSave;
  });

  useEffect(() => {
    saveDataToLocalStorage(key, state);
  }, [key, state]);

  return [state, setState];
}

export default useLocalStorageState;
