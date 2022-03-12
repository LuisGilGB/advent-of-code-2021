import { readRawData, run, sumArrayItems } from "../../utils/utils";
import { NEWBORN_TIMER, STANDARD_TIMER, buildInitialStateArray } from "./first-puzzle";

const initializeCountsObject = () => new Array(Math.max(NEWBORN_TIMER, STANDARD_TIMER)).fill(0)
  .reduce((acc, value, i) => ({...acc, [i]: 0}), {});

const buildInitialCountsObject = lanternfishesArray => lanternfishesArray.reduce((acc, value) => {
    acc[value]++;
    return acc;
  }, initializeCountsObject()
);

const runDay = countsObject => Object.keys(countsObject).reduce((acc, key) => {
    acc[key > 0 ? key - 1 : STANDARD_TIMER] += countsObject[key];
    return acc;
  }, {...initializeCountsObject(), [NEWBORN_TIMER]: countsObject[0]});

const runForDaysSpan = days => countsObject => run(...new Array(days).fill(runDay))(countsObject);

const countLanternfishes = countsObject => sumArrayItems(Object.values(countsObject));

const raw = readRawData('../06/data/data');
console.log(run(buildInitialStateArray, buildInitialCountsObject, runForDaysSpan(256), countLanternfishes)(raw));
