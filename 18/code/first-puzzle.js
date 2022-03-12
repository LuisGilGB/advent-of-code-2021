import { isDigit, isNumber, readRawData, run } from "../../utils/utils";

const PAIR_OPENING = "PAIR_OPENING";
const PAIR_CLOSING = "PAIR_CLOSING";
const PAIR_SEPARATOR = "PAIR_SEPARATOR";
const INTEGER = "INTEGER";

const PAIR_OPENING_CHAR = "[";
const PAIR_CLOSING_CHAR = "]";
const PAIR_SEPARATOR_CHAR = ",";

const TYPES_MAP = {
  [PAIR_OPENING_CHAR]: PAIR_OPENING,
  [PAIR_CLOSING_CHAR]: PAIR_CLOSING,
  [PAIR_SEPARATOR_CHAR]: PAIR_SEPARATOR,
};

const EXPLODE_TRIGGER = 4;
const SPLIT_TRIGGER = 9;

export const buildSnailFishNumbersArray = (raw) => raw.split("\n");

const getType = (input) =>
  TYPES_MAP[input] || (isNumber(input) ? INTEGER : undefined);

const buildItemMeta = (item) => ({
  char: item,
  isNumber: isNumber(item),
  value: isNumber(item) ? +item : null,
  type: getType(item),
});

const PAIR_OPENING_META = buildItemMeta(PAIR_OPENING_CHAR);
const PAIR_CLOSING_META = buildItemMeta(PAIR_CLOSING_CHAR);
const PAIR_SEPARATOR_META = buildItemMeta(PAIR_SEPARATOR_CHAR);

const AFTER_EXPLOSION_PAIR_REPLACE_VALUE = buildItemMeta("0");

const buildSnailfishNumberFromMeta = (meta) =>
  meta.map((item) => item.char).join("");

const buildMetanumber = (snailfishNumber) =>
  snailfishNumber
    .split("")
    .reduce((acc, char, i, arr) => {
      const last = acc[acc.length - 1];
      if (last && isNumber(last) && isDigit(char)) {
        acc[acc.length - 1] = last + char;
      } else {
        acc.push(char);
      }
      return acc;
    }, [])
    .map(buildItemMeta);

export const mapToMetanumbers = (numbers) =>
  numbers.map((number) => ({
    number,
    meta: buildMetanumber(number),
  }));

const isExplodable = (number) =>
  number.meta.reduce(
    (acc, item, i) => {
      if (acc.isExplodable) {
        return acc;
      }
      if (item.type === PAIR_OPENING) {
        acc.unclosedPairsCount++;
      } else if (item.type === PAIR_CLOSING) {
        acc.unclosedPairsCount--;
      }
      if (acc.unclosedPairsCount > EXPLODE_TRIGGER) {
        acc.isExplodable = true;
        acc.explosionIndex = i;
      }
      return acc;
    },
    {
      unclosedPairsCount: 0,
      isExplodable: false,
      explosionIndex: undefined,
    }
  );

const isSplitable = (number) =>
  number.meta.reduce(
    (acc, item, i) => {
      if (acc.isSplitable) {
        return acc;
      }
      if (item.isNumber && item.value > SPLIT_TRIGGER) {
        acc.isSplitable = true;
        acc.splitIndex = i;
      }
      return acc;
    },
    {
      isSplitable: false,
      splitIndex: undefined,
    }
  );

const explode = (number, explodability) => {
  if (!explodability.isExplodable) {
    return number;
  }
  const { meta } = number;
  let newMeta = [...meta];
  const { explosionIndex } = explodability;
  const leftNumberIndex = explosionIndex + 1;
  const rightNumberIndex = explosionIndex + 3;
  const leftNumber = meta[leftNumberIndex];
  const rightNumber = meta[rightNumberIndex];
  const leftTargetIndex = meta.reduce(
    (acc, item, i) => (i < leftNumberIndex && item.isNumber ? i : acc),
    undefined
  );
  const rightTargetIndex = meta.findIndex(
    (item, i) => i > rightNumberIndex && item.isNumber
  );
  if (leftTargetIndex > -1) {
    const newValue = newMeta[leftTargetIndex].value + leftNumber.value;
    newMeta[leftTargetIndex] = {
      ...newMeta[leftTargetIndex],
      value: newValue,
      char: newValue.toString(),
    };
  }
  if (rightTargetIndex > -1) {
    const newValue = newMeta[rightTargetIndex].value + rightNumber.value;
    newMeta[rightTargetIndex] = {
      ...newMeta[rightTargetIndex],
      value: newValue,
      char: newValue.toString(),
    };
  }
  newMeta = [
    ...newMeta.slice(0, explosionIndex),
    AFTER_EXPLOSION_PAIR_REPLACE_VALUE,
    ...newMeta.slice(rightNumberIndex + 2),
  ];
  return {
    number: buildSnailfishNumberFromMeta(newMeta),
    meta: newMeta,
  };
};

const split = (number, splitability) => {
  if (!splitability.isSplitable) {
    return number;
  }
  const { meta } = number;
  let newMeta = [...meta];
  const { splitIndex } = splitability;
  const { value: splittingValue } = meta[splitIndex];
  const newPair = [
    Math.floor(splittingValue / 2),
    Math.ceil(splittingValue / 2),
  ];
  newMeta = [
    ...newMeta.slice(0, splitIndex),
    ...buildMetanumber(JSON.stringify(newPair)),
    ...newMeta.slice(splitIndex + 1),
  ];
  return {
    number: buildSnailfishNumberFromMeta(newMeta),
    meta: newMeta,
  };
};

const reduceMetanumber = (number) => {
  const explodability = isExplodable(number);
  if (explodability.isExplodable) {
    const reducedNumber = explode(number, explodability);
    return reduceMetanumber(reducedNumber);
  }
  const splitability = isSplitable(number);
  if (splitability.isSplitable) {
    const reducedNumber = split(number, splitability);
    return reduceMetanumber(reducedNumber);
  }
  return number;
};

export const runMetaadditions = (metanumbers) =>
  metanumbers.reduce(
    (acc, metanumber) => {
      if (!acc?.number?.length) {
        return reduceMetanumber(metanumber);
      } else {
        const newNumber =
          PAIR_OPENING_CHAR +
          acc.number +
          PAIR_SEPARATOR_CHAR +
          metanumber.number +
          PAIR_CLOSING_CHAR;
        const newMeta = [
          PAIR_OPENING_META,
          ...acc.meta,
          PAIR_SEPARATOR_META,
          ...metanumber.meta,
          PAIR_CLOSING_META,
        ];
        return reduceMetanumber({
          number: newNumber,
          meta: newMeta,
        });
      }
    },
    {
      number: "",
      meta: [],
    }
  );

export const parseMetanumber = (metanumber) => JSON.parse(metanumber.number);

export const calculateMagnitude = (number) => {
  if (Array.isArray(number)) {
    const [left, right] = number;
    return 3 * calculateMagnitude(left) + 2 * calculateMagnitude(right);
  }
  return +number;
};

console.log(
  run(
    readRawData,
    buildSnailFishNumbersArray,
    mapToMetanumbers,
    runMetaadditions,
    parseMetanumber,
    calculateMagnitude
  )("../18/data/data")
);
