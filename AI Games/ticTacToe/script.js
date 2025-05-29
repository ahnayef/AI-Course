// Game state variables
let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = true;

// Winning combinations
const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6]             // diagonals
];

// DOM elements
const gameContainer = document.getElementById('game-container');
const statusDisplay = document.getElementById('status');
const resetButton = document.getElementById('reset-button');

// Initialize the game board
function initializeGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X'; // Human player always starts as X
    gameActive = true;
    statusDisplay.textContent = 'Your turn';
    
    // Clear and rebuild the game board
    gameContainer.innerHTML = '';
    
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.setAttribute('data-index', i);
        cell.addEventListener('click', handleCellClick);
        gameContainer.appendChild(cell);
    }
}

// Handle cell click (for human player)
function handleCellClick(event) {
    const clickedCellIndex = parseInt(event.target.getAttribute('data-index'));
    
    // Check if cell is already filled or game is not active
    if (board[clickedCellIndex] !== '' || !gameActive || currentPlayer !== 'X') {
        return;
    }
    
    // Update the game state for human player (X)
    board[clickedCellIndex] = 'X';
    event.target.textContent = 'X';
    
    // Check if the game is over after human move
    if (checkWin('X')) {
        statusDisplay.textContent = 'You win!';
        gameActive = false;
        return;
    }
    
    if (checkDraw()) {
        statusDisplay.textContent = 'Game ended in a draw!';
        gameActive = false;
        return;
    }
    
    // Switch to computer's turn
    currentPlayer = 'O';
    statusDisplay.textContent = 'Computer is thinking...';
    

    setTimeout(makeComputerMove, 400);
}

// Make the computer's move using minimax algorithm
function makeComputerMove() {
    if (!gameActive) return;
    
    // Find the best move for the computer
    const bestMove = findBestMove();
    
    // Update the board with the computer's move
    board[bestMove] = 'O';
    document.querySelector(`.cell[data-index="${bestMove}"]`).textContent = 'O';
    
    // Check if the game is over after computer move
    if (checkWin('O')) {
        statusDisplay.textContent = 'Computer wins!';
        gameActive = false;
        return;
    }
    
    if (checkDraw()) {
        statusDisplay.textContent = 'Game ended in a draw!';
        gameActive = false;
        return;
    }
    
    // Switch back to human player
    currentPlayer = 'X';
    statusDisplay.textContent = 'Your turn';
}

// Check if a player has won
function checkWin(player) {
    for (let i = 0; i < winningCombinations.length; i++) {
        const [a, b, c] = winningCombinations[i];
        if (board[a] === player && board[b] === player && board[c] === player) {
            return true;
        }
    }
    return false;
}

// Check if the game is a draw
function checkDraw() {
    return !board.includes('');
}

// Find the best move for the computer using minimax algorithm
function findBestMove() {
    let bestScore = -Infinity;
    let bestMove;
    
    // Try each empty cell
    for (let i = 0; i < board.length; i++) {
        if (board[i] === '') {
            // Make a temporary move
            board[i] = 'O';
            
            // Calculate the score for this move
            const score = minimax(board, 0, false);
            
            // Undo the move
            board[i] = '';
            
            // Update best move if this move has a higher score
            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }
    
    return bestMove;
}

// Minimax algorithm for determining the best move
function minimax(board, depth, isMaximizing) {
    // Check for terminal states (win, lose, draw)
    if (checkWin('O')) {
        return 10 - depth; // Computer wins (prefer quicker wins)
    }
    
    if (checkWin('X')) {
        return depth - 10; // Human wins (prefer later losses)
    }
    
    if (checkDraw()) {
        return 0; // Draw
    }
    
    if (isMaximizing) {
        // Computer's turn (maximize score)
        let bestScore = -Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = 'O';
                const score = minimax(board, depth + 1, false);
                board[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        // Human's turn (minimize score)
        let bestScore = Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = 'X';
                const score = minimax(board, depth + 1, true);
                board[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

// Add event listener to reset button
resetButton.addEventListener('click', initializeGame);

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', initializeGame);