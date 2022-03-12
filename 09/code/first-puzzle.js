import { numberify, readRawData, run, sumArrayItems } from "../../utils/utils";

export const buildRiskMatrix = (raw) =>
  raw.split("\n").map((row) => row.split("").map(numberify));

const isLowPoint = (riskMatrix) => (rowIndex, colIndex) => {
  const value = riskMatrix[rowIndex][colIndex];
  const adjacentValues = [];

  const pushAdjacentIfExists = (rowShift = 0, colShift = 0) => {
    const adjacentValue =
      riskMatrix[rowIndex + rowShift]?.[colIndex + colShift];
    if (adjacentValue !== undefined) {
      adjacentValues.push(adjacentValue);
    }
  };

  pushAdjacentIfExists(-1, 0);
  pushAdjacentIfExists(1, 0);
  pushAdjacentIfExists(0, -1);
  pushAdjacentIfExists(0, 1);

  return value < Math.min(...adjacentValues);
};

export const pickLowPoints = (riskMatrix) => {
  const lowPoints = [];
  riskMatrix.forEach((rowArray, rowIndex) => {
    rowArray.forEach((value, colIndex) => {
      if (isLowPoint(riskMatrix)(rowIndex, colIndex)) {
        lowPoints.push({
          value,
          rowIndex,
          colIndex,
        });
      }
    });
  });
  return lowPoints;
};

const getValues = (pointsArray) => pointsArray.map(({ value }) => value);

const getTotalRiskLevel = (input = []) => sumArrayItems(input) + input.length;

const raw = readRawData("../09/data/data");
console.log(
  run(buildRiskMatrix, pickLowPoints, getValues, getTotalRiskLevel)(raw)
);
