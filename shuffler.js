import seedrandom from 'seedrandom';

export class Shuffler {
  constructor(board, maxDepth, minMisplaced) {
    this.board = board;
    this.maxDepth = maxDepth || 0;
    this.minMisplaced = minMisplaced;

    const currentTimestamp = Date.now().toString();
    this.random = seedrandom(currentTimestamp);

    this.goalState = this.board.getGoalState();
    this.root = new ShuffleNode(this.goalState, this.goalState, null, 0);
    this.shuffleQueue = [];
  }

  shuffle() {
    const stack = [this.root];
    const visited = new Set();

    while (stack.length > 0) {
      const currentNode = stack.pop();
      if(visited.has(currentNode.state))
        continue;

      // Skip exploring nodes beyond the maximum allowed depth
      const currentDepth = currentNode.depth;
      if (this.maxDepth && this.maxDepth > 0 && currentDepth > this.maxDepth) {
        visited.add(currentNode.state);
        continue;
      }
      
      const currentDistance = currentNode.getStateDistance(this.goalState);
      const neighborStates = currentNode.getNeighborStates();

      // Check if all neighboring nodes have already been visited,
      //  and if so, skip exploring them
      let allVisited = true;
      for(const neighborState of neighborStates) {
        if(!visited.has(neighborState)) {
          allVisited = false;
          break;
        }
      }

      if(allVisited) {
        if(currentNode === this.root) {
          // All possible paths have been visited
          if(stack.length > 0) {
            this.buildShuffleQueue(currentNode);
            return this.shuffleQueue;
          }
          // No valid board state was found. Consider using a
          //  higher max depth, or higher minMisplaced value(s)
          return null;
        }

        // All neighbors of this node have been visited, so
        //  let's skip this node from now on
        visited.add(currentNode.state);
        continue;
      }

      if (stack.length >= this.maxDepth && currentDistance.misplaced >= this.minMisplaced) {
        // Shuffle successful, build the queue of valid moves
        this.buildShuffleQueue(currentNode);
        return this.shuffleQueue;
      }

      //const shuffledIndices = this.getShuffledIndices(neighborStates);
      const shuffledNeighborStates = this.shuffleArray(neighborStates);
      
      for (let i = 0; i < shuffledNeighborStates.length; i++) {
        const state = shuffledNeighborStates[i];
        const newNode = new ShuffleNode(state, this.goalState, currentNode, currentDepth + 1);
        if(!visited.has(newNode.state))
          stack.push(newNode);
      }
    }

    if(stack.length > 0) {
      this.buildShuffleQueue(currentNode);
      return this.shuffleQueue;
    }

    // All possible paths have been visited, but no valid board was found.
    // Consider using a higher max depth, or higher minMisplaced value(s)
    return null;
  }

  shuffleArray(array) {
    const shuffledArray = [...array];

    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(this.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }

    return shuffledArray;
  }

  getShuffledIndices(neighborStates) {
    let shuffledIndices = [];
    const maxIndex = neighborStates.length;

    function isSequential(array) {
      for (let i = 0; i < array.length - 1; i++) {
        if (array[i] + 1 !== array[i + 1]) {
          return false;
        }
      }
      return true;
    }
  
    while (shuffledIndices.length < Math.min(maxIndex, 4)) {
      const randomIndex = Math.floor(this.random() * maxIndex);
  
      if (!shuffledIndices.includes(randomIndex)) {
        shuffledIndices.push(randomIndex);
      }
    }

    if (isSequential(neighborStates.map((_, index) => index))) {
      // If the indices are sequential, return the indices in the order of the state with the highest distance
      shuffledIndices = neighborStates
        .map((state, index) => ({ state, index }))
        .sort((a, b) => {
          const distanceA = a.state.distanceFrom(this.goalState).totalAverage;
          const distanceB = b.state.distanceFrom(this.goalState).totalAverage;
          const distanceDiff = distanceB - distanceA;
          if(distanceDiff === 0)
            return -1;
          return distanceDiff;
        })
        .map(({ index }) => index);
    }

    return shuffledIndices;
  }

  buildShuffleQueue(currentNode) {
    const queue = [];

    while (currentNode !== null) {
      queue.unshift({state: currentNode.getState(), move: currentNode.getMoveDirection()});
      currentNode = currentNode.parent;
    }

    this.shuffleQueue = queue.slice(1).reverse();
  }

  getShuffleQueue() {
    return this.shuffleQueue;
  }

  assign() {
    this.board.setState(this.shuffleQueue[this.shuffleQueue.length - 1]?.state);
    return this.board;
  }
}

class ShuffleNode {
  constructor(state, goalState, parent, depth) {
    this.state = state;
    this.goalState = goalState;
    this.parent = parent;
    this.depth = depth;
    this.neighbors = this.getNeighborStates();
    this.distance = this.getStateDistance();
    this.moveDirection = this.getMoveDirection();
  }

  getState() {
    return this.state;
  }

  getNeighborStates() {
    return this.state.getNeighborStates();
  }

  getStateDistance() {
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