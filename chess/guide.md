# Simple Chess Game: A Beginner's Guide

Welcome to this beginner-friendly guide for a simple chess game with a computer opponent! This guide explains how the game works and how the computer makes its decisions.

## How to Play

1. Open the `index.html` file in any web browser
2. You play as white and always go first
3. Drag your pieces to make a move
4. The computer will automatically make its move as black
5. The game follows standard chess rules
6. The status display will show whose turn it is and if anyone is in check
7. Use the "New Game" button to start over
8. Use "Flip Board" to change your perspective

## Game Features

- **Highlight Legal Moves**: When you hover over a piece, all possible moves are highlighted
- **Status Display**: Shows whose turn it is, check status, and game results
- **Move History**: Shows the last move made
- **Captured Pieces**: Shows which pieces have been captured by each player
- **Computer Thinking**: Shows when the computer is calculating its move

## How the Code Works

Let's break down the most important parts of the code:

### 1. Game Representation

We use two main libraries:
- **chess.js**: Handles all the chess rules, legal moves, and game state
- **chessboard.js**: Provides the visual board and handling of piece movement

The board is represented in standard chess notation:
- Files (columns) are labeled a through h from left to right
- Ranks (rows) are labeled 1 through 8 from bottom to top
- Each square has a name like "e4" (e file, 4th rank)

### 2. How the Computer Decides Its Move

The computer uses a strategy called "minimax with alpha-beta pruning" to find good moves. Don't worry if that sounds complicated! Here's a simpler explanation:

1. **Piece Values**: Each piece has a value
   - Pawn = 1 point
   - Knight/Bishop = 3 points
   - Rook = 5 points
   - Queen = 9 points
   - King = 100 points (very high to protect it)

2. **Position Evaluation**: Pieces get bonus points for being in good positions
   - Pawns are better when advanced and in the center
   - Knights are better in the center
   - Bishops are better on long diagonals
   - Rooks are better on open files
   - The king is safer near the edge in the early game

3. **Looking Ahead**: The computer looks ahead a few moves to see what might happen
   - It imagines making a move
   - Then it imagines you making your best response
   - Then it chooses the move that leads to the best outcome

### 3. Key Functions

- `initializeBoard()`: Sets up the chess board
- `onDragStart()`, `onDrop()`, `onSnapEnd()`: Handle piece movement
- `onMouseoverSquare()`, `onMouseoutSquare()`: Handle highlighting legal moves
- `updateStatus()`: Updates the game status display
- `makeComputerMove()`: Makes the computer's move
- `evaluateBoard()`: Calculates how good the current position is
- `getBestMove()`: Finds the best move for the computer
- `minimax()`: The algorithm that looks ahead at possible moves

## Simplified Computer Strategy

In plain language, here's how the computer "thinks":

1. "What moves can I make right now?"
2. "For each possible move, what would the board look like after I make it?"
3. "For each of those boards, what's the best move my opponent could make?"
4. "After their best move, how good would my position be?"
5. "I'll choose the move that leads to the best position for me."

The computer evaluates positions by counting up the value of all pieces, adding bonuses for good piece positions, and subtracting the value of the opponent's pieces.

## Tips for Playing Against the Computer

1. **Control the center**: The central squares (d4, d5, e4, e5) are important
2. **Protect your pieces**: Try not to leave pieces undefended
3. **Look for forks**: Try to attack two pieces at once
4. **Develop your pieces early**: Get your knights and bishops out
5. **Castle early**: Move your king to safety
6. **Think ahead**: Try to predict what the computer will do

## Common Chess Terms

- **Check**: When a king is under attack
- **Checkmate**: When a king is in check and cannot escape
- **Stalemate**: When a player has no legal moves but isn't in check (it's a draw)
- **Castling**: A special move involving the king and rook
- **En Passant**: A special pawn capture
- **Promotion**: When a pawn reaches the opposite end of the board and becomes another piece

## Conclusion

This chess game demonstrates basic artificial intelligence concepts in a fun, interactive way. The computer uses a simple but effective strategy to play a decent game of chess.

As you get more comfortable with the game, you might want to explore:
- More advanced chess strategies
- Increasing the computer's "look ahead" depth for a stronger opponent
- Adding more features like move history or timed games

Happy playing!
