const { readFileSync } = require("fs");
const path = require("path");

const SEPARATOR = ",";

export const readRawData = (filePath) =>
  readFileSync(path.join(__dirname, filePath), {
    encoding: "utf-8",
  });

const lowerCasePattern = /^[a-z]{1,}$/;
const upperCasePattern = /^[A-Z]{1,}$/;
const digitPattern = /^[0-9]{1}$/;
const numberPattern = /^[0-9]{1,}$/;
export const isLowerCase = (input) => lowerCasePattern.test(input);
export const isUpperCase = (input) => upperCasePattern.test(input);
export const isDigit = (input) => digitPattern.test(input);
export const isNumber = (input) => numberPattern.test(input);

export const numberify = (value) => +value;

export const buildNumbersArray = (raw) => raw.split(SEPARATOR).map(numberify);

export const run =
  (...functions) =>
  (input) =>
    functions.reduce((acc, fn) => fn(acc), input);

export const negate =
  (fn) =>
  (...args) =>
    !fn(...args);

export const count = (input) => input.length;

export const getLast = (array) => array[array.length - 1];

export const sumRecursivelyToZero = (input) =>
  input <= 0 ? 0 : input + sumRecursivelyToZero(input - 1);

export const passesOneOf =
  (...functions) =>
  (input) =>
    functions.reduce((acc, fn) => acc || fn(input), false);

export const passesEvery =
  (...functions) =>
  (input) =>
    functions.reduce((acc, fn) => acc && fn(input), true);

export const concatItems = (input) =>
  input.reduce((acc, code) => [...acc, ...code], []);

export const filterUniqueItems = (input) =>
  input.filter(
    (value, i, arr) =>
      ![...arr.slice(0, i), ...arr.slice(i + 1)].includes(value)
  );

export const sumArrayItems = (input) =>
  input.reduce((acc, item) => acc + item, 0);

export const parseBin = (stringBin) => parseInt(stringBin, 2);

export const multiplyItems = (numbersArray) =>
  numbersArray.reduce((acc, item) => acc * item, 1);

export const getMax = (numbersArray) => Math.max(...numbersArray);

export const allItemsAreEquals = (items) =>
  items.slice(1).every((item) => item === items[0]);

export const allItemsAbsolutesAreEquals = (items) =>
  items.slice(1).every((item) => Math.abs(item) === Math.abs(items[0]));

export const buildMapFromArrayItems = (items) =>
  items.reduce((map, item) => {
    map.set(item, true);
    return map;
  }, new Map());

export const transpose = (matrix) =>
  matrix.map((row, rowIndex) =>
    row.map((cell, colIndex) => matrix[colIndex][rowIndex])
  );

export const checkEveryMatrixCellIsEqualTo = (targetValue) => (matrix) =>
  matrix.every((row) => row.every((cell) => cell === targetValue));

export const beautifyMatrix = (inputMatrix) =>
  inputMatrix.map((row) => row.join("")).join("\n");

export const incrementOrStartCount =
  (times = 1) =>
  (input, key) => {
    if (input[key]) {
      input[key] += times;
    } else {
      input[key] = times;
    }
  };

export const reduceToValueCounts = (input) =>
  input.reduce((acc, key) => {
    incrementOrStartCount()(acc, key);
    return acc;
  }, {});

export const calculateMatchProduct = (arr1, arr2) => {
  const map1 = buildMapFromArrayItems(arr1);
  return arr2.reduce((acc, item) => (map1.has(item) ? acc + 1 : acc), 0);
};

export const calculateCloseProduct =
  (margin = 1) =>
  (arr1, arr2) => {
    const numbArr1 = arr1.map(numberify);
    const numbArr2 = arr2.map(numberify);
    return numbArr1.reduce(
      (acc, number) =>
        numbArr2
          .map((num2) => num2 - number)
          .filter((diff) => Math.abs(diff) <= margin).length > 0
          ? acc + 1
          : acc,
      0
    );
  };

export { default as minPriorityQueueFactory } from "./minPriorityQueue";
