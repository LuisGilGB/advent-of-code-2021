import { count, isUpperCase, readRawData, run } from "../../utils/utils";

export const START = "start";
export const END = "end";
export const LINK_SEPARATOR = "-";

export const buildCaveLinksArray = (raw) =>
  raw.split("\n").map((link) => link.split(LINK_SEPARATOR));

const addToCaveSet = (map) => (sourceCave) => (targetCave) => {
  if (map[sourceCave]) {
    map[sourceCave].add(targetCave);
  } else {
    map[sourceCave] = new Set([targetCave]);
  }
};

export const buildCavesMap = (caveLinksArray) =>
  caveLinksArray.reduce((map, link) => {
    const [caveA, caveB] = link;
    addToCaveSet(map)(caveA)(caveB);
    addToCaveSet(map)(caveB)(caveA);
    return map;
  }, {});

const ifBigOrNonVisitedSmal = (path, cave) =>
  isUpperCase(cave) || !path.includes(cave);

export const buildPathsArray = (isValidMove) => (cavesMap) => {
  const paths = [];
  const tracePath = (cave = START, path = []) => {
    if (isValidMove(path, cave)) {
      path.push(cave);
      if (cave === END) {
        paths.push(path);
      } else {
        cavesMap[cave].forEach((targetCave) => {
          tracePath(targetCave, [...path]);
        });
      }
    }
  };
  tracePath();
  return paths;
};

console.log(
  run(
    readRawData,
    buildCaveLinksArray,
    buildCavesMap,
    buildPathsArray(ifBigOrNonVisitedSmal),
    count
  )("../12/data/data")
);
