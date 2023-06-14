import readline from "readline";
import { Board } from "./board.js";
import { Shuffler } from "./shuffler.js";
import { Solver } from "./solver.js";

// Test Board class
const initialState = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8]
];
const goalState = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8]
];

console.log('Initializing board...');
let board = new Board(initialState, goalState);

console.log('Shuffling board...');
const shuffler = new Shuffler(board, 8, 4);

shuffler.shuffle();
board = shuffler.assign();

console.log('Solving board...');
const solver = new Solver(board, shuffler.maxDepth * 2);
solver.solve();

function getSolutionMoves() {
  const shufflerMoves = shuffler.getShuffleQueue()
    .map(({ move }) => move)
    .reduce((acc, move) => (acc === '' ? move : acc + ', ' + move), '');

  const solverMoves = solver.getSolutionQueue()
    .map(({ move }) => move)
    .reduce((acc, move) => (acc === '' ? move : acc + ', ' + move), '');

  return `Shuffler: ${shufflerMoves}\nSolver: ${solverMoves}`;
}

// const moves = shuffler.getShuffleQueue()
//   .slice(1) // Exclude the element at index 0
//   .reverse()
//   .map(({ move }) => move)
//   .reduce((acc, move) => (acc === '' ? move : acc + ', ' + move), '');

function displayBoardState() {
  console.log("Current State:");
  console.log(board.getState().toString());
  console.log("Distance:", board.getStateDistance());
  console.log(getSolutionMoves());
}

function promptUserMove() {
  console.log("Possible Moves: ");
  const neighborStates = board.getNeighborStates();
  for (let i = 0; i < neighborStates.length; i++) {
    const tileValue = board.getState().at(
      neighborStates[i].blankIndex()
    );
    console.log(`${i + 1}: Swap with tile ${tileValue}`);
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question("Enter the number of the tile to move: ", (move) => {
    rl.close();
    const moveIndex = Number(move) - 1;
    if (moveIndex >= 0 && moveIndex < neighborStates.length) {
      const newState = neighborStates[moveIndex];
      board.setState(newState);

      if (board.reachedGoal()) {
        console.log("Congratulations! You reached the goal state.");
      } else {
        displayBoardState();
        promptUserMove();
      }
    } else {
      console.log("Invalid move. Please try again.");
      promptUserMove();
    }
  });
}

displayBoardState();
promptUserMove();