import { beautifyMatrix, readRawData, run } from "../../utils/utils";
import { buildPaperMatrix, doFolds, translateRaw } from "./first-puzzle";

console.log(
  run(
    readRawData,
    translateRaw,
    buildPaperMatrix,
    doFolds()(),
    beautifyMatrix
  )("../13/data/data")
);
