# Simple Chess Game: A Complete Beginner's Guide

Welcome to this comprehensive guide for our simple chess game with a computer opponent! Whether you've never played chess before or you're curious about how the game works behind the scenes, this guide will walk you through everything step by step.

## How to Play

1. Open the `index.html` file in any web browser (Chrome, Firefox, Safari, etc.)
2. You'll see a chess board with white pieces at the bottom and black pieces at the top
3. You play as white and always go first
4. To move a piece:
   - Click and hold on the piece you want to move
   - Drag it to the square where you want to place it
   - Release the mouse button to complete the move
5. The computer will automatically respond with a move as black
6. The status display above the board will show whose turn it is and if anyone is in check
7. Use the "New Game" button to reset the board and start over
8. Use the "Flip Board" button to view the board from the opposite perspective

## Game Features Explained

- **Highlighted Legal Moves**: When you hover your mouse over a piece, all squares where that piece can legally move will be highlighted in gray. This helps you see all your options.

  *Example*: If you hover over a knight at the start of the game, you'll see two squares highlighted (the only legal moves for knights initially).

- **Status Display**: The text above the board shows:
  - Whose turn it is (yours or the computer's)
  - If a king is in check
  - If the game is over (checkmate or draw)
  
  *Example*: "Your turn (white)" or "Computer is in check!"

- **Last Move Display**: Shows the most recent move made in chess notation.
  
  *Example*: "e2 to e4" means a piece moved from square e2 to square e4.

- **Captured Pieces**: Shows which pieces have been captured by each player.
  
  *Example*: "White captured: ♟♟ | Black captured: ♙" means white has captured two black pawns, and black has captured one white pawn.

- **Computer Thinking**: Shows when the computer is calculating its next move.
  
  *Example*: "Calculating best move..." appears while the computer is deciding what to play.

## Basic Chess Rules for Beginners

If you're new to chess, here are the essential rules:

1. **Objective**: Checkmate your opponent's king (trap it so it cannot escape capture)
2. **Piece Movements**:
   - **Pawn (♙/♟)**: Moves forward one square, or two squares on its first move. Captures diagonally.
   - **Knight (♘/♞)**: Moves in an "L-shape" - two squares in one direction, then one square perpendicular.
   - **Bishop (♗/♝)**: Moves diagonally any number of squares.
   - **Rook (♖/♜)**: Moves horizontally or vertically any number of squares.
   - **Queen (♕/♛)**: Moves like a bishop or rook - diagonally, horizontally, or vertically any number of squares.
   - **King (♔/♚)**: Moves one square in any direction.
3. **Special Moves**:
   - **Castling**: King moves two squares toward a rook, and the rook moves to the square the king crossed.
   - **Pawn Promotion**: When a pawn reaches the opposite end of the board, it can be replaced with a queen, rook, bishop, or knight.
   - **En Passant**: A special pawn capture after an opponent's pawn makes a two-square advance.
4. **Check**: When a king is under attack. The player must move their king, block the attack, or capture the attacking piece.
5. **Checkmate**: When a king is in check and cannot escape. The game ends.
6. **Stalemate**: When a player has no legal moves but their king is not in check. The game is a draw.

## How the Code Works: A Simple Explanation

Our chess game is built using HTML, CSS, and JavaScript. Let's break down the most important parts:

### 1. Game Representation and Setup

We use two main libraries to handle the chess logic and display:

- **chess.js**: Handles all the chess rules, legal moves, and game state
- **chessboard.js**: Provides the visual board and handling of piece movement

The board uses standard chess notation:
- Files (columns) are labeled a through h from left to right
- Ranks (rows) are labeled 1 through 8 from bottom to top
- Each square has a name like "e4" (e file, 4th rank)

**Example from the code:**
```javascript
// Initialize the chess game
let board = null; // chessboard.js board
let game = new Chess(); // chess.js game

// Initialize the board when the page loads
$(document).ready(() => {
    initializeBoard();
});

// Initialize the board
async function initializeBoard() {
    // Configuration for the chessboard
    const config = {
        draggable: true,
        position: 'start',
        onDragStart: onDragStart,
        onDrop: onDrop,
        onMouseoverSquare: onMouseoverSquare,
        onSnapEnd: onSnapEnd,
        pieceTheme: 'img/chesspieces/wikipedia/{piece}.png'
    };
    
    // Initialize the board
    board = Chessboard('board', config);
    
    // Update status
    updateStatus();
}
```

This code creates a new chess game and a chessboard with the starting position. The configuration tells the board how to behave when you interact with it.

### 2. Handling Player Moves

When you try to move a piece, several functions work together to handle your move:

**Example from the code:**
```javascript
// Handle piece drag start
function onDragStart(source, piece, position, orientation) {
    // Do not allow dragging if the game is over
    if (game.game_over()) return false;
    
    // Only allow dragging our own pieces (white)
    if (piece.search(/^b/) !== -1) return false;
    
    // Only allow dragging if it's our turn
    if (game.turn() !== 'w') return false;
}

// Handle piece drop
function onDrop(source, target) {
    // Remove highlights
    removeHighlights();
    
    // Try the move
    const move = game.move({
        from: source,
        to: target,
        promotion: 'q' // Always promote to queen for simplicity
    });
    
    // Illegal move
    if (move === null) return 'snapback';
    
    // Update status and display
    updateStatus();
    
    // Computer's turn
    setTimeout(makeComputerMove, 250);
}
```

This code:
1. Checks if you're allowed to move a piece (game not over, it's your turn, it's your piece)
2. When you drop a piece, it attempts to make that move in the game
3. If the move is illegal, it snaps the piece back to its original position
4. If the move is legal, it updates the game status and lets the computer make its move

### 3. Key Functions

- `initializeBoard()`: Sets up the chess board
- `onDragStart()`, `onDrop()`, `onSnapEnd()`: Handle piece movement
- `onMouseoverSquare()`, `onMouseoutSquare()`: Handle highlighting legal moves
- `updateStatus()`: Updates the game status display
- `makeComputerMove()`: Makes the computer's move
- `evaluateBoard()`: Calculates how good the current position is
- `getBestMove()`: Finds the best move for the computer
- `minimax()`: The algorithm that looks ahead at possible moves

## How the Computer AI Works: Simple Explanation

The computer uses a technique called the "minimax algorithm" to decide its moves. Here's how it works in simple terms:

1. **Look Ahead**: The computer looks ahead 2 moves (one move by each player).
2. **Evaluate Positions**: After looking ahead, it judges how good each position is.
3. **Choose Best Move**: It picks the move that leads to the best position for itself.

### How Positions Are Evaluated

The computer judges positions using just three main factors:

1. **Material Value** (most important): 
   - Pawn = 1 point
   - Knight/Bishop = 3 points
   - Rook = 5 points
   - Queen = 9 points
   
   *Example*: If you capture a knight (worth 3 points), that's a big advantage.

2. **Center Control**: Controlling the center squares (d4, d5, e4, e5) is rewarded.
   
   *Example*: Having a knight in the center is better than at the edge of the board.

3. **King Safety**: The computer checks if kings are in safe positions.
   
   *Example*: A castled king gets a safety bonus.

4. **Randomness**: A small random factor is added to prevent repetitive play.

The computer adds up these factors to decide which move is best. It plays at a good beginner level - challenging but not overwhelming.

### Inside the Minimax Search Algorithm

The computer uses a technique called "minimax with alpha-beta pruning" to look ahead. Here's how it works:

1. **Minimax**: This algorithm assumes:
   - The computer (maximizing player) tries to get the highest score possible
   - The human (minimizing player) tries to get the lowest score possible

2. **Alpha-Beta Pruning**: This is a technique to avoid analyzing moves that won't affect the final decision.
   
   *Example*: If the computer already found a guaranteed +3 position, it can skip analyzing moves that will at best give +2.

3. **Search Depth**: The computer looks ahead 2 moves deep, which provides a good balance between performance and playing strength for beginners.

Here's a simplified code example of the minimax algorithm:

```javascript
function minimax(depth, isMaximizingPlayer, alpha, beta) {
    // Base case: reached maximum depth, evaluate the position
    if (depth === 0) {
        return evaluateBoard();
    }
    
    // Get all possible moves
    const possibleMoves = game.moves();
    
    // Game over check
    if (possibleMoves.length === 0) {
        if (game.in_checkmate()) {
            return isMaximizingPlayer ? -9999 : 9999;
        }
        return 0; // Draw
    }
    
    if (isMaximizingPlayer) {
        // Computer's turn, maximize score
        let bestValue = -9999;
        
        for (let i = 0; i < possibleMoves.length; i++) {
            // Make the move
            game.move(possibleMoves[i]);
            
            // Recursively get value
            const value = minimax(depth - 1, false, alpha, beta);
            
            // Undo the move
            game.undo();
            
            // Update best value
            bestValue = Math.max(bestValue, value);
            
            // Alpha-beta pruning
            alpha = Math.max(alpha, bestValue);
            if (beta <= alpha) {
                break; // Prune this branch
            }
        }
        
        return bestValue;
    } else {
        // Human's turn, minimize score
        let bestValue = 9999;
        
        for (let i = 0; i < possibleMoves.length; i++) {
            // Make the move
            game.move(possibleMoves[i]);
            
            // Recursively get value
            const value = minimax(depth - 1, true, alpha, beta);
            
            // Undo the move
            game.undo();
            
            // Update best value
            bestValue = Math.min(bestValue, value);
            
            // Alpha-beta pruning
            beta = Math.min(beta, bestValue);
            if (beta <= alpha) {
                break; // Prune this branch
            }
        }
        
        return bestValue;
    }
}
```

### Additional AI Improvements

The computer has a few enhancements that make it play better:

1. **Alpha-Beta Pruning**: This makes the search more efficient by skipping analysis of moves that won't affect the final decision.

2. **Randomness**: A small random factor (±0.025 points) is added to avoid predictable play and make each game different.

## Tips for Playing Against the Computer

1. **Control the center**: Try to get your pawns and knights to the center squares (d4, d5, e4, e5).
2. **Protect your pieces**: Don't leave pieces where they can be captured without gaining something in return.
3. **Develop your pieces early**: Get your knights and bishops out from their starting positions.
4. **Castle early**: Move your king to safety by castling (a special move with your rook).
5. **Look for captures**: Always check if you can capture one of the computer's pieces safely.

## Common Chess Terms

- **Check**: When a king is under attack by an enemy piece.
- **Checkmate**: When a king is in check and has no way to escape. Game over!
- **Stalemate**: When a player has no legal moves but isn't in check. It's a draw.
- **Castling**: A special move where the king moves two squares toward a rook, and the rook moves to the other side of the king.
- **En Passant**: A special pawn capture when an opponent's pawn moves two squares forward from its starting position.
- **Promotion**: When a pawn reaches the opposite end of the board and becomes a stronger piece (usually a queen).

## Common Chess Terms and Concepts Explained

### Basic Terms

- **Check**: When a king is under direct attack by an enemy piece. The player must get out of check immediately.
  
  *Example*: If your bishop moves to c4 and attacks the computer's king, you would announce "check."

- **Checkmate**: When a king is in check and has no legal move to escape. This ends the game.
  
  *Example*: If the computer's king is on h8, your queen is on h7, and your rook is on g7, the king has no escape - checkmate!

- **Stalemate**: When a player has no legal moves but their king is not in check. The game is a draw.
  
  *Example*: If the computer's king is on a8 with no other pieces, and your queen is on b6, the king can't move but isn't in check - stalemate.

### Special Moves

- **Castling**: A special move where the king moves two squares toward a rook, and the rook moves to the square the king crossed. Requirements:
  - Neither the king nor the rook has moved previously
  - No pieces between the king and rook
  - King is not in check
  - King doesn't move through or into check
  
  *Example*: King on e1 and rook on h1 can castle: king moves to g1, rook to f1.

- **En Passant**: A special pawn capture when an opponent's pawn moves two squares forward from its starting position and lands beside your pawn.
  
  *Example*: Your pawn is on e5. The computer moves a pawn from d7 to d5. You can capture it "en passant" by moving your pawn to d6 (capturing the pawn as if it had only moved one square).

- **Promotion**: When a pawn reaches the opposite end of the board, it can be converted to a queen, rook, bishop, or knight.
  
  *Example*: Your pawn reaches the 8th rank. You can promote it to a queen (most common) for maximum power.

### Tactical Concepts

- **Fork**: A piece attacks two or more enemy pieces simultaneously.
  
  *Example*: A knight on d5 attacking both a queen on c7 and a rook on f6.

- **Pin**: A piece is prevented from moving because it would expose a more valuable piece to attack.
  
  *Example*: Your bishop on g5 pins the computer's knight on f6 to its queen on d8.

- **Skewer**: Similar to a pin, but the more valuable piece is in front.
  
  *Example*: Your rook on e1 attacks the computer's queen on e6, and behind it is the king on e8. If the queen moves, the king is in check.

- **Discovered Attack**: A piece moves out of the way, revealing an attack from another piece behind it.
  
  *Example*: Your bishop on e4 blocks your rook from attacking the computer's queen. Moving the bishop while checking the king creates a discovered attack on the queen.

### Positional Concepts

- **Center Control**: Dominating the central squares (d4, d5, e4, e5) with pieces or pawns.
  
  *Example*: Having pawns on d4 and e4 controls the center.

- **Development**: Moving pieces off their starting squares to active positions.
  
  *Example*: Moving knights to f3 and c3, bishops to active diagonals.

- **King Safety**: Protecting your king, usually by castling and maintaining a pawn shield.
  
  *Example*: Castling kingside with pawns on f2, g2, and h2 protecting the king.

- **Pawn Structure**: The arrangement of pawns, which influences the entire game plan.
  
  *Example*: The "pawn chain" where pawns protect each other diagonally.

- **Zugzwang**: A position where any move a player makes will worsen their position.
  
  *Example*: In endgames, when a player must move their king away from defending a pawn.

## Conclusion

This chess game provides a fun way to practice chess against a computer opponent. The AI is designed to be challenging but not overwhelming for beginners.

As you get better at chess, you might want to try:
- Learning some basic chess openings
- Practicing different strategies
- Playing against friends or other online opponents

Remember, chess is a game of practice and patience. The more you play, the better you'll get!

Happy playing!
