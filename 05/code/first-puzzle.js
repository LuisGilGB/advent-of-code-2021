import { readRawData, run } from "../../utils/utils";

export const LINE_SEPARATOR = ' -> ';
export const COORD_SEPARATOR = ',';
export const EMPTY_CELL = '.';

export const buildVentLinesArray = raw => raw
  .split('\n')
  .map(lineRaw => lineRaw
    .split(LINE_SEPARATOR)
    .map(coord => coord
      .split(COORD_SEPARATOR)
    )
    .map(([column, row]) => ({
      column,
      row
    }))
  )

export const shareColumn = (pointA, pointB) => pointA.column === pointB.column;
export const shareRow = (pointA, pointB) => pointA.row === pointB.row;
const filterDiagonalLines = linesArray => linesArray.filter(([start, end]) => shareColumn(start, end) || shareRow(start, end));

const updateMaxThroughIteration = coordValueGetter => (currentMax, [start, end]) => {
  const candidateMax = Math.max(coordValueGetter(start), coordValueGetter(end));
  return currentMax < candidateMax ? candidateMax : currentMax;
}
export const initializeDiagram = linesArray => {
  const width = linesArray.reduce(updateMaxThroughIteration(coord => +coord.column), 0) + 1;
  const height = linesArray.reduce(updateMaxThroughIteration(coord => +coord.row), 0) + 1;
  // Array.fill is not suitable for this because that way we are passing the same reference to all the rows;
  let diagram = [];
  for (let rowIndex = 0; rowIndex < height; rowIndex++) {
    let row = [];
    for (let colIndex = 0; colIndex < width; colIndex++) {
      row.push(EMPTY_CELL);
    }
    diagram[rowIndex] = row;
  }
  return diagram;
}

export const printHorizontalAndVerticalLineOnDiagram = diagram => ([start, end]) => {
  if (shareColumn(start, end)) {
    const column = +start.column;
    const top = Math.min(+start.row, +end.row);
    const bottom = Math.max(+start.row, +end.row);
    for (let row = top; row <= bottom; row++) {
      if (diagram[row][column] !== EMPTY_CELL) {
        diagram[row][column]++;
      } else {
        diagram[row][column] = 1;
      }
    }
    return true;
  } else if (shareRow(start, end)) {
    const row = +start.row;
    const left = Math.min(+start.column, +end.column);
    const right = Math.max(+start.column, +end.column);
    for (let column = left; column <= right; column++) {
      if (diagram[row][column] !== EMPTY_CELL) {
        diagram[row][column]++;
      } else {
        diagram[row][column] = 1;
      }
    }
    return true;
  }
}

export const buildVentsDiagram = linePrinterFn => linesArray => {
  let diagram = initializeDiagram(linesArray);
  linesArray.forEach(linePrinterFn(diagram));
  return diagram;
}

export const countDangerousCells = ventsDiagram => ventsDiagram.reduce((acc, row) => {
  const countedInRow = row.reduce((acc, cell) => cell > 1 ? acc + 1 : acc, 0);
  return acc + countedInRow;
}, 0)

const raw = readRawData('../05/data/data');
console.log(run(buildVentLinesArray, filterDiagonalLines, buildVentsDiagram(printHorizontalAndVerticalLineOnDiagram), countDangerousCells)(raw));