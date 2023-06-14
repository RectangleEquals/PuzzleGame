import { MinPriorityQueue } from "@datastructures-js/priority-queue";

export class Solver {
  constructor(board, maxDepth) {
    this.maxDepth = maxDepth || 0;
    this.root = new SolveNode(board.getState(), null, 0);
    this.goalState = board.getGoalState();
    this.solveQueue = [];
  }

  solve() {
    const queue = new MinPriorityQueue(node => node.state.distanceFrom(this.goalState).totalAverage);
    const visited = new Set();

    queue.enqueue(this.root);

    while (!queue.isEmpty()) {
      const currentNode = queue.dequeue();
      if (visited.has(currentNode.state)) continue;

      // Skip exploring nodes beyond the maximum allowed depth
      const currentDepth = currentNode.depth;
      if (this.maxDepth && this.maxDepth > 0 && currentDepth > this.maxDepth) {
        visited.add(currentNode.state);
        continue;
      }

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
          if(queue.size() > 0) {
            this.buildSolveQueue(currentNode);
            return this.solveQueue;
          }
          // No valid board state was found. Consider using a
          //  higher max depth, or higher minDistance value(s)
          return null;
        }

        // All neighbors of this node have been visited, so
        //  let's skip this node from now on
        visited.add(currentNode.state);
        continue;
      }

      if (currentNode.state.equals(this.goalState)) {
        // Solution found, build the queue of moves
        this.buildSolveQueue(currentNode);
        return this.solveQueue;
      }

      for (const state of neighborStates) {
        const newNode = new SolveNode(state, currentNode, currentDepth + 1);
        if (!visited.has(newNode.state)) queue.enqueue(newNode);
      }
    }

    // No solution found
    return null;
  }

  buildSolveQueue(currentNode) {
    const queue = [];

    while (currentNode !== null) {
      queue.unshift({ state: currentNode.getState(), move: currentNode.getMoveDirection() });
      currentNode = currentNode.parent;
    }

    this.solveQueue = queue.slice(1).reverse();
  }

  getSolutionQueue() {
    return this.solveQueue;
  }
}

class SolveNode {
  constructor(state, parent, depth) {
    this.state = state;
    this.parent = parent;
    this.depth = depth;
    this.neighbors = this.getNeighborStates();
    this.moveDirection = this.getMoveDirection();
  }

  getState() {
    return this.state;
  }

  getNeighborStates() {
    return this.state.getNeighborStates();
  }

  getMoveDirection() {
    const parentState = this.parent ? this.parent.getState() : null;
    const blankIndex = this.state.blankIndex();
    const parentBlankIndex = parentState ? parentState.blankIndex() : { row: -1, col: -1 };

    const rowDiff = blankIndex.row - parentBlankIndex.row;
    const colDiff = blankIndex.col - parentBlankIndex.col;

    if (rowDiff === 0 && colDiff === 1) {
      return "left";
    } else if (rowDiff === 0 && colDiff === -1) {
      return "right";
    } else if (rowDiff === 1 && colDiff === 0) {
      return "up";
    } else if (rowDiff === -1 && colDiff === 0) {
      return "down";
    }

    return null; // Blank tile did not move in a valid direction
  }
}

export default Solver;