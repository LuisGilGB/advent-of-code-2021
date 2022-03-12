import { readRawData, run } from "../../utils/utils";
import { buildOctopusesMatrix, runMatrix } from "./first-puzzle";

// Code updates where done inside first-puzzle.js file (inside runMatrix function)

console.log(
  run(readRawData, buildOctopusesMatrix, runMatrix(1000))("../11/data/data")
);
