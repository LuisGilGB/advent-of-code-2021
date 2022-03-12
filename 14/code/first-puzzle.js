import { readRawData, run } from "../../utils/utils";

const INSERTION_PAIR_SEPARATOR = " -> ";

export const parseRawData = (raw) => {
  const [polymerTemplate, insertionPairsRaw] = raw.split("\n\n");
  const insertionPairs = insertionPairsRaw
    .split("\n")
    .map((pair) => pair.split(INSERTION_PAIR_SEPARATOR))
    .reduce((acc, pair) => {
      acc[pair[0]] = pair[1];
      return acc;
    }, {});

  return {
    polymerTemplate,
    insertionPairs,
  };
};

export const runInsertions =
  (stepsToDo = 0) =>
  ({ polymerTemplate, insertionPairs }) => {
    const runStep = (polymer, remainingSteps) => {
      if (remainingSteps > 0) {
        let newPolymer = "";
        polymer.split("").forEach((element, i, arr) => {
          newPolymer += element;
          const nextElement = arr[i + 1];
          const elementToInsert = insertionPairs[element + nextElement];
          if (elementToInsert) {
            newPolymer += elementToInsert;
          }
        });
        return runStep(newPolymer, remainingSteps - 1);
      } else {
        return polymer;
      }
    };
    return runStep(polymerTemplate, stepsToDo);
  };

export const countElements = (polymer) =>
  polymer.split("").reduce((acc, element) => {
    if (acc[element]) {
      acc[element]++;
    } else {
      acc[element] = 1;
    }
    return acc;
  }, {});

export const calculateMaxMinDifference = (elementsCounts) =>
  Math.max(...Object.values(elementsCounts)) -
  Math.min(...Object.values(elementsCounts));

console.log(
  run(
    readRawData,
    parseRawData,
    runInsertions(10),
    countElements,
    calculateMaxMinDifference
  )("../14/data/data")
);
