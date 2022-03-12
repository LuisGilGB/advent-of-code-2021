import binaryReads from "../data/binaryReads";
import { multiplyItems, run } from "../../utils/utils";
import {
  countDigitsInPosition,
  getMax,
  parseRates,
} from "./first-puzzle";

const getMin = countObject => getMax(countObject) === '1' ? '0' : '1';

const calculate = digitChoserFn => input => {
  const doStep = (digitIndex = 0, provisionalResult = '', provisionalMatches = [...input]) => {
    const newDigit = digitChoserFn(countDigitsInPosition(digitIndex)(provisionalMatches));
    provisionalResult += newDigit;
    provisionalMatches = provisionalMatches.filter(row => row.startsWith(provisionalResult));
    return provisionalMatches.length > 1
      ? doStep(digitIndex + 1, provisionalResult, provisionalMatches)
      : provisionalMatches[0];
  }
  return doStep();
}

const calculateRates = input => [
  calculate(getMax)(input),
  calculate(getMin)(input),
]

console.log(
  run(
    calculateRates,
    parseRates,
    multiplyItems,
  )(binaryReads)
)