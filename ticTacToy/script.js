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
    currentPlayer = 'X';
    gameActive = true;
    statusDisplay.textContent = `Player ${currentPlayer}'s turn`;
    
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

// Handle cell click
function handleCellClick(event) {
    const clickedCellIndex = parseInt(event.target.getAttribute('data-index'));
    
    // Check if cell is already filled or game is not active
    if (board[clickedCellIndex] !== '' || !gameActive) {
        return;
    }
    
    // Update the game state
    board[clickedCellIndex] = currentPlayer;
    event.target.textContent = currentPlayer;
    
    // Check for win or draw
    checkGameResult();
}

// Check for win or draw
function checkGameResult() {
    let roundWon = false;
    
    // Check for winning combinations
    for (let i = 0; i < winningCombinations.length; i++) {
        const [a, b, c] = winningCombinations[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            roundWon = true;
            break;
        }
    }
    
    if (roundWon) {
        statusDisplay.textContent = `Player ${currentPlayer} wins!`;
        gameActive = false;
        return;
    }
    
    // Check for draw
    if (!board.includes('')) {
        statusDisplay.textContent = 'Game ended in a draw!';
        gameActive = false;
        return;
    }
    
    // Continue the game with the next player
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    statusDisplay.textContent = `Player ${currentPlayer}'s turn`;
}

// Add event listener to reset button
resetButton.addEventListener('click', initializeGame);

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', initializeGame);