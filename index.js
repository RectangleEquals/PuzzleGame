import readline from "readline";
import { Board } from "./board.js";
import { shuffle } from "./shuffler.js";
import { Solver } from "./solver.js";

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

let board;
let solver, solution;

function initBoard() {
  console.log('Initializing board...');
  board = new Board(initialState, goalState);
  while(!solution) {
    shuffleBoard();
    console.log('Solving board...');
    solver = new Solver(board, 10);
    solution = solver.solve();
  }
}

function shuffleBoard() {
  console.log('Shuffling board...');
  board.setState(shuffle(board.getState()));
}

function solveBoard() {
  console.log('Solving board...');
  solver = new Solver(board, 10);
  solution = solver.solve();
}

initBoard();

function getSolutionMoves() {
  solveBoard();
  const solverMoves = solution
    .map(({ move }) => move)
    .reduce((acc, move) => (acc === '' ? move : acc + ', ' + move), '');

  return `Solution: ${solverMoves}`;
}

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