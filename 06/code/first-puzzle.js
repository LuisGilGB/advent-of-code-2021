import { readRawData, run } from "../../utils/utils";

const SEPARATOR = ',';
export const NEWBORN_TIMER = 8;
export const STANDARD_TIMER = 6;

export const buildInitialStateArray = raw => raw.split(SEPARATOR).map(value => +value);

const addNewLanternfish = lanternfishesArray => lanternfishesArray.push(NEWBORN_TIMER);

export const runDay = lanternfishesArray => {
  const newBorns = [];
  const updatedArray = lanternfishesArray.map(timerValue => {
    if (timerValue > 0) {
      return timerValue - 1;
    } else {
      addNewLanternfish(newBorns);
      return STANDARD_TIMER;
    }
  });
  lanternfishesArray = [...updatedArray, ...newBorns];
  return lanternfishesArray;
}
export const runForDaysSpan = days => lanternfishesArray => run(...new Array(days).fill(runDay))(lanternfishesArray);

export const countLanternfishes = lanternfishesArray => lanternfishesArray.length;

const raw = readRawData('../06/data/data');
console.log(run(buildInitialStateArray, runForDaysSpan(80), countLanternfishes)(raw))