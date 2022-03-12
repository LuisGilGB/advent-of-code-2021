import { filterUniqueItems, readRawData, run, sumArrayItems } from "../../utils/utils";

const INPUT_OUTPUT_SEPARATOR = '|';
export const DIGITS_SEPARATOR = ' ';

const INPUT_INDEX = 0;
const OUTPUT_INDEX = 1;

export const SEGMENTS_PER_DIGIT_MAP = {
  0: ['a', 'b', 'c', 'e', 'f', 'g'],
  1: ['c', 'f'],
  2: ['a', 'c', 'd', 'e', 'g'],
  3: ['a', 'c', 'd', 'f', 'g'],
  4: ['b', 'c', 'd', 'f'],
  5: ['a', 'b', 'd', 'f', 'g'],
  6: ['a', 'b', 'd', 'e', 'f', 'g'],
  7: ['a', 'c', 'f'],
  8: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
  9: ['a', 'b', 'c', 'd', 'f', 'g'],
}

const uniqueSegmentsLengths = filterUniqueItems(Object
  .values(SEGMENTS_PER_DIGIT_MAP)
  .map(segmentsSet => segmentsSet.length))

export const buildInputOutputReadsArray = raw => raw
  .split('\n')
  .map(line => line
    .split(INPUT_OUTPUT_SEPARATOR)
    .reduce((acc, value, i) => {
      const parsedValue = value.trim().split(DIGITS_SEPARATOR);
      if(i === INPUT_INDEX) {
        acc.input = parsedValue;
      } else if (i === OUTPUT_INDEX) {
        acc.output = parsedValue;
      }
      return acc;
    }, {})
  );

export const getOutput = lineObject => lineObject.output;

const countUniqueSegementLengthNumberInstances = lineSelectorFn => linesArray => {
  return sumArrayItems(
    linesArray.map(line => {
      const selection = lineSelectorFn(line);
      return selection
        .filter(code => uniqueSegmentsLengths.includes(code.length))
        .length
    })
  );
}

const raw = readRawData('../08/data/data');
console.log(run(buildInputOutputReadsArray, countUniqueSegementLengthNumberInstances(getOutput))(raw));
