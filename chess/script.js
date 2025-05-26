// 🚀 WORKING CHESS GAME - ENHANCED VERSION
console.log('🚀 Loading enhanced chess game...');

// ===== 🎮 GAME VARIABLES =====
let gameBoard = [];
let currentPlayer = 'white';
let selectedSquare = null;
let gameOver = false;

// ♟️ Chess pieces symbols
const chessPieces = {
    'WK': '♔', 'WQ': '♕', 'WR': '♖', 'WB': '♗', 'WN': '♘', 'WP': '♙',
    'BK': '♚', 'BQ': '♛', 'BR': '♜', 'BB': '♝', 'BN': '♞', 'BP': '♟'
};

// ===== 🏗️ BOARD SETUP =====
function setupBoard() {
    console.log('📋 Setting up chess board...');
    
    // Initialize empty 8x8 board
    gameBoard = Array(8).fill().map(() => Array(8).fill(''));
    
    // Place starting pieces
    gameBoard[0] = ['BR','BN','BB','BQ','BK','BB','BN','BR'];
    gameBoard[1] = ['BP','BP','BP','BP','BP','BP','BP','BP'];
    gameBoard[6] = ['WP','WP','WP','WP','WP','WP','WP','WP'];
    gameBoard[7] = ['WR','WN','WB','WQ','WK','WB','WN','WR'];
    
    console.log('✅ Board setup complete!');
}

// ===== 🎨 RENDER BOARD =====
function renderBoard() {
    console.log('🎨 Rendering board...');
    
    const boardElement = document.getElementById('board');
    if (!boardElement) {
        console.error('❌ Board element not found!');
        return;
    }
    
    // Clear and setup grid
    boardElement.innerHTML = '';
    boardElement.style.display = 'grid';
    boardElement.style.gridTemplateColumns = 'repeat(8, 60px)';
    boardElement.style.gridTemplateRows = 'repeat(8, 60px)';
    boardElement.style.gap = '0';
    
    // Create squares
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.className = 'square';
            square.dataset.row = row;
            square.dataset.col = col;
            
            // Add click handler
            square.addEventListener('click', () => handleSquareClick(row, col));
            
            // Basic styling
            square.style.width = '60px';
            square.style.height = '60px';
            square.style.display = 'flex';
            square.style.alignItems = 'center';
            square.style.justifyContent = 'center';
            square.style.fontSize = '40px';
            square.style.border = '1px solid #333';
            square.style.boxSizing = 'border-box';
            square.style.cursor = 'pointer';
            square.style.userSelect = 'none';
            
            // Checkerboard colors
            if ((row + col) % 2 === 0) {
                square.style.backgroundColor = '#f0d9b5';
            } else {
                square.style.backgroundColor = '#b58863';
            }
            
            // Add piece if exists
            const piece = gameBoard[row][col];
            if (piece && chessPieces[piece]) {
                square.textContent = chessPieces[piece];
                console.log(`Placed ${piece} (${chessPieces[piece]}) at [${row},${col}]`);
            }
            
            boardElement.appendChild(square);
        }
    }
    
    console.log('✅ Board rendered successfully!');
}

// ===== 🖱️ HANDLE CLICKS =====
function handleSquareClick(row, col) {
    console.log(`🖱️ Clicked square [${row},${col}]`);
    
    if (gameOver) {
        console.log('🛑 Game is over, ignoring clicks');
        return;
    }
    
    if (currentPlayer !== 'white') {
        console.log('🤖 It\'s computer\'s turn, ignoring clicks');
        return;
    }
    
    const piece = gameBoard[row][col];
    const clickedSquare = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    
    // If no piece is selected
    if (!selectedSquare) {
        if (piece && isPlayerPiece(piece, currentPlayer)) {
            // Select this piece
            selectedSquare = {row, col};
            highlightSquare(clickedSquare, true);
            console.log(`✅ Selected piece: ${piece} at [${row},${col}]`);
        } else {
            console.log('❌ Cannot select this square');
        }
        return;
    }
    
    // If clicking the same square, deselect
    if (selectedSquare.row === row && selectedSquare.col === col) {
        clearHighlights();
        selectedSquare = null;
        console.log('🚫 Deselected piece');
        return;
    }
    
    // Try to move piece
    if (isValidMove(selectedSquare.row, selectedSquare.col, row, col)) {
        makeMove(selectedSquare.row, selectedSquare.col, row, col);
        clearHighlights();
        selectedSquare = null;
        switchPlayer();
        updateStatus();
    } else {
        console.log('❌ Invalid move');
    }
}

// ===== 🔍 HELPER FUNCTIONS =====
function isPlayerPiece(piece, player) {
    if (!piece) return false;
    return (player === 'white' && piece[0] === 'W') || 
           (player === 'black' && piece[0] === 'B');
}

function highlightSquare(square, highlight) {
    if (highlight) {
        square.style.boxShadow = '0 0 10px 3px rgba(255, 215, 0, 0.8)';
    } else {
        square.style.boxShadow = 'none';
    }
}

function clearHighlights() {
    document.querySelectorAll('.square').forEach(square => {
        highlightSquare(square, false);
    });
}

