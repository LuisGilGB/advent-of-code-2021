import { multiplyItems, readRawData, run, sumArrayItems, transpose } from '../../utils/utils';

export const readSequence = raw => raw.split('\n\n')[0].split(',').map(rawNumber => +rawNumber);

export const readBoards = raw => raw
  .split('\n\n')
  .slice(1)
  .map(rawBoard => rawBoard
    .split('\n')
    .map(rawRow => rawRow
      .split(' ')
      .filter(Boolean)
      .map(rawNumber => +rawNumber.trim())
    )
  );

const initializeLine = line => ({
  lineStatus: line.reduce((acc, cell) => {
    acc[cell] = false;
    return acc;
  }, {}),
  remaining: line.length,
});

export const initializePlayer = board => ({
  numbers: board
    .reduce((acc, row, rowIndex) => ({
      ...acc,
      ...row.reduce((acc2, cell, colIndex) => ({
        ...acc2,
        [cell]: {
          rowIndex,
          colIndex
        }
      }), {})
    }), {}),
  rows: board.map(initializeLine),
  columns: transpose(board).map(initializeLine),
});

const checkLineNumber = (line, number) => {
  if (line.lineStatus[number] === false) {
    line.lineStatus[number] = true;
    --line.remaining;
  }
}

const lineIsFullyMarked = line => line.remaining === 0;

export const checkAndReviewLineIfCompleted = (line, number) => {
  checkLineNumber(line, number);
  return lineIsFullyMarked(line);
}

const playBingo = boards => sequence => {
  const players = boards.map(initializePlayer);
  const readNumber = (turnIndex = 0, winner) => {
    const currentNumber = sequence[turnIndex];
    players.forEach(player => {
      if (player.numbers[currentNumber]) {
        const { rowIndex, colIndex } = player.numbers[currentNumber];
        delete player.numbers[currentNumber];
        const rowIsWinner = checkAndReviewLineIfCompleted(player.rows[rowIndex], currentNumber);
        const colIsWinner = checkAndReviewLineIfCompleted(player.columns[colIndex], currentNumber);
        if (rowIsWinner || colIsWinner) {
          winner = {
            player,
            lastNumber: currentNumber
          } 
        }
      }
    });
    return winner || readNumber(turnIndex + 1, winner);
  }
  return readNumber();
}

export const calculateScore = (bingoResult) => multiplyItems([sumArrayItems(Object.keys(bingoResult.player.numbers).map(number => +number)), bingoResult.lastNumber]);

const raw = readRawData('../04/data/data');
const sequence = readSequence(raw);
const boards = readBoards(raw);
console.log(run(playBingo(boards), calculateScore)(sequence));