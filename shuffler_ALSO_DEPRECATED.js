import seedrandom from 'seedrandom';
import { MaxPriorityQueue } from "@datastructures-js/priority-queue";

const random = () => {
  const date = new Date();
  const currentTimeStamp = `${date.toUTCString()}-${date.getUTCMilliseconds()}`;
  const rng = seedrandom(currentTimeStamp);
  return rng();
}

export class Shuffler {
  constructor(board, minMisplaced, minFinalStates) {
    this.board = board;
    this.minMisplaced = minMisplaced;
    this.minFinalStates = minFinalStates;

    this.goalState = this.board.getGoalState();
    this.root = new ShuffleNode(this.board.getState(), this.goalState, null, 0);
    this.finalStates = [];
  }

  shuffle() {
    const queue = new MaxPriorityQueue(node => node.getDistance().totalAverage);
    const visited = new Set();
    queue.enqueue(this.root);
    
    while (!queue.isEmpty() || this.finalStates.length < this.minFinalStates) {
      const currentNode = queue.dequeue();
      
      const misplacedTiles = currentNode.getDistance().misplaced;
      if (misplacedTiles >= this.minMisplaced) {
        this.finalStates.push(currentNode.getState());
        if (this.finalStates.length >= this.minFinalStates) {
          return this.randomAssign();
        }
      }
      
      const neighborStates = currentNode.getNeighborStates();
      const shuffledNeighborStates = this.shuffleArray(neighborStates);

      for (const state of shuffledNeighborStates) {
        const newNode = new ShuffleNode(state, this.goalState, currentNode, currentNode.depth + 1);
        if(!visited.has(newNode.getState())) {
          visited.add(newNode.getState());
          queue.enqueue(newNode);
        }
      }
    }

    return this.randomAssign();
  }

  shuffleArray(array) {
    const shuffledArray = [...array];

    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const rng = random();
      const j = Math.floor(random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }

    return shuffledArray;
  }

  randomAssign() {
    this.shuffleArray(this.finalStates);
    const randomIndex = Math.floor(random() * this.finalStates?.length);
    return this.finalStates[randomIndex];
  }
}

class ShuffleNode {
  constructor(state, goalState, parent, depth) {
    this.state = state;
    this.goalState = goalState;
    this.parent = parent;
    this.depth = depth;
    this.neighbors = this.getNeighborStates();
    this.distance = this.getDistance();
    this.moveDirection = this.getMoveDirection();
  }

  getState() {
    return this.state;
  }

  getNeighborStates() {
    return this.state.getNeighborStates();
  }

  getDistance() {
    return this.state.distanceFrom(this.goalState);
  }

  getMoveDirection() {
    const parentState = this.parent ? this.parent.getState() : null;
    const blankIndex = this.state.blankIndex();
    const parentBlankIndex = parentState ? parentState.blankIndex() : {row: -1, col: -1};

    const rowDiff = blankIndex.row - parentBlankIndex.row;
    const colDiff = blankIndex.col - parentBlankIndex.col;

    if (rowDiff === 0 && colDiff === 1) {
      return 'left';
    } else if (rowDiff === 0 && colDiff === -1) {
      return 'right';
    } else if (rowDiff === 1 && colDiff === 0) {
      return 'up';
    } else if (rowDiff === -1 && colDiff === 0) {
      return 'down';
    }

    return null; // Blank tile did not move in a valid direction
  }
}

export default Shuffler;