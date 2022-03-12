import {
  calculateMatchProduct,
  readRawData,
  run,
  transpose,
} from "../../utils/utils";

const SCANNER_TITLE_PREFIX = "--- scanner ";
const SCANNER_TITLE_SUFFIX = " ---";

const MIN_OVERLAPPING_BEACONS = 12;

const parseBeacon = (beaconRaw) => beaconRaw.split(",");

const parseScanner = (scannerRaw) => {
  const lines = scannerRaw.split("\n");
  const id = lines[0].slice(
    SCANNER_TITLE_PREFIX.length,
    -SCANNER_TITLE_SUFFIX.length
  );
  const beacons = lines.slice(1).map(parseBeacon);
  return {
    id,
    beacons,
  };
};

export const parseScannersReads = (raw) => raw.split("\n\n").map(parseScanner);

const calculateDistance = (a, b) =>
  // Math.ceil(
  //   Math.sqrt(
  Math.abs(a[0] - b[0], 2) +
  Math.abs(a[1] - b[1], 2) +
  Math.abs(a[2] - b[2], 2);
//   ) * 1000
// ) / 1000;

const obtainKNearest = (k) => (scanners) =>
  scanners.map((scanner) => ({
    ...scanner,
    beacons: scanner.beacons.map((beacon, i, arr) => ({
      coordinates: beacon,
      scannerId: scanner.id,
      beaconIndex: i,
      kNearest: [...arr.slice(0, i), ...arr.slice(i + 1)]
        .map((neighbour) => ({
          neighbour,
          distance: calculateDistance(beacon, neighbour),
        }))
        .sort((a, b) => +a.distance - +b.distance)
        .slice(0, k),
    })),
  }));

const getBeaconsDistances = (scanners) =>
  scanners.map((scanner) => ({
    ...scanner,
    beacons: scanner.beacons.map((beacon) => ({
      distances: beacon.kNearest.map(({ distance }) => distance),
      scannerId: beacon.scannerId,
      beaconIndex: beacon.beaconIndex,
      relativeCoordinates: beacon.coordinates,
    })),
  }));

const reduceToDistances = (scanners) =>
  scanners.map((scanner) => ({
    ...scanner,
    beacons: scanner.beacons.map((beacon) =>
      beacon.kNearest.map(({ distance }) => distance)
    ),
  }));

const groupBeacons = (scanners) =>
  scanners
    .reduce((acc, { id: scannerId, beacons }) => {
      acc.push(
        ...beacons.map((beacon) => ({
          distances: beacon.kNearest.map(({ distance }) => distance),
          scannerId,
          relativeCoordinates: beacon.coordinates,
        }))
      );
      return acc;
    }, [])
    .map((beacon, index) => ({
      ...beacon,
      sortIndex: index,
    }));

const findMatchingDistancesBeaconPairs = (beacons) => {
  const matchingPairs = beacons.reduce((acc, beacon, i, arr) => {
    const match = arr
      .slice(0, i)
      .find(
        (testBeacon) =>
          beacon.scannerId !== testBeacon.scannerId &&
          calculateMatchProduct(beacon.distances, testBeacon.distances) >=
            MIN_OVERLAPPING_BEACONS - 1
      );
    if (match) {
      acc.push({
        beaconIndex1: match.beaconIndex,
        beaconIndex2: beacon.beaconIndex,
        scanner1: match.scannerId,
        scanner2: beacon.scannerId,
        relativeCoordinates1: match.relativeCoordinates,
        relativeCoordinates2: beacon.relativeCoordinates,
        distances1: match.distances,
        distances2: beacon.distances,
      });
    }
    return acc;
  }, []);

  return {
    beacons,
    matchingPairs,
  };
};

const findScannerMatches = (scanners) => {
  const pendingScanners = new Set(scanners);
  const matchingPairs = [];
  const fillMatches = (scanner = scanners[0]) => {
    pendingScanners.delete(scanner);
    [...pendingScanners].forEach((targetScanner) => {
      const foundPairs = findMatchingDistancesBeaconPairs([
        ...scanner.beacons,
        ...targetScanner.beacons,
      ]).matchingPairs;
      matchingPairs.push(...foundPairs);
      if (foundPairs.length > 0) {
        fillMatches(targetScanner);
      }
    });
  };
  fillMatches();
  return {
    scanners,
    matchingPairs,
  };
};

const filterSignificantScannerOverlaps = (input) => {
  const { matchingPairs } = input;
  const scannerPairs = matchingPairs.map((duplicated) => [
    duplicated.scanner1,
    duplicated.scanner2,
  ]);
  const occurrencesMap = scannerPairs.reduce((map, scannerPair) => {
    const pairString = scannerPair.toString();
    map.set(pairString, map.has(pairString) ? map.get(pairString) + 1 : 1);
    return map;
  }, new Map());
  const reducedPairs = [...occurrencesMap.entries()]
    .map(([key, occurrences]) => {
      const [scanner1, scanner2] = key.split(",");
      return {
        scanner1,
        scanner2,
        occurrences,
      };
    })
    .filter(({ occurrences }) => occurrences >= MIN_OVERLAPPING_BEACONS);
  return {
    ...input,
    matchingPairs,
    reducedPairs,
  };
};

