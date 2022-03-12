import { numberify, readRawData, run } from "../../utils/utils";

const FOLD_ALONG_LABEL = "fold along ";

const EMPTY_CELL = ".";
const DOTTED_CELL = "#";

const X_AXIS = "x";
const Y_AXIS = "y";

export const translateRaw = (raw) => {
  const [rawDots, rawFoldInstructions] = raw.split("\n\n");
  const dots = rawDots
    .split("\n")
    .map((dotString) => dotString.split(",").map(numberify));
  const foldInstructions = rawFoldInstructions
    .split("\n")
    .map((instruction) => {
      const slice = instruction.slice(FOLD_ALONG_LABEL.length);
      const [refAxis, rawPosition] = slice.split("=");
      return [refAxis, +rawPosition];
    });
  return {
    dots,
    foldInstructions,
  };
};

export const buildPaperMatrix = ({ dots, foldInstructions }) => {
  const numberOfColumns =
    Math.max(...dots.map((coordinates) => coordinates[0])) + 1;
  const numberOfRows =
    Math.max(...dots.map((coordinates) => coordinates[1])) + 1;
  const rowLength = Math.max(...dots.map((coordinates) => coordinates[0]));
  const matrix = new Array(numberOfRows)
    .fill()
    .map((row) => new Array(numberOfColumns).fill(EMPTY_CELL));
  dots.forEach(([x, y]) => {
    matrix[y][x] = DOTTED_CELL;
  });
  return {
    foldInstructions,
    matrix,
  };
};

export const doFold = ({ foldInstructions, matrix }) => {
  const [refAxis, foldPosition] = foldInstructions[0];
  let foldedMatrix;
  if (refAxis === X_AXIS) {
    const leftMatrix = matrix.map((row) =>
      row.filter((v, i) => i < foldPosition)
    );
    const rightMatrix = matrix.map((row) =>
      row.filter((v, i) => i > foldPosition)
    );
    foldedMatrix = leftMatrix.map((row, rowIndex) =>
      row.map((cell, colIndex) =>
        cell === DOTTED_CELL
          ? cell
          : rightMatrix[rowIndex][row.length - colIndex - 1]
      )
    );
  } else {
    const upperMatrix = matrix.filter((row, i) => i < foldPosition);
    const lowerMatrix = matrix.filter((row, i) => i > foldPosition);
    foldedMatrix = upperMatrix.map((row, rowIndex) =>
      row.map((cell, colIndex) =>
        cell === DOTTED_CELL
          ? cell
          : lowerMatrix[upperMatrix.length - rowIndex - 1]?.[colIndex] ||
            EMPTY_CELL
      )
    );
  }
  return {
    foldInstructions: foldInstructions.slice(1),
    foldedMatrix,
  };
};

export const doFolds =
  (maxFolds = 0) =>
  (count = 0) =>
  ({ foldInstructions, matrix }) => {
    if (maxFolds ? count < maxFolds : foldInstructions.length > 0) {
      const { foldInstructions: remainingFoldInstructions, foldedMatrix } =
        doFold({
          foldInstructions,
          matrix,
        });
      return doFolds(maxFolds)(count + 1)({
        foldInstructions: remainingFoldInstructions,
        matrix: foldedMatrix,
      });
    }
    return matrix;
  };

export const countDots = (matrix) =>
  matrix.reduce(
    (acc, row) => acc + row.filter((cell) => cell === DOTTED_CELL).length,
    0
  );

console.log(
  run(
    readRawData,
    translateRaw,
    buildPaperMatrix,
    doFolds(1)(),
    countDots
  )("../13/data/data")
);
