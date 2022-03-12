import {
  count,
  isLowerCase,
  isUpperCase,
  readRawData,
  run,
} from "../../utils/utils";
import {
  buildCaveLinksArray,
  buildCavesMap,
  buildPathsArray,
  END,
  START,
} from "./first-puzzle";

const isSmallIntermediateCave = (cave) =>
  cave !== START && cave !== END && isLowerCase(cave);

const pathAdmitsSecondVisitToSmall = (path, cave) => {
  const reviewable = isSmallIntermediateCave(cave);
  if (!reviewable) {
    return false;
  }
  const smallCaves = path.filter(isSmallIntermediateCave);
  return !smallCaves.find((cave, i) => smallCaves.indexOf(cave) !== i);
};

const checkValidityForSecondPuzzleConditions = (path, cave) =>
  isUpperCase(cave) ||
  !path.includes(cave) ||
  pathAdmitsSecondVisitToSmall(path, cave);

console.log(
  run(
    readRawData,
    buildCaveLinksArray,
    buildCavesMap,
    buildPathsArray(checkValidityForSecondPuzzleConditions),
    count
  )("../12/data/data")
);
