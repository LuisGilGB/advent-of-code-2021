import {
  multiplyItems,
  parseBin,
  readRawData,
  run,
  sumArrayItems,
} from "../../utils/utils";
import {
  LITERAL_TYPE,
  parsePackets,
  transformHexIntoBin,
} from "./first-puzzle";

const mapToValues = (packets) => packets.map((packet) => packet.value);

const sum = (subpackets) => sumArrayItems(subpackets);
const product = (subpackets) => multiplyItems(subpackets);
const minimum = (subpackets) => Math.min(...subpackets);
const maximum = (subpackets) => Math.max(...subpackets);
const greaterThan = (subpackets) => (subpackets[0] > subpackets[1] ? 1 : 0);
const lessThan = (subpackets) => (subpackets[0] < subpackets[1] ? 1 : 0);
const equalTo = (subpackets) => (subpackets[0] === subpackets[1] ? 1 : 0);

const TYPE_OPERATIONS_MAP = {
  0: sum,
  1: product,
  2: minimum,
  3: maximum,
  5: greaterThan,
  6: lessThan,
  7: equalTo,
};

const calculateLiteralValue = (packet) =>
  parseBin(
    packet.literalGroups.reduce((acc, group) => acc + group.slice(1), "")
  );

const populateLiteralValues = (parsedPackets) =>
  parsedPackets.map((packet) =>
    packet.type === LITERAL_TYPE
      ? {
          ...packet,
          value: calculateLiteralValue(packet),
        }
      : {
          ...packet,
          subpackets: populateLiteralValues(packet.subpackets),
        }
  );

const operate = (packets) =>
  packets.map((packet) => {
    if (packet.type === LITERAL_TYPE) {
      return packet;
    }
    const { type, subpackets } = packet;
    const doOperation = run(
      operate,
      mapToValues,
      TYPE_OPERATIONS_MAP[parseBin(type)]
    );
    const value = doOperation(subpackets);
    return {
      ...packet,
      value,
    };
  });

const getResult = (operatedPackets) => operatedPackets[0].value;

console.log(
  run(
    readRawData,
    transformHexIntoBin,
    parsePackets(),
    populateLiteralValues,
    operate,
    getResult
  )("../16/data/data")
);
