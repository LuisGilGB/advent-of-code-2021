import { multiplyItems, numberify, readRawData, run } from "../../utils/utils";
import { buildRiskMatrix, pickLowPoints } from "./first-puzzle";

const HIGHEST_POINT = 9;

const shiftReadFn =
  (fn) =>
  (matrix) =>
  (readsArray) =>
  (rowIndex, colIndex) =>
  (rowShift = 0, colShift = 0) => {
    fn(matrix)(readsArray)(rowIndex, colIndex)(
      rowIndex + rowShift,
      colIndex + colShift
    );
  };

const expandBasinRead =
  (riskMatrix) =>
  (basinArray = []) =>
  (sourceRowIndex, sourceColIndex) =>
  (targetRowIndex, targetColIndex) => {
    const sourceValue = riskMatrix[sourceRowIndex][sourceColIndex];
    const targetValue = riskMatrix[targetRowIndex]?.[targetColIndex];
    if (
      targetValue !== undefined &&
      targetValue !== HIGHEST_POINT &&
      targetValue > sourceValue
    ) {
      basinArray.push({
        value: targetValue,
        rowIndex: targetRowIndex,
        colIndex: targetColIndex,
      });
      const shiftRead = shiftReadFn(expandBasinRead)(riskMatrix)(basinArray)(
        targetRowIndex,
        targetColIndex
      );
      shiftRead(1, 0);
      shiftRead(-1, 0);
      shiftRead(0, 1);
      shiftRead(0, -1);
    }
    return basinArray;
  };

const getBasin = (riskMatrix) => (rowIndex, colIndex) => {
  const basinArray = [
    {
      value: riskMatrix[rowIndex][colIndex],
      rowIndex,
      colIndex,
    },
  ];
  const shiftRead = shiftReadFn(expandBasinRead)(riskMatrix)(basinArray)(
    rowIndex,
    colIndex
  );
  shiftRead(1, 0);
  shiftRead(-1, 0);
  shiftRead(0, 1);
  shiftRead(0, -1);
  return basinArray;
};

const filterRepeatedPoints = (basin) => {
  const indexes = basin.reduce((acc, point) => {
    acc[`${point.rowIndex}-${point.colIndex}`] = point.value;
    return acc;
  }, {});
  return Object.keys(indexes).map((key) => {
    const [rowIndex, colIndex] = key.split("-").map(numberify);
    return {
      value: indexes[key],
      rowIndex,
      colIndex,
    };
  });
};

const getBasins = (riskMatrix) => {
  const lowPointsArray = pickLowPoints(riskMatrix);
  return lowPointsArray.map(({ rowIndex, colIndex }) =>
    filterRepeatedPoints(getBasin(riskMatrix)(rowIndex, colIndex))
  );
};

const sortBasinsBySize = (basinsArray) =>
  basinsArray.sort((a1, a2) => a2.length - a1.length);

const pickFirstThree = (array) => array.slice(0, 3);

const getSizes = (basins) => basins.map((basin) => basin.length);

const raw = readRawData("../09/data/data");
console.log(
  run(
    buildRiskMatrix,
    getBasins,
    sortBasinsBySize,
    pickFirstThree,
    getSizes,
    multiplyItems
  )(raw)
);
