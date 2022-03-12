import { readRawData, run } from "../../utils/utils";
import {
  buildMatrixFromRaw,
  builGraphdMapForDijkstra,
  runDijkstra,
} from "./first-puzzle";

const MATRIX_EXPANSION_FACTOR = 5;
const OVERFLOW_TRIGGER = 9;

const calcShiftIncrement = (delta) => (value) =>
  value + delta > OVERFLOW_TRIGGER
    ? value + delta - OVERFLOW_TRIGGER
    : value + delta;

const expandMatrix = (matrix) => {
  let finalMatrix = [];
  for (let i = 0; i < MATRIX_EXPANSION_FACTOR; i++) {
    const horizontalMatrixBase = matrix.map((row) =>
      row.map(calcShiftIncrement(i))
    );
    let horizontalSubMatrix = [...horizontalMatrixBase];
    for (let j = 1; j < MATRIX_EXPANSION_FACTOR; j++) {
      horizontalSubMatrix = horizontalSubMatrix.map((row, i) => [
        ...row,
        ...horizontalMatrixBase[i].map(calcShiftIncrement(j)),
      ]);
    }
    finalMatrix = [...finalMatrix, ...horizontalSubMatrix];
  }
  return finalMatrix;
};

const execute = async () => {
  const result = run(
    readRawData,
    buildMatrixFromRaw,
    expandMatrix,
    builGraphdMapForDijkstra
  )("../15/data/data");
  const dijkstraResult = await runDijkstra(result);
  console.log(dijkstraResult);
};

execute();
