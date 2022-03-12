import binaryReads from '../data/binaryReads';
import { multiplyItems, parseBinaryStringToDec, run } from '../../utils/utils';

const getResultTemplate = input => input[0].split('');

export const countDigitsInPosition = i => input => input.reduce((acc, row) => {
  acc[row[i]]++;
  return acc;
}, {
  '0': 0,
  '1': 0
});

const countDigitsByPositions = resultTemplate => input => resultTemplate.map((digit, i) =>
  countDigitsInPosition(i)(input)
);

export const getMax = countObject => countObject['0'] > countObject['1'] ? '0' : '1';

const calculateGammaRate = input => input.map(getMax).join('');
const calculateEpsilonRateFromGammaRate = gammaRateInput => gammaRateInput.split('').map(digit => digit === '0' ? '1' : '0').join('');
export const calculateRates = input => {
  const gammaRate = calculateGammaRate(input);
  return [
    gammaRate,
    calculateEpsilonRateFromGammaRate(gammaRate)
  ]
}
export const parseRates = ratesArray => ratesArray.map(parseBinaryStringToDec);

console.log(run(run(getResultTemplate, countDigitsByPositions)(binaryReads), calculateRates, parseRates, multiplyItems)(binaryReads));
