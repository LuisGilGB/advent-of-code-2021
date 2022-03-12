import { readRawData, run } from "../../utils/utils";

export const OPENING = "OPENING";
export const CLOSING = "CLOSING";

export const OPENING_PARENS = "(";
export const OPENING_BRACKET = "[";
export const OPENING_BRACE = "{";
export const OPENING_MARK = "<";

export const CLOSING_PARENS = ")";
export const CLOSING_BRACKET = "]";
export const CLOSING_BRACE = "}";
export const CLOSING_MARK = ">";

export const CHAR_TYPE_MAP = {
  [OPENING_PARENS]: OPENING,
  [OPENING_BRACKET]: OPENING,
  [OPENING_BRACE]: OPENING,
  [OPENING_MARK]: OPENING,
  [CLOSING_PARENS]: CLOSING,
  [CLOSING_BRACKET]: CLOSING,
  [CLOSING_BRACE]: CLOSING,
  [CLOSING_MARK]: CLOSING,
};

export const MATCHING_CLOSING_CHAR_MAP = {
  [OPENING_PARENS]: CLOSING_PARENS,
  [OPENING_BRACKET]: CLOSING_BRACKET,
  [OPENING_BRACE]: CLOSING_BRACE,
  [OPENING_MARK]: CLOSING_MARK,
};

export const ILLEGALITY_SCORE = {
  [CLOSING_PARENS]: 3,
  [CLOSING_BRACKET]: 57,
  [CLOSING_BRACE]: 1197,
  [CLOSING_MARK]: 25137,
};

export const buildLinesArray = (raw) =>
  raw.split("\n").map((line) => line.split(""));

const buildLineReport = (line) => {
  let currentChunkStack = [];
  return line.reduce(
    (acc, char, i) => {
      if (acc.isIllegal) {
        return acc;
      }
      const charType = CHAR_TYPE_MAP[char];
      if (charType === OPENING) {
        currentChunkStack = [char, ...currentChunkStack];
      } else if (charType === CLOSING) {
        if (MATCHING_CLOSING_CHAR_MAP[currentChunkStack[0]] === char) {
          currentChunkStack = currentChunkStack.slice(1);
        } else {
          return {
            ...acc,
            isIllegal: true,
            firstIllegalCharacter: char,
            illegalCharacterIndex: i,
          };
        }
      }
      return {
        ...acc,
        chunksStack: currentChunkStack,
      };
    },
    {
      line: line,
      lineString: line.join(""),
      isIllegal: false,
      firstIllegalCharacter: undefined,
      illegalCharacterIndex: undefined,
      chunksStack: [],
    }
  );
};

export const getLinesReport = (lines) => lines.map(buildLineReport);

const filterIllegalLinesFromReport = (lineReports) =>
  lineReports.filter((lineReport) => lineReport.isIllegal);

const calculateScore = (illegalLinesReport) =>
  illegalLinesReport.reduce(
    (acc, report) => acc + ILLEGALITY_SCORE[report.firstIllegalCharacter],
    0
  );

const raw = readRawData("../10/data/data");
console.log(
  run(
    buildLinesArray,
    getLinesReport,
    filterIllegalLinesFromReport,
    calculateScore
  )(raw)
);
