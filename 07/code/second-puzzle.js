import { buildNumbersArray, readRawData, run, sumArrayItems } from "../../utils/utils";
import { countOptimizedFuelExpenditure } from "./first-puzzle";

const calculateTotalCost = positionsArray => target => sumArrayItems(positionsArray.map(position => {
  const distance = Math.abs(position - target);
  // 1 + 2 + 3 + 4 + ... + n = ∑i (i: [1,n]) = n(n + 1)/2
  const arithmeticSeriesSum = distance * (distance + 1)/2;
  return arithmeticSeriesSum;
}));


const raw = readRawData('../07/data/data');
console.log(run(buildNumbersArray, countOptimizedFuelExpenditure(calculateTotalCost))(raw));
