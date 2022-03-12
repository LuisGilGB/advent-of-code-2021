import { buildNumbersArray, readRawData, run, sumArrayItems } from "../../utils/utils";

// Individual fuel cost: cost = Math.abs(myPosition - target)
// Total fuel cost: ∑cost = total = ∑(Math.abs(pos(i) - target))
// I'm sure this can be solved as a linear regression problem
// (as an optimization problem of the target that minimizes the sum
// of the squares of the distances, speaking more precisely),
// but I need to check notes because I must be doing some kind of mistake
// because I'm getting that the optimum target is the mean of the positions
// and that's wrong if trying with that value against the test data.

const sortArray = array => array.sort();

const searchFromTheMedian = functionToOptimize => array => {
  const halfIndex = Math.round(array.length/2);
  const optimizeValue = testValue => {
    const testValueResult = functionToOptimize(testValue);
    // Obviously, there's room to optimize this by avoiding redundant operations
    if (functionToOptimize(testValue + 1) < testValueResult) {
      return optimizeValue(testValue + 1);
    } else if (functionToOptimize(testValue - 1) < testValueResult) {
      return optimizeValue(testValue - 1);
    }
    return testValue;
  }
  return optimizeValue(array[halfIndex])
}

const calculateTotalCost = positionsArray => target => sumArrayItems(positionsArray.map(position => Math.abs(position - target)));

const calculateTargetPosition = calculateTotalCost => positionsArray => run(sortArray, searchFromTheMedian(calculateTotalCost(positionsArray)))(positionsArray);

export const countOptimizedFuelExpenditure = calculateTotalCost => positionsArray => {
  const targetPosition = calculateTargetPosition(calculateTotalCost)(positionsArray);
  const totalCost = calculateTotalCost(positionsArray)(targetPosition);
  return totalCost;
}

const raw = readRawData('../07/data/data');
console.log(run(buildNumbersArray, countOptimizedFuelExpenditure(calculateTotalCost))(raw));
