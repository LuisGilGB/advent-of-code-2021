import {
  incrementOrStartCount,
  readRawData,
  reduceToValueCounts,
  run,
} from "../../utils/utils";
import { calculateMaxMinDifference, parseRawData } from "./first-puzzle";

const runInsertionsAsLoop =
  (stepsToDo = 0) =>
  ({ polymerTemplate, insertionPairs }) => {
    let formingPolymer = polymerTemplate;
    for (let i = stepsToDo; i > 0; i--) {
      let newPolymer = "";
      formingPolymer.split("").forEach((element, i, arr) => {
        newPolymer += element;
        const nextElement = arr[i + 1];
        const elementToInsert = insertionPairs[element + nextElement];
        if (elementToInsert) {
          newPolymer += elementToInsert;
        }
      });
      formingPolymer = newPolymer;
    }
    return formingPolymer;
  };

const runCountCalculation =
  (stepsToDo = 0) =>
  ({ polymerTemplate, insertionPairs }) => {
    const runStep = (currentCount, remainingSteps) => {
      if (remainingSteps > 0) {
        const newCount = { ...currentCount };
        Object.keys(currentCount).forEach((pair) => {
          const currentPairCount = currentCount[pair];
          const elementToInsert = insertionPairs[pair];
          const pairLeft = pair[0] + elementToInsert;
          const pairRight = elementToInsert + pair[1];
          newCount[pair] -= currentPairCount;
          incrementOrStartCount(currentPairCount)(newCount, pairLeft);
          incrementOrStartCount(currentPairCount)(newCount, pairRight);
        });
        return runStep(newCount, remainingSteps - 1);
      } else {
        return currentCount;
      }
    };
    const countAtTemplate = reduceToValueCounts(
      polymerTemplate
        .split("")
        .map((element, i, arr) => `${element}${arr[i + 1]}`)
        .filter((pair) => pair.length === 2)
    );
    return {
      polymerTemplate,
      pairsCount: runStep(countAtTemplate, stepsToDo),
    };
  };

const countElements = ({ polymerTemplate, pairsCount }) => {
  const pairElementsCount = Object.keys(pairsCount).reduce((acc, pair) => {
    const pairCount = pairsCount[pair];
    incrementOrStartCount(pairCount)(acc, pair[0]);
    incrementOrStartCount(pairCount)(acc, pair[1]);
    return acc;
  }, {});
  const elementsCount = Object.keys(pairElementsCount).reduce(
    (acc, element) => {
      const elementCount = pairElementsCount[element];
      // Math.ceil because the odd values are because of the leftmost and rightmost elements in the template, which appear only in one pair each one.
      acc[element] = Math.ceil(elementCount / 2);
      return acc;
    },
    {}
  );
  return elementsCount;
};

console.log(
  run(
    readRawData,
    parseRawData,
    runCountCalculation(40),
    countElements,
    calculateMaxMinDifference
  )("../14/data/data")
);
