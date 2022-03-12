import data from '../data/depth';

export const countIncreases = input => input.reduce((acc, item, i, arr) => i > 0 && item > arr[i-1] ? acc + 1 : acc, 0);

console.log(countIncreases(data));