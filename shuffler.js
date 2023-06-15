import { BoardState } from "./board.js";

export function shuffle(boardState)
{
  const width = boardState.numCols();
  const height = boardState.numRows();

  // Flatten the 2D board into a 1D array
  const puzzle = [...boardState].flat();

  // Use the Fisher-Yates algorithm to shuffle the array
  for (let i = puzzle.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [puzzle[i], puzzle[randomIndex]] = [puzzle[randomIndex], puzzle[i]];
  }

  // Check if the shuffled puzzle is solvable
  const numberOfInversions = countInversions(puzzle);
  const emptyTilePosition = puzzle.indexOf(0);
  const isSolvable = isPuzzleSolvable(
    numberOfInversions,
    width,
    emptyTilePosition
  );

  // If the puzzle is unsolvable, swap the first two elements to make it solvable
  if (!isSolvable) {
    [puzzle[0], puzzle[1]] = [puzzle[1], puzzle[0]];
  }

  // Convert the 1D array back to a 2D board
  const shuffledBoard = [];
  for (let i = 0; i < height; i++) {
    const row = puzzle.slice(i * width, (i + 1) * width);
    shuffledBoard.push(row);
  }

  return new BoardState(shuffledBoard);
}

function countInversions(puzzle)
{
  let inversions = 0;
  for (let i = 0; i < puzzle.length - 1; i++) {
    const currentTile = puzzle[i];
    if (currentTile === 0) continue;

    for (let j = i + 1; j < puzzle.length; j++) {
      const nextTile = puzzle[j];
      if (nextTile === 0) continue;

      if (currentTile > nextTile) {
        inversions++;
      }
    }
  }
  return inversions;
}

function isPuzzleSolvable(numberOfInversions, width, emptyTilePosition) {
  if (width % 2 === 1) {
    return numberOfInversions % 2 === 0;
  } else {
    const rowNumber = getRowNumberFromBelow(width, emptyTilePosition);
    return (rowNumber % 2 === 0 && numberOfInversions % 2 === 1) ||
      (rowNumber % 2 === 1 && numberOfInversions % 2 === 0);
  }
}

function getRowNumberFromBelow(width, emptyTilePosition) {
  const row = Math.floor(emptyTilePosition / width);
  return width - row;
}

export default { shuffle };