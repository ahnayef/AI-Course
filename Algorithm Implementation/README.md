# Algorithm Implementation Collection

This repository contains implementations of various important algorithms in artificial intelligence and computer science. Each algorithm is implemented with clear code and documentation to help understand how they work.

## Table of Contents

1. [Breadth-First Search (BFS)](#breadth-first-search-bfs)
2. [Depth-First Search (DFS)](#depth-first-search-dfs)
3. [Depth-Limited Search (DLS)](#depth-limited-search-dls)
4. [Iterative Deepening Search (IDS)](#iterative-deepening-search-ids)
5. [Best-First Search](#best-first-search)
6. [Beam Search](#beam-search)
7. [Bidirectional Search](#bidirectional-search)
8. [Bidirectional Path Search](#bidirectional-path-search)
9. [Hill Climbing](#hill-climbing)
10. [Minimax Algorithm](#minimax-algorithm)
11. [Alpha-Beta Pruning](#alpha-beta-pruning)

## Breadth-First Search (BFS)

### How it Works

Breadth-First Search is a graph traversal algorithm that explores all the neighbor nodes at the present depth prior to moving on to nodes at the next depth level. It uses a queue data structure for traversal.

- Start from a specified node
- Visit all its neighbors before moving to the next level
- Use a queue to maintain the order of nodes to visit
- Mark nodes as visited to avoid cycles

### Applications

- Finding the shortest path in an unweighted graph
- Web crawlers for indexing web pages
- Network broadcasting
- Finding all nodes within a connected component
- Social networking (finding friends within a certain degree of connection)

### Complexity

- **Time Complexity**: O(V + E) where V is the number of vertices and E is the number of edges
- **Space Complexity**: O(V) for the queue and visited set

### Example

```
Input Graph:
A -> B, C
B -> D, E, F
C -> G
F -> H
G -> I

Input: Starting node = A

Output: A B C D E F G H I
```

## Depth-First Search (DFS)

### How it Works

Depth-First Search is a graph traversal algorithm that explores as far as possible along each branch before backtracking. It uses a stack data structure (or recursion) for traversal.

- Start from a specified node
- Explore one path as deeply as possible
- Backtrack when a dead end is reached
- Use a stack or recursion to keep track of nodes
- Mark nodes as visited to avoid cycles

### Applications

- Finding paths between two nodes
- Topological sorting in directed acyclic graphs
- Detecting cycles in a graph
- Solving puzzles with only one solution (like mazes)
- Connected component analysis in images

### Complexity

- **Time Complexity**: O(V + E) where V is the number of vertices and E is the number of edges
- **Space Complexity**: O(V) for the stack and visited set (worst case in a skewed graph)

### Example

```
Input Graph:
A -> B, G
B -> C, D, E
E -> F
G -> H
H -> I

Input: Starting node = A

Output: A G H I B E F D C
```

## Depth-Limited Search (DLS)

### How it Works

Depth-Limited Search is a variant of depth-first search where the search is limited to a maximum depth specified by the user. This prevents the algorithm from getting stuck in very deep or infinite paths.

- Similar to DFS but with a depth parameter
- Stops exploration when the depth limit is reached
- Returns when target is found or all paths within depth limit are explored

### Applications

- Game playing algorithms with fixed-depth lookahead
- Planning algorithms with limited resources
- Avoiding infinite paths in graphs with cycles
- When approximate solutions within a certain search depth are acceptable

### Complexity

- **Time Complexity**: O(b^d) where b is the branching factor and d is the depth limit
- **Space Complexity**: O(d) where d is the depth limit

### Example

```
Input:
Vertices: 10, Edges: 9
Edges: 0-1, 0-2, 1-3, 1-4, 2-5, 2-6, 3-7, 5-8, 8-9
Start: 0, Target: 9, Max Depth: 3

Output: 0 1 2 5 
Target not found within depth
```

## Iterative Deepening Search (IDS)

### How it Works

Iterative Deepening Search combines the benefits of BFS and DLS. It runs DLS with increasing depth limits until the goal is found.

- Starts with depth limit = 0, then increases by 1 in each iteration
- For each depth limit, performs a depth-limited search
- Stops when target is found or maximum depth is reached
- Repeats exploration of nodes at shallower depths

### Applications

- Finding shortest paths in large or infinite graphs
- Game playing algorithms
- Planning with unknown solution depths
- When memory is limited but optimality is required

### Complexity

- **Time Complexity**: O(b^d) where b is the branching factor and d is the depth of the shallowest goal
- **Space Complexity**: O(d) where d is the depth of the shallowest goal

### Example

```
Input:
Vertices: 10, Edges: 9
Edges: 0-1, 0-2, 1-3, 1-4, 2-5, 2-6, 3-7, 5-8, 8-9
Start: 0, Target: 9, Max Depth: 5

Output:
Depth 0: 0
Depth 1: 0 1 2
Depth 2: 0 1 3 4 2 5 6
Depth 3: 0 1 3 7 4 2 5 8 6
Depth 4: 0 1 3 7 4 2 5 8 9
Target found at depth 4
```

## Best-First Search

### How it Works

Best-First Search is an informed search algorithm that selects the path which appears best according to a specified heuristic function. It uses a priority queue to select the most promising node.

- Uses a heuristic function to evaluate nodes
- Expands the most promising node first
- Maintains a priority queue based on heuristic values
- Doesn't guarantee the shortest path

### Applications

- GPS navigation systems
- Robot path planning
- Network routing algorithms
- AI game-playing algorithms
- Resource allocation problems

### Complexity

- **Time Complexity**: O(b^m) where b is the branching factor and m is the maximum depth of the search space
- **Space Complexity**: O(b^m) to store all generated nodes

### Example

```
Input:
Nodes: 14
Edges: {0,1,3}, {0,2,6}, {0,3,5}, {1,4,9}, {1,5,8}, {2,6,12},
       {2,7,14}, {3,8,7}, {8,9,5}, {8,10,6}, {9,11,1}, {9,12,10}, {9,13,2}
Source: 0, Target: 9

Output: 0 1 3 8 9
```

## Beam Search

### How it Works

Beam Search is a heuristic search algorithm that explores a graph by expanding the most promising nodes based on a heuristic function, but limits the number of nodes at each level to a fixed number (beam width).

- Similar to Best-First Search but with limited memory usage
- Maintains only a limited number of best candidates (beam width)
- Discards less promising paths
- Trades optimality for efficiency

### Applications

- Machine translation
- Speech recognition
- Image captioning
- Protein structure prediction
- Game playing with high branching factor

### Complexity

- **Time Complexity**: O(b * k) where b is the beam width and k is the depth
- **Space Complexity**: O(b) where b is the beam width

### Example

```
Input:
Nodes: 8, Edges: 10
Heuristic values: [10, 8, 7, 6, 5, 4, 3, 1]
Edges: 0-1, 0-2, 1-3, 1-4, 2-5, 2-6, 3-7, 4-7, 5-7, 6-7
Start: 0, Goal: 7, Beam width: 2

Output: Goal found at node 7
```

## Bidirectional Search

### How it Works

Bidirectional Search runs two simultaneous searches—one forward from the source and one backward from the target—with the hope of the two searches meeting in the middle.

- Performs BFS from both the start and goal nodes
- Stops when the two searches meet
- Can significantly reduce the search space

### Applications

- Finding shortest paths in large graphs
- Route planning in navigation systems
- Social network connections
- Database query optimization
- Circuit routing

### Complexity

- **Time Complexity**: O(b^(d/2)) where b is the branching factor and d is the shortest path length
- **Space Complexity**: O(b^(d/2)) for storing the frontiers of both searches

### Example

```
Input:
Vertices: 10, Edges: 12
Edges: 0-1, 0-2, 1-3, 1-4, 2-5, 2-6, 3-7, 4-8, 5-9, 6-9, 7-9, 8-9
Start: 0, Target: 9

Output: Target vertex found at depth 3
```

## Bidirectional Path Search

### How it Works

Bidirectional Path Search extends bidirectional search by also reconstructing the complete path from source to target when the two search frontiers meet.

- Similar to bidirectional search with path tracking
- Maintains parent pointers for both forward and backward searches
- Reconstructs the path when the searches meet
- Returns the complete path from source to target

### Applications

- GPS navigation with path reconstruction
- Robot motion planning with path visualization
- Game pathfinding with route display
- Network routing with complete path information
- Any application requiring the actual path, not just a connectivity test

### Complexity

- **Time Complexity**: O(b^(d/2)) where b is the branching factor and d is the shortest path length
- **Space Complexity**: O(b^(d/2)) for storing the frontiers and parent pointers

### Example

```
Input:
Vertices: 10, Edges: 12
Edges: 0-1, 0-2, 1-3, 1-4, 2-5, 2-6, 3-7, 4-8, 5-9, 6-9, 7-9, 8-9
Start: 0, Target: 9

Output:
Target vertex found!
Path: 0 2 5 9
Path length: 3
```

## Hill Climbing

### How it Works

Hill Climbing is a local search optimization algorithm that starts with an arbitrary solution and iteratively makes small changes to improve the solution, stopping when no further improvements can be made.

- Starts with an initial solution
- Examines neighboring solutions
- Moves to the neighbor that improves the current state
- Stops when no improvement is possible
- May get stuck in local optima

### Applications

- Feature selection in machine learning
- Neural network weight optimization
- Job scheduling
- Image processing for noise reduction
- Circuit design optimization

### Complexity

- **Time Complexity**: O(∞) in the worst case (may never terminate for some functions)
- **Space Complexity**: O(1) as it only needs to keep track of the current state and its value

### Example

```
Input:
Function: f(x) = -x² + 10x (to maximize)
Starting value: 2
Step size: 1
Max iterations: 10

Output:
Iteration 1: x = 2, f(x) = 16
Iteration 2: x = 3, f(x) = 21
Iteration 3: x = 4, f(x) = 24
Iteration 4: x = 5, f(x) = 25
Iteration 5: x = 6, f(x) = 24
Hill Climbing stopped at x = 5 with value f(x) = 25
```

## Minimax Algorithm

### How it Works

Minimax is a decision-making algorithm used in two-player games. It recursively evaluates all possible moves, assuming both players play optimally.

- Used in zero-sum games where one player's gain is another's loss
- Recursively evaluates game states down to a certain depth
- MAX player tries to maximize the score
- MIN player tries to minimize the score
- Returns the optimal move for the current player

### Applications

- Board games (Chess, Checkers, Go, etc.)
- Card games
- Game theory
- Decision making under uncertainty
- Automated negotiation systems

### Complexity

- **Time Complexity**: O(b^d) where b is the branching factor and d is the depth of the tree
- **Space Complexity**: O(bd) where b is the branching factor and d is the depth

### Example

```
Input:
Leaf node scores: [5, 6, 7, 4, 5, 3, 6, 6]
Tree depth: 3
Starting player: MAX

Output: The best score is: 5
```

## Alpha-Beta Pruning

### How it Works

Alpha-Beta Pruning is an optimization technique for the minimax algorithm that reduces the number of nodes evaluated in the search tree.

- Enhancement to minimax that prunes branches that cannot influence the final decision
- Maintains two values: alpha (best value for MAX) and beta (best value for MIN)
- Skips evaluating moves that are provably worse than previously examined moves
- Provides the same result as minimax but more efficiently

### Applications

- Chess engines
- Game playing AI for complex games
- Decision trees in competitive environments
- Adversarial search problems
- Resource allocation with competing interests

### Complexity

- **Time Complexity**: O(b^(d/2)) in the best case, where b is the branching factor and d is the depth
- **Space Complexity**: O(bd) where b is the branching factor and d is the depth

### Example

```
Input:
Game tree with 33 nodes
14 leaf nodes with values [5, 6, 7, 4, 5, 3, 6, 6, 9, 7, 5, 9, 8, 6]
Root is MAX node

Output: Optimal value using Alpha-Beta Pruning: 6
```