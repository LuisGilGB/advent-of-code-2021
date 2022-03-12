import { readRawData, run } from "../../utils/utils";
import { buildVentLinesArray, buildVentsDiagram, countDangerousCells, EMPTY_CELL, printHorizontalAndVerticalLineOnDiagram, shareColumn, shareRow } from "./first-puzzle";

const has45DegreesDirection = (start, end) => Math.abs(start.column - end.column) === Math.abs(start.row - end.row);
const filterNon45DegreesDiagonalLines = linesArray => linesArray.filter(([start, end]) =>
  shareColumn(start, end) ||
  shareRow(start, end) ||
  has45DegreesDirection(start, end)
);

const printLines = diagram => ([start, end]) => {
  if (!printHorizontalAndVerticalLineOnDiagram(diagram)([start, end])) {
    const topBottomDirection = +start.row < +end.row;
    const leftRightDirection = +start.column < +end.column;
    const length = Math.abs(+start.row - +end.row) + 1;
    for (let i = 0; i < length; i++) {
      const row = +start.row + (topBottomDirection ? i : -i);
      const column = +start.column + (leftRightDirection ? i : -i);
      if (diagram[row][column] !== EMPTY_CELL) {
        diagram[row][column]++;
      } else {
        diagram[row][column] = 1;
      }
    }
  }
}

const raw = readRawData('../05/data/data');
console.log(run(buildVentLinesArray, filterNon45DegreesDiagonalLines, buildVentsDiagram(printLines), countDangerousCells)(raw));