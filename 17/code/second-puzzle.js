import { count, readRawData, run } from "../../utils/utils";
import {
  getMaxYBoundary,
  getMinXBoundary,
  getTargetArea,
} from "./first-puzzle";

const getSpeedBoundaries = (target) => ({
  target,
  boundaries: {
    minXSpeed: getMinXBoundary(target),
    maxXSpeed: Math.max(...target.x),
    minYSpeed: Math.min(...target.y),
    maxYSpeed: getMaxYBoundary(target),
  },
});

const getAccComponent = (steps = 0) => {
  let acc = 0;
  for (let n = steps; n > 0; n--) {
    acc++;
  }
  return acc;
};

const getXSpeedAtStep =
  (initialXSpeed) =>
  (step = 0) => {
    const constantSpeedComponent = initialXSpeed;
    const accelerationComponent = Math.min(
      getAccComponent(step),
      constantSpeedComponent
    );
    return constantSpeedComponent - accelerationComponent;
  };

const getYSpeedAtStep =
  (initialYSpeed) =>
  (step = 0) => {
    const constantSpeedComponent = initialYSpeed;
    const accelerationComponent = getAccComponent(step);
    return constantSpeedComponent - accelerationComponent;
  };

const updateXForStep =
  (lastXPosition) =>
  (initialXSpeed) =>
  (step = 0) =>
    lastXPosition + getXSpeedAtStep(initialXSpeed)(step);

const updateYForStep =
  (lastYPosition) =>
  (initialYSpeed) =>
  (step = 0) =>
    lastYPosition + getYSpeedAtStep(initialYSpeed)(step);

const hasProbeOverTarget = (target) => (initialSpeed) => {
  const limits = {
    minX: Math.min(...target.x),
    maxX: Math.max(...target.x),
    minY: Math.min(...target.y),
    maxY: Math.max(...target.y),
  };
  let passesOverTarget = false;
  let lastStep = { x: 0, y: 0 };
  let stepsCounter = 0;
  while (
    !passesOverTarget &&
    lastStep.y >= limits.minY &&
    lastStep.x <= limits.maxX
  ) {
    const x = updateXForStep(lastStep.x)(initialSpeed.x)(stepsCounter);
    const y = updateYForStep(lastStep.y)(initialSpeed.y)(stepsCounter);
    passesOverTarget =
      x >= limits.minX &&
      x <= limits.maxX &&
      y >= limits.minY &&
      y <= limits.maxY;
    lastStep = { x, y };
    stepsCounter++;
  }
  return passesOverTarget;
};

const getValidLaunchments = ({ target, boundaries }) => {
  const { minXSpeed, maxXSpeed, minYSpeed, maxYSpeed } = boundaries;
  const validLaunchments = [];
  for (let x = minXSpeed; x <= maxXSpeed; x++) {
    for (let y = minYSpeed; y <= maxYSpeed; y++) {
      hasProbeOverTarget(target)({ x, y }) && validLaunchments.push([x, y]);
    }
  }
  return validLaunchments;
};

console.log(
  "2 RESPONSE",
  run(
    readRawData,
    getTargetArea,
    getSpeedBoundaries,
    getValidLaunchments,
    count
  )("../17/data/data")
);
