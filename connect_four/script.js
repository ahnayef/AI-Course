// Connect 4 Game - Simple version for beginners

// Game configuration
const ROWS = 6;        // Number of rows in the board
const COLS = 7;        // Number of columns in the board
const PLAYER1 = 1;     // Human player (red pieces)
const PLAYER2 = 2;     // Computer player (yellow pieces)

// Game state variables
let board = [];        // 2D array to store the game board
let currentPlayer = PLAYER1;  // Who's turn it is
let gameOver = false;  // Is the game finished?

// Get HTML elements
const gameBoard = document.getElementById('game-board');
const message = document.getElementById('message');
const resetBtn = document.getElementById('reset-btn');

// Initialize the game when page loads
function initGame() {
    // Create empty board (filled with zeros)
    board = [];
    for (let row = 0; row < ROWS; row++) {
        board[row] = [];
        for (let col = 0; col < COLS; col++) {
            board[row][col] = 0;  // 0 means empty cell
        }
    }
    
    // Reset game state
    currentPlayer = PLAYER1;
    gameOver = false;
    message.textContent = "Your turn! Click a column to drop your piece.";
    
    // Create the visual board
    createBoard();
}

// Create the visual game board in HTML
function createBoard() {
    gameBoard.innerHTML = '';  // Clear existing board
    
    // Create cells for each position
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            
            // Add click event to handle player moves
            cell.addEventListener('click', () => handleCellClick(col));
            
            gameBoard.appendChild(cell);
        }
        // Add line break after each row
        gameBoard.appendChild(document.createElement('br'));
    }
}

// Handle when player clicks on a column
function handleCellClick(col) {
    // Ignore clicks if game is over or it's computer's turn
    if (gameOver || currentPlayer !== PLAYER1) {
        return;
    }
    
    // Try to drop piece in this column
    if (dropPiece(col, PLAYER1)) {
        // Check if player won
        if (checkWin(PLAYER1)) {
            message.textContent = "You won! 🎉";
            gameOver = true;
            return;
        }
        
        // Check if board is full (tie)
        if (isBoardFull()) {
            message.textContent = "It's a tie!";
            gameOver = true;
            return;
        }
        
        // Switch to computer's turn
        currentPlayer = PLAYER2;
        message.textContent = "Computer is thinking...";
        
        // Computer makes move after short delay
        setTimeout(computerMove, 1000);
    }
}

// Drop a piece in the specified column
function dropPiece(col, player) {
    // Find the lowest empty row in this column
    for (let row = ROWS - 1; row >= 0; row--) {
        if (board[row][col] === 0) {
            // Place the piece
            board[row][col] = player;
            updateCell(row, col, player);
            return true;  // Successfully dropped
        }
    }
    return false;  // Column is full
}

// Update the visual appearance of a cell
function updateCell(row, col, player) {
    const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    if (player === PLAYER1) {
        cell.classList.add('player1');
    } else if (player === PLAYER2) {
        cell.classList.add('player2');
    }
}

// Computer AI - Simple algorithm
function computerMove() {
    if (gameOver) return;
    
    let bestCol = -1;
    
    // Strategy 1: Try to win
    for (let col = 0; col < COLS; col++) {
        if (canDropPiece(col)) {
            // Temporarily drop piece
            let row = getLowestRow(col);
            board[row][col] = PLAYER2;
            
            // Check if this wins
            if (checkWin(PLAYER2)) {
                bestCol = col;
                board[row][col] = 0;  // Undo temporary move
                break;
            }
            board[row][col] = 0;  // Undo temporary move
        }
    }
    
    // Strategy 2: Block player from winning
    if (bestCol === -1) {
        for (let col = 0; col < COLS; col++) {
            if (canDropPiece(col)) {
                // Temporarily drop player piece
                let row = getLowestRow(col);
                board[row][col] = PLAYER1;
                
                // Check if this would let player win
                if (checkWin(PLAYER1)) {
                    bestCol = col;
                    board[row][col] = 0;  // Undo temporary move
                    break;
                }
                board[row][col] = 0;  // Undo temporary move
            }
        }
    }
    
    // Strategy 3: Random valid move
    if (bestCol === -1) {
        const validCols = [];
        for (let col = 0; col < COLS; col++) {
            if (canDropPiece(col)) {
                validCols.push(col);
            }
        }
        if (validCols.length > 0) {
            bestCol = validCols[Math.floor(Math.random() * validCols.length)];
        }
    }
    
    // Make the move
    if (bestCol !== -1 && dropPiece(bestCol, PLAYER2)) {
        // Check if computer won
        if (checkWin(PLAYER2)) {
            message.textContent = "Computer won! Try again!";
            gameOver = true;
            return;
        }
        
        // Check if board is full
        if (isBoardFull()) {
            message.textContent = "It's a tie!";
            gameOver = true;
            return;
        }
        
        // Switch back to player
        currentPlayer = PLAYER1;
        message.textContent = "Your turn! Click a column to drop your piece.";
    }
}

// Check if a piece can be dropped in this column
function canDropPiece(col) {
    return board[0][col] === 0;  // Top cell is empty
}

// Get the lowest empty row in a column
function getLowestRow(col) {
    for (let row = ROWS - 1; row >= 0; row--) {
        if (board[row][col] === 0) {
            return row;
        }
    }
    return -1;  // Column is full
}

// Check if a player has won
function checkWin(player) {
    // Check horizontal wins
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col <= COLS - 4; col++) {
            if (board[row][col] === player &&
                board[row][col + 1] === player &&
                board[row][col + 2] === player &&
                board[row][col + 3] === player) {
                return true;
            }
        }
    }
    
    // Check vertical wins
    for (let row = 0; row <= ROWS - 4; row++) {
        for (let col = 0; col < COLS; col++) {
            if (board[row][col] === player &&
                board[row + 1][col] === player &&
                board[row + 2][col] === player &&
                board[row + 3][col] === player) {
                return true;
            }
        }
    }
    
    // Check diagonal wins (top-left to bottom-right)
    for (let row = 0; row <= ROWS - 4; row++) {
        for (let col = 0; col <= COLS - 4; col++) {
            if (board[row][col] === player &&
                board[row + 1][col + 1] === player &&
                board[row + 2][col + 2] === player &&
                board[row + 3][col + 3] === player) {
                return true;
            }
        }
    }
    
    // Check diagonal wins (top-right to bottom-left)
    for (let row = 0; row <= ROWS - 4; row++) {
        for (let col = 3; col < COLS; col++) {
            if (board[row][col] === player &&
                board[row + 1][col - 1] === player &&
                board[row + 2][col - 2] === player &&
                board[row + 3][col - 3] === player) {
                return true;
            }
        }
    }
    
    return false;  // No win found
}

// Check if the board is completely full
function isBoardFull() {
    for (let col = 0; col < COLS; col++) {
        if (board[0][col] === 0) {
            return false;  // Found empty space
        }
    }
    return true;  // No empty spaces
}

// Reset the game
function resetGame() {
    initGame();
}

// Event listeners
resetBtn.addEventListener('click', resetGame);

// Start the game when page loads
initGame();