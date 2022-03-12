import {
  minPriorityQueueFactory,
  numberify,
  readRawData,
  run,
  sumArrayItems,
} from "../../utils/utils";

export const buildMatrixFromRaw = (raw) =>
  raw.split("\n").map((row) => row.split("").map(numberify));

export const builGraphdMapForDijkstra = (matrix) => {
  const graphMap = new Map();
  const height = matrix.length;
  const width = matrix[0].length;
  matrix.forEach((row, rowIndex) => {
    row.forEach((cellValue, colIndex) => {
      graphMap.set([rowIndex, colIndex].toString(), {
        value: cellValue,
        destinations: [
          [rowIndex + 1, colIndex],
          [rowIndex - 1, colIndex],
          [rowIndex, colIndex + 1],
          [rowIndex, colIndex - 1],
        ]
          .filter(([y, x]) => y < height && x < width && x >= 0 && y >= 0)
          .map((destination) => destination.toString()),
      });
    });
  });
  return {
    matrix,
    graphMap,
  };
};

export const runDijkstra = async ({ matrix, graphMap }) => {
  const height = matrix.length;
  const width = matrix[0].length;
  const start = [0, 0].toString();
  const end = `${height - 1},${width - 1}`;
  const alreadyVisited = new Set();
  const minPriorityQueue = minPriorityQueueFactory();
  const itinerariesMap = new Map([
    [
      start,
      {
        acc: 0,
        path: [start],
      },
    ],
  ]);
  const runDijkstraStep = (node = start) =>
    new Promise((resolve, reject) => {
      const { destinations } = graphMap.get(node);
      alreadyVisited.add(node);
      if (node === end) {
        resolve(itinerariesMap.get(node));
      }
      destinations.forEach((destination) => {
        const { value } = graphMap.get(destination);
        const { acc } = itinerariesMap.get(node);
        const candidateValue = acc + value;
        if (!alreadyVisited.has(destination)) {
          minPriorityQueue.has(destination)
            ? minPriorityQueue.decreaseForKey(destination, candidateValue)
            : minPriorityQueue.insert(destination, candidateValue);
        }
        if (itinerariesMap.has(destination)) {
          itinerariesMap.get(destination).acc > candidateValue &&
            itinerariesMap.set(destination, {
              acc: candidateValue,
              path: [...itinerariesMap.get(node).path, destination],
            });
        } else {
          itinerariesMap.set(destination, {
            acc: candidateValue,
            path: [...itinerariesMap.get(node).path, destination],
          });
        }
      });
      const nextNode = minPriorityQueue.extractMin();
      if (alreadyVisited.size % 100 === 0) {
        setTimeout(async () => {
          resolve(runDijkstraStep(nextNode));
        }, 0);
      } else {
        resolve(runDijkstraStep(nextNode));
      }
    });
  const result = await runDijkstraStep();
  console.log(
    sumArrayItems(
      result.path
        .map((node) => {
          const [row, col] = node.split(",").map(numberify);
          return matrix[row][col];
        })
        .filter((v, i) => i !== 0)
    )
  );
  return result;
};

const execute = async () => {
  const result = run(
    readRawData,
    buildMatrixFromRaw,
    builGraphdMapForDijkstra
  )("../15/data/data");
  const dijkstraResult = await runDijkstra(result);
  console.log(dijkstraResult);
};

execute();
