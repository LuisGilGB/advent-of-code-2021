import { readRawData, run } from "../../utils/utils";
import { calculateScore, checkAndReviewLineIfCompleted, initializePlayer, readBoards, readSequence } from "./first-puzzle";

const playBingo = boards => sequence => {
  let players = boards.map(initializePlayer);
  const readNumber = (turnIndex = 0, loser, currentPlayers = players) => {
    const currentNumber = sequence[turnIndex];
    let nextPlayers = currentPlayers;
    currentPlayers.forEach((player, i) => {
      if (player.numbers[currentNumber]) {
        const { rowIndex, colIndex } = player.numbers[currentNumber];
        delete player.numbers[currentNumber];
        const rowIsWinner = checkAndReviewLineIfCompleted(player.rows[rowIndex], currentNumber);
        const colIsWinner = checkAndReviewLineIfCompleted(player.columns[colIndex], currentNumber);
        if (rowIsWinner || colIsWinner) {
          if (nextPlayers.length === 1) {
            loser = {
              player,
              lastNumber: currentNumber
            }
          } else {
            nextPlayers = nextPlayers.filter(winnerPlayer => player !== winnerPlayer);
          }
        }
      }
    });
    return loser || readNumber(turnIndex + 1, loser, nextPlayers);
  }
  return readNumber();
}

const raw = readRawData('../04/data/data');
const sequence = readSequence(raw);
const boards = readBoards(raw);
console.log(run(playBingo(boards), calculateScore)(sequence));