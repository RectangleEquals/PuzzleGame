export class BoardState extends Array {
  constructor(tiles) {
    super(...tiles);
  }

  toString() {
    let str = "";
    for (let row of this) {
      str += row.join(" ") + "\n";
    }
    return str;
  }

  numCols() {
    return this[0].length;
  }

  numRows() {
    return this.length;
  }

  at(index) {
    return this[index.row][index.col];
  }

  swap(index) {
    const { row, col } = index;
    const blankTileIndex = this.blankIndex();
    const { row: blankRow, col: blankCol } = blankTileIndex;

    if (
      this.isValidMove(blankRow, blankCol, row, col) &&
      this.isValidIndex(row, col)
    ) {
      [this[row][col], this[blankRow][blankCol]] = [
        this[blankRow][blankCol],
        this[row][col],
      ];
    }
  }

  blankIndex() {
    for (let row = 0; row < this.numRows(); row++) {
      for (let col = 0; col < this.numCols(); col++) {
        if (this[row][col] === 0) {
          return { row, col };
        }
      }
    }
  }

  isValidMove(row1, col1, row2, col2) {
    return (
      Math.abs(row1 - row2) + Math.abs(col1 - col2) === 1
    );
  }

  isValidIndex(row, col) {
    return (
      row >= 0 &&
      row < this.numRows() &&
      col >= 0 &&
      col < this.numCols()
    );
  }

  distanceFrom(otherState) {
    let misplacedTiles = 0;
    let totalDistance = 0;
    const numRows = this.numRows();
    const numCols = this.numCols();
    const otherRows = otherState.numRows();
    const otherCols = otherState.numCols();
  
    // Create a mapping of tile values to goal indices in otherState
    const tileMapping = new Map();
    for (let otherRow = 0; otherRow < otherRows; otherRow++) {
      for (let otherCol = 0; otherCol < otherCols; otherCol++) {
        const tile = otherState[otherRow][otherCol];
        tileMapping.set(tile, { row: otherRow, col: otherCol });
      }
    }
  
    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < numCols; col++) {
        const tile = this[row][col];
        const goalIndex = tileMapping.get(tile);
        const goalRow = goalIndex.row;
        const goalCol = goalIndex.col;
        if (row !== goalRow || col !== goalCol) {
          misplacedTiles++;
          totalDistance += Math.abs(row - goalRow) + Math.abs(col - goalCol);
        }
      }
    }
  
    const averageDistance = totalDistance / (numRows * numCols);
    return {
      misplaced: misplacedTiles,
      average: averageDistance,
      totalAverage: (misplacedTiles + averageDistance) / 2,
    };
  }
  

  equals(otherState) {
    for (let row = 0; row < this.numRows(); row++) {
      for (let col = 0; col < this.numCols(); col++) {
        if (this[row][col] !== otherState[row][col]) {
          return false;
        }
      }
    }
    return true;
  }

  getNeighborStates() {
    const blankTileIndex = this.blankIndex();
    const neighborStates = [];

    const directions = [
      { row: -1, col: 0 }, // up
      { row: 1, col: 0 }, // down
      { row: 0, col: -1 }, // left
      { row: 0, col: 1 }, // right
    ];

    for (const { row: dRow, col: dCol } of directions) {
      const { row, col } = blankTileIndex || {};
      const newRow = row + dRow;
      const newCol = col + dCol;

      if (this.isValidIndex(newRow, newCol)) {
        const newState = new BoardState([...this]);
        for (let i = 0; i < newState.numRows(); i++) {
          newState[i] = [...newState[i]];
        }
        newState.swap({ row: newRow, col: newCol });
        neighborStates.push(newState);
      }
    }

    return neighborStates;
  }
}

export class Board {
  constructor(initialState, goalState) {
    this.state = new BoardState(initialState);
    this.goalState = new BoardState(goalState);
    this.neighborStates = this.getNeighborStates();
  }

  getState() {
    return this.state;
  }

  getGoalState() {
    return this.goalState;
  }

  getNeighborStates() {
    return this.state.getNeighborStates();
  }

  getStateDistance() {
    return this.state.distanceFrom(this.goalState);
  }

  setState(newState) {
    this.state = newState;
    this.neighborStates = this.getNeighborStates();
  }

  reachedGoal() {
    return this.state.equals(this.goalState);
  }
}

export default { BoardState, Board };