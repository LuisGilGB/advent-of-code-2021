import { readRawData, run } from "../../utils/utils";
import {
  buildLinesArray,
  getLinesReport,
  OPENING_BRACE,
  OPENING_BRACKET,
  OPENING_MARK,
  OPENING_PARENS,
} from "./first-puzzle";

const PENDING_CLOSING_CHAR_PENALTY_FACTOR = 5;

const UNCLOSED_CHAR_SCORE = {
  [OPENING_PARENS]: 1,
  [OPENING_BRACKET]: 2,
  [OPENING_BRACE]: 3,
  [OPENING_MARK]: 4,
};

const filterLegalLinesFromReport = (lineReports) =>
  lineReports.filter((lineReport) => !lineReport.isIllegal);

const calculateAutocompleteScore = (lineReport) =>
  lineReport.chunksStack.reduce((acc, char) => {
    acc *= PENDING_CLOSING_CHAR_PENALTY_FACTOR;
    acc += UNCLOSED_CHAR_SCORE[char];
    return acc;
  }, 0);

const getLinesScores = (lineReports) =>
  lineReports.map(calculateAutocompleteScore);

const getMiddleScore = (array) =>
  array.sort((a1, a2) => a2 - a1)[Math.floor(array.length / 2)];

const raw = readRawData("../10/data/data");
console.log(
  run(
    buildLinesArray,
    getLinesReport,
    filterLegalLinesFromReport,
    getLinesScores,
    getMiddleScore
  )(raw)
);
