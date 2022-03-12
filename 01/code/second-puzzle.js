import data from '../data/depth';
import { run, sumArrayItems } from '../../utils/utils';
import { countIncreases } from './first-puzzle';

const MEASURE_WINDOW_LENGTH = 3;

const getMeasureWindows = input => input.map((item, i, arr) => [item, arr[i+1], arr[i+2]].filter(Boolean)).filter(item => item.length === MEASURE_WINDOW_LENGTH)
const mapToWindowTotals = input => input.map(arr => sumArrayItems(arr));

console.log(run(getMeasureWindows, mapToWindowTotals, countIncreases)(data));
