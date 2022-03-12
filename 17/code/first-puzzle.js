import {
  numberify,
  readRawData,
  run,
  sumRecursivelyToZero,
} from "../../utils/utils";

const TARGET_AREA_PREFIX = "target area: ";
const SEPARATOR = ", ";
const ASSIGNATOR = "=";
const LIMITS_SEPARATOR = "..";

export const getTargetArea = (raw) =>
  raw
    .split("")
    .slice(TARGET_AREA_PREFIX.length)
    .join("")
    .split(SEPARATOR)
    .reduce((acc, coord) => {
      const [axis, limits] = coord.split(ASSIGNATOR);
      acc[axis] = limits.split(LIMITS_SEPARATOR).map(numberify);
      return acc;
    }, {});

export const getMinXBoundary = (target) => {
  const nearestX = Math.min(...target.x);
  const getMinSpeedThatReachesTarget = (xSpeedCandidate = 0) => {
    return sumRecursivelyToZero(xSpeedCandidate) > nearestX
      ? xSpeedCandidate
      : getMinSpeedThatReachesTarget(xSpeedCandidate + 1);
  };
  return getMinSpeedThatReachesTarget();
};

export const getMaxYBoundary = (target) => {
  const bottomY = Math.min(...target.y);
  return -bottomY - 1;
};

const getHighestPossibleLaunchment = (target) => ({
  xSpeed: getMinXBoundary(target),
  ySpeed: getMaxYBoundary(target),
});

const calculateHighestPoint = (initialSpeed) =>
  sumRecursivelyToZero(initialSpeed.ySpeed);

console.log(
  "1 RESPONSE",
  run(
    readRawData,
    getTargetArea,
    getHighestPossibleLaunchment,
    calculateHighestPoint
  )("../17/data/data")
);
