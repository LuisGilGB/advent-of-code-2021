import { getMax, readRawData, run } from "../../utils/utils";
import {
  buildSnailFishNumbersArray,
  calculateMagnitude,
  mapToMetanumbers,
  parseMetanumber,
  runMetaadditions,
} from "./first-puzzle";

const runTwoByTwoAdditions = (metanumbers) => {
  const additionsArray = [];
  for (let i = 0; i < metanumbers.length; i++) {
    for (let j = 0; j < metanumbers.length; j++) {
      if (i !== j) {
        additionsArray.push(runMetaadditions([metanumbers[i], metanumbers[j]]));
      }
    }
  }
  return additionsArray;
};

const calculateAdditionsMagnitudes = (additions) =>
  additions.map(run(parseMetanumber, calculateMagnitude));

console.log(
  run(
    readRawData,
    buildSnailFishNumbersArray,
    mapToMetanumbers,
    runTwoByTwoAdditions,
    calculateAdditionsMagnitudes,
    getMax
  )("../18/data/data")
);