const findScannerLocations = (input) => {
  const { scanners, matchingPairs, reducedPairs } = input;
  const locations = {
    [scanners[0].id]: [0, 0, 0],
  };
  const rotationMatrixes = {
    [scanners[0].id]: [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ],
  };
  const getShift = (originAxis, targetAxis) => (pair) =>
    Math.abs(
      pair.relativeCoordinates1[originAxis] -
        pair.relativeCoordinates2[targetAxis]
    );

  const hasEqualShift = (pairs) => (originAxis, targetAxis) => {
    const firstPairShift = getShift(originAxis, targetAxis)(pairs[0]);
    return pairs.slice(1).every((pair) => {
      const pairShift = getShift(originAxis, targetAxis)(pair);
      if (originAxis === 1 && targetAxis === 0) {
        console.log(firstPairShift, pairShift);
      }
      return pairShift === firstPairShift;
    })
      ? 1
      : 0;
  };

  const addLocation = (scannerId) => {
    reducedPairs
      .filter(({ scanner1 }) => scanner1 === scannerId)
      .forEach(({ scanner2 }) => {
        locations[scanner2] = [];
        const pairs = matchingPairs.filter(
          (pair) => pair.scanner1 === scannerId && pair.scanner2 === scanner2
        );
        const checkTraslation = (originAxis, targetAxis) => {
          const originAxisValues = pairs
            .slice(0, 3)
            .map((pair) => pair.relativeCoordinates1[originAxis]);
          const targetAxisValues = pairs
            .slice(0, 3)
            .map((pair) => pair.relativeCoordinates2[targetAxis]);
          const originShifts = [
            originAxisValues[1] - originAxisValues[0],
            originAxisValues[2] - originAxisValues[0],
            originAxisValues[2] - originAxisValues[1],
          ];
          const targetShifts = [
            targetAxisValues[1] - targetAxisValues[0],
            targetAxisValues[2] - targetAxisValues[0],
            targetAxisValues[2] - targetAxisValues[1],
          ];
          const isDirectlyProportional =
            originShifts[0] === targetShifts[0] &&
            originShifts[1] === targetShifts[1] &&
            originShifts[2] === targetShifts[2];
          const isInverselyProportional =
            originShifts[0] === -targetShifts[0] &&
            originShifts[1] === -targetShifts[1] &&
            originShifts[2] === -targetShifts[2];
          if (isDirectlyProportional) {
            const prevOrientationFactor = transpose(
              rotationMatrixes[scannerId]
            )[originAxis].find((factor) => factor !== 0);
            const orientationFactor = prevOrientationFactor;

            locations[scanner2][originAxis] =
              locations[scannerId][originAxis] +
              orientationFactor * (+originAxisValues[0] - targetAxisValues[0]);
            return orientationFactor;
          } else if (isInverselyProportional) {
            const prevOrientationFactor = rotationMatrixes[scannerId][
              originAxis
            ].find((factor) => factor !== 0);
            const orientationFactor = -prevOrientationFactor;

            locations[scanner2][originAxis] =
              orientationFactor *
              (locations[scannerId][originAxis] -
                (+originAxisValues[0] + +targetAxisValues[0]));
            return orientationFactor;
          } else {
            return 0;
          }
        };
        const rotationMatrix = [
          [checkTraslation(0, 0), checkTraslation(0, 1), checkTraslation(0, 2)],
          [checkTraslation(1, 0), checkTraslation(1, 1), checkTraslation(1, 2)],
          [checkTraslation(2, 0), checkTraslation(2, 1), checkTraslation(2, 2)],
        ];
        rotationMatrixes[scanner2] = rotationMatrix;
        addLocation(scanner2);
      });
  };
  addLocation("0");
  console.log(locations);
  return {
    ...input,
    locations,
    rotationMatrixes,
  };
};

const obtainUnrepeatedPairs = (input) => {
  const { matchingPairs } = input;
  const matchFlowsMap = new Map();
  matchingPairs.forEach((pair) => {
    const origin = `${pair.scanner1}-${pair.beaconIndex1}`;
    const target = `${pair.scanner2}-${pair.beaconIndex2}`;
    matchFlowsMap.set(
      target,
      matchFlowsMap.has(target)
        ? [origin, ...matchFlowsMap.get(target)]
        : [origin]
    );
  }, []);
  return {
    ...input,
    duplicatedBeaconsSet: new Set(matchFlowsMap.keys()),
  };
};

const calculateUniqueBeacons = ({ scanners, duplicatedBeaconsSet }) => {
  const beaconsCount = scanners.reduce(
    (acc, scanner) => acc + scanner.beacons.length,
    0
  );
  return beaconsCount - duplicatedBeaconsSet.size;
};

console.log(
  run(
    readRawData,
    parseScannersReads,
    obtainKNearest(50),
    getBeaconsDistances,
    findScannerMatches,
    filterSignificantScannerOverlaps,
    findScannerLocations,
    obtainUnrepeatedPairs,
    calculateUniqueBeacons
    // reduceToDistances,
    // groupBeacons,
    // findMatchingDistancesBeaconPairs,
    // filterSignificantScannerOverlaps
  )("../19/data/test-data")
);
