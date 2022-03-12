import { run } from '../../utils/utils';
import { commands } from '../data/commands';
import { DOWN, FORWARD, UP } from './consts';

const accumulatedUnits = {
  [FORWARD]: 0,
  [UP]: 0,
  [DOWN]: 0,
}

const readAndAccumulate = initialAcc => input => input.reduce((acc, { commandType, units }) => {
  acc[commandType] += units;
  return acc;
}, initialAcc);

const getX = input => input[FORWARD];
const getY = input => input[DOWN] - input[UP];

export const multiplyXY = (getX, getY) => input => getX(input) * getY(input);

console.log(run(readAndAccumulate(accumulatedUnits), multiplyXY(getX, getY))(commands));
