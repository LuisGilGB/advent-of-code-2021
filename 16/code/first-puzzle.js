import { getLast, parseBin, readRawData, run } from "../../utils/utils";

export const HEX_TO_BIN_RATE = 4;

export const VERSION_HEAD_LENGTH = 3;
export const TYPE_HEAD_LENGTH = 3;

export const LITERAL_TYPE = "100";

export const LITERAL_GROUP_LENGTH = 5;
export const LAST_LITERAL_GROUP_PREFIX = "0";

export const MODE_ENCODING_LENGTH = 1;
export const TOTAL_LENGTH_MODE = "TOTAL_LENGTH_MODE";
export const TOTAL_SUBPACKETS_MODE = "TOTAL_SUBPACKETS_MODE";
export const TOTAL_LENGTH_MODE_ENCODING = "0";

export const TOTAL_LENGTH_ENCODING_LENGTH = 15;
export const NUMBER_OF_SUBPACKETS_ENCODING_LENGTH = 11;

export const HEX_TO_BIN_MAP = {
  0: "0000",
  1: "0001",
  2: "0010",
  3: "0011",
  4: "0100",
  5: "0101",
  6: "0110",
  7: "0111",
  8: "1000",
  9: "1001",
  A: "1010",
  B: "1011",
  C: "1100",
  D: "1101",
  E: "1110",
  F: "1111",
};

export const transformHexIntoBin = (hexString) =>
  hexString
    .split("")
    .map((hexChar) => HEX_TO_BIN_MAP[hexChar])
    .join("");

const getBitsNeededToFillHex = (input) => {
  const module = input.length % HEX_TO_BIN_RATE;
  return module ? HEX_TO_BIN_RATE - module : 0;
};

const addZerosToBitStream = (input, numberOfZeros) =>
  input + new Array(numberOfZeros).fill("0").join("");

const setPacketBitStream = (packet, inputBitStream, fillHex = true) => {
  const remainingZeros = getBitsNeededToFillHex(inputBitStream);
  const bitStream = fillHex
    ? addZerosToBitStream(inputBitStream, remainingZeros)
    : inputBitStream;
  packet.bitStream = bitStream;
  packet.bitStreamLength = bitStream.length;
};

const readLiteralPacket = (unreadStream, nextPacket, fillHex = true) => {
  nextPacket.literalGroups = [];
  let isLastGroup = false;
  while (!isLastGroup) {
    const group = unreadStream.slice(0, LITERAL_GROUP_LENGTH);
    isLastGroup = group[0] === LAST_LITERAL_GROUP_PREFIX;
    unreadStream = unreadStream.slice(LITERAL_GROUP_LENGTH);
    nextPacket.literalGroups.push(group);
  }
  let encodedPacket =
    nextPacket.version + nextPacket.version + nextPacket.literalGroups.join("");
  const zerosNeededToFillHex = getBitsNeededToFillHex(encodedPacket);
  setPacketBitStream(nextPacket, encodedPacket, fillHex);
  return fillHex ? unreadStream.slice(zerosNeededToFillHex) : unreadStream;
};

export const parsePackets =
  (fillHex = true, packetsLimit = 0) =>
  (bitStream) => {
    const packets = [];
    let unreadStream = bitStream;

    const readSubpacketsByTotalLength = (unreadStream, nextPacket, fillHex) => {
      const encodedSubpacketsLength = unreadStream.slice(
        0,
        TOTAL_LENGTH_ENCODING_LENGTH
      );
      nextPacket.encodedSubpacketsLength = encodedSubpacketsLength;
      const subpacketsLength = parseBin(encodedSubpacketsLength);
      nextPacket.subpacketsLength = subpacketsLength;
      unreadStream = unreadStream.slice(TOTAL_LENGTH_ENCODING_LENGTH);
      const subpacketsBitStream = unreadStream.slice(0, subpacketsLength);
      unreadStream = unreadStream.slice(subpacketsBitStream.length);
      nextPacket.subpacketsBitStream = subpacketsBitStream;
      nextPacket.subpackets = parsePackets(false)(subpacketsBitStream);
      const encodedPacket =
        nextPacket.version +
        nextPacket.type +
        nextPacket.encodedMode +
        nextPacket.encodedSubpacketsLength +
        nextPacket.subpacketsBitStream;
      const remainingZeros = getBitsNeededToFillHex(encodedPacket);
      setPacketBitStream(nextPacket, encodedPacket, fillHex);
      return fillHex ? unreadStream.slice(remainingZeros) : unreadStream;
    };

    while (
      !!packetsLimit
        ? packets.length < packetsLimit
        : unreadStream.length > 0 &&
          unreadStream.split("").some((bit) => bit === "1")
    ) {
      const nextPacket = {};
      nextPacket.version = unreadStream.slice(0, VERSION_HEAD_LENGTH);
      unreadStream = unreadStream.slice(VERSION_HEAD_LENGTH);
      nextPacket.type = unreadStream.slice(0, TYPE_HEAD_LENGTH);
      unreadStream = unreadStream.slice(VERSION_HEAD_LENGTH);

      if (nextPacket.type === LITERAL_TYPE) {
        unreadStream = readLiteralPacket(unreadStream, nextPacket, fillHex);
      } else {
        const encodedMode = unreadStream[0];
        const mode =
          encodedMode === TOTAL_LENGTH_MODE_ENCODING
            ? TOTAL_LENGTH_MODE
            : TOTAL_SUBPACKETS_MODE;
        nextPacket.encodedMode = encodedMode;
        nextPacket.mode = mode;
        unreadStream = unreadStream.slice(MODE_ENCODING_LENGTH);
        if (mode === TOTAL_LENGTH_MODE) {
          unreadStream = readSubpacketsByTotalLength(
            unreadStream,
            nextPacket,
            fillHex
          );
        } else if (unreadStream) {
          const encodedNumberOfSubpackets = unreadStream.slice(
            0,
            NUMBER_OF_SUBPACKETS_ENCODING_LENGTH
          );
          nextPacket.encodedNumberOfSubpackets = encodedNumberOfSubpackets;
          const numberOfSubpackets = parseBin(encodedNumberOfSubpackets);
          nextPacket.numberOfSubpackets = numberOfSubpackets;
          unreadStream = unreadStream.slice(
            NUMBER_OF_SUBPACKETS_ENCODING_LENGTH
          );
          nextPacket.subpackets = parsePackets(
            false,
            numberOfSubpackets
          )(unreadStream);
          const subpacketsBitStream =
            nextPacket.subpackets?.reduce(
              (acc, { bitStream }) => acc + bitStream,
              ""
            ) || "";
          nextPacket.subpacketsBitStream = subpacketsBitStream;
          unreadStream = unreadStream.slice(subpacketsBitStream.length);
          const encodedPacket =
            nextPacket.version +
            nextPacket.type +
            nextPacket.encodedMode +
            nextPacket.encodedNumberOfSubpackets +
            nextPacket.subpacketsBitStream;
          const remainingZeros = getBitsNeededToFillHex(subpacketsBitStream);
          setPacketBitStream(nextPacket, encodedPacket, fillHex);
          unreadStream = fillHex
            ? unreadStream.slice(remainingZeros)
            : unreadStream;
        }
      }
      packets.push(nextPacket);
    }

    return packets;
  };

const sumVersions = (packets) =>
  packets.reduce(
    (acc, packet) =>
      acc +
      parseBin(packet.version) +
      (packet.subpackets ? sumVersions(packet.subpackets) : 0),
    0
  );

console.log(
  run(
    readRawData,
    transformHexIntoBin,
    parsePackets(),
    sumVersions
  )("../16/data/data")
);
