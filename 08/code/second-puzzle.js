import { concatItems, filterUniqueItems, negate, passesEvery, passesOneOf, readRawData, run, sumArrayItems } from "../../utils/utils";
import { buildInputOutputReadsArray, getOutput, SEGMENTS_PER_DIGIT_MAP } from "./first-puzzle";

const DIGITS = [0,1,2,3,4,5,6,7,8,9];
const SEGMENTS = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

const isCodeFor = number => code => code.length === SEGMENTS_PER_DIGIT_MAP[number].length;

const isInOneOfCodesFor = (...numbers) => passesOneOf(...numbers.map(number => isCodeFor(number)));

const charIsInEveryCodeOfArray = codesArray => passesEvery(...codesArray.map(code => char =>  code.split('').includes(char)));

const filterNonRepeatedSegments = run(concatItems, filterUniqueItems);

const getInputs = lineObject => lineObject.input;

const deductBuggyMapping = inputsArray => {
  const codeFor1 = inputsArray.find(isCodeFor(1));
  const sixSegmentsCodes = inputsArray.filter(isCodeFor(0));
  const charIsInEvery6SegmentsCode = charIsInEveryCodeOfArray(sixSegmentsCodes);
  const bdCandidates = filterNonRepeatedSegments(inputsArray.filter(isInOneOfCodesFor(1, 4)));
  const mapABCD = {
    'a': inputsArray
      .find(isCodeFor(7))
      .split('')
      .find(char => !codeFor1.split('').includes(char)),
    'b': bdCandidates.find(charIsInEvery6SegmentsCode),
    'c': inputsArray
      .find(isCodeFor(1))
      .split('')
      .find(negate(charIsInEvery6SegmentsCode)),
    'd': bdCandidates.find(negate(charIsInEvery6SegmentsCode)),
  }
  const mapEF = {
    'e': SEGMENTS
      .filter(negate(charIsInEvery6SegmentsCode))
      .find(char => char !== mapABCD['c'] && char !== mapABCD['d']),
    'f': inputsArray
      .find(isCodeFor(1))
      .split('')
      .find(char => char !== mapABCD['c']),
  }
  const mapABCDEF = {...mapABCD, ...mapEF};
  return {
    ...mapABCDEF,
    g: SEGMENTS.find(char => !Object.values(mapABCDEF).includes(char))
  };
}

const getBuggyWiringsMap = run(getInputs, deductBuggyMapping);

const decodeOutput = lineObject => {
  const map = getBuggyWiringsMap(lineObject);
  const encodedDigitsMap = Object.keys(SEGMENTS_PER_DIGIT_MAP)
    .reduce((acc, digit) => {
      acc[digit] = SEGMENTS_PER_DIGIT_MAP[digit].map(segment => map[segment]);
      return acc;
    }, {});
  const matchesNumber = code => number => isCodeFor(number)(code) && code.split('').every(char => encodedDigitsMap[number].includes(char));
  const getNumber = code => DIGITS.find(matchesNumber(code));
  const output = getOutput(lineObject);
  return +output.map(getNumber).join('')
}

const runDecoding = lineObjects => lineObjects.map(decodeOutput);

const raw = readRawData('../08/data/data');
console.log(run(buildInputOutputReadsArray, runDecoding, sumArrayItems)(raw));