function isValidMove(fromRow, fromCol, toRow, toCol) {
    const fromPiece = gameBoard[fromRow][fromCol];
    const toPiece = gameBoard[toRow][toCol];
    
    if (!fromPiece) return false;
    if (toPiece && fromPiece[0] === toPiece[0]) return false; // Same color
    if (fromRow === toRow && fromCol === toCol) return false; // Same square
    
    const pieceType = fromPiece[1]; // W/B + piece type
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
    
    // Basic piece movement rules
    switch (pieceType) {
        case 'P': // Pawn
            const direction = fromPiece[0] === 'W' ? -1 : 1; // White goes up, black goes down
            const startRow = fromPiece[0] === 'W' ? 6 : 1;
            
            // Forward move
            if (fromCol === toCol && !toPiece) {
                if (toRow === fromRow + direction) return true; // One square
                if (fromRow === startRow && toRow === fromRow + 2 * direction) return true; // Two squares from start
            }
            // Diagonal capture
            if (Math.abs(fromCol - toCol) === 1 && toRow === fromRow + direction && toPiece) {
                return true;
            }
            return false;
            
        case 'R': // Rook
            return (fromRow === toRow || fromCol === toCol) && isPathClear(fromRow, fromCol, toRow, toCol);
            
        case 'N': // Knight
            return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
            
        case 'B': // Bishop
            return rowDiff === colDiff && isPathClear(fromRow, fromCol, toRow, toCol);
            
        case 'Q': // Queen
            return ((fromRow === toRow || fromCol === toCol || rowDiff === colDiff) && 
                    isPathClear(fromRow, fromCol, toRow, toCol));
            
        case 'K': // King
            return rowDiff <= 1 && colDiff <= 1;
            
        default:
            return false;
    }
}

function isPathClear(fromRow, fromCol, toRow, toCol) {
    const rowStep = toRow > fromRow ? 1 : toRow < fromRow ? -1 : 0;
    const colStep = toCol > fromCol ? 1 : toCol < fromCol ? -1 : 0;
    
    let checkRow = fromRow + rowStep;
    let checkCol = fromCol + colStep;
    
    while (checkRow !== toRow || checkCol !== toCol) {
        if (gameBoard[checkRow][checkCol] !== '') {
            return false; // Path blocked
        }
        checkRow += rowStep;
        checkCol += colStep;
    }
    
    return true;
}

function makeMove(fromRow, fromCol, toRow, toCol) {
    const piece = gameBoard[fromRow][fromCol];
    const capturedPiece = gameBoard[toRow][toCol];
    
    // Move piece
    gameBoard[toRow][toCol] = piece;
    gameBoard[fromRow][fromCol] = '';
    
    console.log(`📦 Moved ${piece} from [${fromRow},${fromCol}] to [${toRow},${toCol}]`);
    if (capturedPiece) {
        console.log(`💥 Captured ${capturedPiece}`);
    }
    
    // Re-render board
    renderBoard();
}

function switchPlayer() {
    currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
    console.log(`🔄 Switched to ${currentPlayer} player`);
    
    // If it's black's turn, make computer move
    if (currentPlayer === 'black') {
        setTimeout(() => {
            makeComputerMove();
        }, 500); // Small delay for better UX
    }
}

function makeComputerMove() {
    console.log('🤖 Computer is thinking...');
    
    const moves = getAllPossibleMoves('black');
    if (moves.length === 0) {
        console.log('🤖 No moves available for computer');
        return;
    }
    
    // Simple AI: Pick a random move (can be enhanced later)
    const randomMove = moves[Math.floor(Math.random() * moves.length)];
    
    console.log(`🤖 Computer moves: [${randomMove.from.row},${randomMove.from.col}] to [${randomMove.to.row},${randomMove.to.col}]`);
    
    makeMove(randomMove.from.row, randomMove.from.col, randomMove.to.row, randomMove.to.col);
    switchPlayer();
    updateStatus();
}

function getAllPossibleMoves(player) {
    const moves = [];
    
    for (let fromRow = 0; fromRow < 8; fromRow++) {
        for (let fromCol = 0; fromCol < 8; fromCol++) {
            const piece = gameBoard[fromRow][fromCol];
            if (piece && isPlayerPiece(piece, player)) {
                for (let toRow = 0; toRow < 8; toRow++) {
                    for (let toCol = 0; toCol < 8; toCol++) {
                        if (isValidMove(fromRow, fromCol, toRow, toCol)) {
                            moves.push({
                                from: {row: fromRow, col: fromCol},
                                to: {row: toRow, col: toCol},
                                piece: piece
                            });
                        }
                    }
                }
            }
        }
    }
    
    return moves;
}

function updateStatus() {
    const statusElement = document.getElementById('status');
    if (!statusElement) return;
    
    // Check for game ending conditions
    if (isKingCaptured('white')) {
        statusElement.textContent = '🏆 BLACK WINS! The white king has been captured!';
        gameOver = true;
        return;
    }
    
    if (isKingCaptured('black')) {
        statusElement.textContent = '🏆 WHITE WINS! The black king has been captured!';
        gameOver = true;
        return;
    }
    
    // Normal game status
    if (currentPlayer === 'white') {
        statusElement.textContent = '⚪ WHITE\'S TURN - Click your pieces to move!';
    } else {
        statusElement.textContent = '⚫ COMPUTER IS THINKING...';
    }
}

function isKingCaptured(player) {
    const kingSymbol = player === 'white' ? 'WK' : 'BK';
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (gameBoard[row][col] === kingSymbol) {
                return false; // King still exists
            }
        }
    }
    
    return true; // King not found, must be captured
}

// ===== 🎬 START GAME =====
function startGame() {
    console.log('🎮 Starting enhanced chess game...');
    
    const boardElement = document.getElementById('board');
    if (!boardElement) {
        console.error('❌ Board element not found!');
        return;
    }
    
    setupBoard();
    renderBoard();
    updateStatus();
    
    console.log('🎮 Chess game started! White goes first.');
}

// ===== 🚀 INITIALIZE =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM loaded, starting enhanced chess...');
    startGame();
});
