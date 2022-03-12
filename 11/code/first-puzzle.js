import {
  checkEveryMatrixCellIsEqualTo,
  numberify,
  readRawData,
  run,
} from "../../utils/utils";

const FLASH_TRIGGER = 9;

export const buildOctopusesMatrix = (raw) =>
  raw.split("\n").map((row) => row.split("").map(numberify));

const SEPARATOR = "-";
const getCellKey = (rowIndex, colIndex) => `${rowIndex}${SEPARATOR}${colIndex}`;

const incrementAdjacents =
  (incrementValue) => (matrix) => (rowIndex, colIndex) => {
    const incrementShiftedCell = (rowShift, colShift) => {
      const shiftedCell = matrix[rowIndex + rowShift]?.[colIndex + colShift];
      if (shiftedCell !== undefined) {
        matrix[rowIndex + rowShift][colIndex + colShift] += incrementValue;
      }
    };
    incrementShiftedCell(1, 0);
    incrementShiftedCell(-1, 0);
    incrementShiftedCell(0, 1);
    incrementShiftedCell(0, -1);
    incrementShiftedCell(1, 1);
    incrementShiftedCell(-1, 1);
    incrementShiftedCell(1, -1);
    incrementShiftedCell(-1, -1);
  };

const batchFlashingLights = (matrix) => {
  const batch = {};
  const pushToBatch = (rowIndex, colIndex) => {
    batch[getCellKey(rowIndex, colIndex)] = true;
  };

  const runBatchingCycle = (prevBatchLength = 0) => {
    matrix.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const cellKey = getCellKey(rowIndex, colIndex);
        if (!batch[cellKey] && cell > FLASH_TRIGGER) {
          pushToBatch(rowIndex, colIndex);
          incrementAdjacents(1)(matrix)(rowIndex, colIndex);
        }
      });
    });
    const newBatchLength = Object.keys(batch).length;
    if (prevBatchLength !== newBatchLength) {
      runBatchingCycle(newBatchLength);
    }
  };
  runBatchingCycle();

  return {
    flashesBatch: Object.keys(batch),
    matrixStatus: matrix,
  };
};

const incrementEveryCell = (incrementValue) => (matrix) =>
  matrix.map((row) => row.map((cell) => cell + incrementValue));

export const runMatrix = (steps) => (octopusesMatrix) => {
  let flashingCount = 0;
  let firstSyncStep = undefined;

  const postFlashReset = ({ flashesBatch, matrixStatus }) => {
    flashesBatch.forEach((cellKey) => {
      const [rowIndex, colIndex] = cellKey.split(SEPARATOR);
      matrixStatus[rowIndex][colIndex] = 0;
      flashingCount++;
    });
    return matrixStatus;
  };

  const runStep = (matrixStatus) => {
    return run(
      incrementEveryCell(1),
      batchFlashingLights,
      postFlashReset
    )(matrixStatus);
  };

  const recursion = (stepNumber = 1, matrix = octopusesMatrix) => {
    if (stepNumber <= steps) {
      const postUpdateMatrix = runStep(matrix);
      if (
        firstSyncStep === undefined &&
        checkEveryMatrixCellIsEqualTo(0)(postUpdateMatrix)
      ) {
        firstSyncStep = stepNumber;
      }
      recursion(stepNumber + 1, postUpdateMatrix);
    }
  };

  recursion();
  return {
    flashingCount,
    firstSyncStep,
  };
};

console.log(
  run(readRawData, buildOctopusesMatrix, runMatrix(100))("../11/data/data")
);
