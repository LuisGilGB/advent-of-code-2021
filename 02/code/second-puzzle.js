import { run } from "../../utils/utils";
import { commands } from "../data/commands"
import { DOWN, FORWARD, UP } from "./consts"
import { multiplyXY } from "./first-puzzle";

const accumulatedUnits = {
  [FORWARD]: 0,
  aim: 0,
  deltaDepth: 0,
}

const readAndAccumulate = initialAcc => input => input.reduce((acc, { commandType, units}) => {
  if (commandType === FORWARD) {
    acc[FORWARD] += units;
    acc.deltaDepth += units * acc.aim;
  } else if (commandType === UP) {
    acc.aim -= units;
  } else if (commandType === DOWN) {
    acc.aim += units;
  }
  return acc;
}, initialAcc);

const getX = input => input[FORWARD];
const getY = input => input.deltaDepth;

console.log(run(readAndAccumulate(accumulatedUnits), multiplyXY(getX, getY))(commands));
