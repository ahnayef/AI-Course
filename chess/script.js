// Initialize the chess game
let board = null; // chessboard.js board
let game = new Chess(); // chess.js game
let whiteSquareGrey = '#a9a9a9'; // Color for highlighting possible moves
let blackSquareGrey = '#696969'; // Color for highlighting possible moves on dark squares
let $status = $('#status'); // Game status element
let $thinking = $('#thinking'); // Computer thinking element
let $lastMove = $('#last-move'); // Last move element
let $captured = $('#captured'); // Captured pieces element

// Piece values for evaluation
const pieceValues = {
    'p': 1,  // pawn
    'n': 3,  // knight
    'b': 3,  // bishop
    'r': 5,  // rook
    'q': 9,  // queen
    'k': 100 // king (high value to prioritize king safety)
};

// Position bonus values (simplified)
const positionBonus = {
    'p': [ // Pawns are better in the center and advanced
        0,  0,  0,  0,  0,  0,  0,  0,
        50, 50, 50, 50, 50, 50, 50, 50,
        10, 10, 20, 30, 30, 20, 10, 10,
        5,  5, 10, 25, 25, 10,  5,  5,
        0,  0,  0, 20, 20,  0,  0,  0,
        5, -5,-10,  0,  0,-10, -5,  5,
        5, 10, 10,-20,-20, 10, 10,  5,
        0,  0,  0,  0,  0,  0,  0,  0
    ],
    'n': [ // Knights are better in the center
        -50,-40,-30,-30,-30,-30,-40,-50,
        -40,-20,  0,  0,  0,  0,-20,-40,
        -30,  0, 10, 15, 15, 10,  0,-30,
        -30,  5, 15, 20, 20, 15,  5,-30,
        -30,  0, 15, 20, 20, 15,  0,-30,
        -30,  5, 10, 15, 15, 10,  5,-30,
        -40,-20,  0,  5,  5,  0,-20,-40,
        -50,-40,-30,-30,-30,-30,-40,-50
    ],
    'b': [ // Bishops are better in the center and on long diagonals
        -20,-10,-10,-10,-10,-10,-10,-20,
        -10,  0,  0,  0,  0,  0,  0,-10,
        -10,  0, 10, 10, 10, 10,  0,-10,
        -10,  5,  5, 10, 10,  5,  5,-10,
        -10,  0,  5, 10, 10,  5,  0,-10,
        -10,  5,  5,  5,  5,  5,  5,-10,
        -10,  0,  5,  0,  0,  5,  0,-10,
        -20,-10,-10,-10,-10,-10,-10,-20
    ],
    'r': [ // Rooks are better on open files
        0,  0,  0,  0,  0,  0,  0,  0,
        5, 10, 10, 10, 10, 10, 10,  5,
        -5,  0,  0,  0,  0,  0,  0, -5,
        -5,  0,  0,  0,  0,  0,  0, -5,
        -5,  0,  0,  0,  0,  0,  0, -5,
        -5,  0,  0,  0,  0,  0,  0, -5,
        -5,  0,  0,  0,  0,  0,  0, -5,
        0,  0,  0,  5,  5,  0,  0,  0
    ],
    'q': [ // Queen combines rook and bishop mobility
        -20,-10,-10, -5, -5,-10,-10,-20,
        -10,  0,  0,  0,  0,  0,  0,-10,
        -10,  0,  5,  5,  5,  5,  0,-10,
        -5,  0,  5,  5,  5,  5,  0, -5,
        0,  0,  5,  5,  5,  5,  0, -5,
        -10,  5,  5,  5,  5,  5,  0,-10,
        -10,  0,  5,  0,  0,  0,  0,-10,
        -20,-10,-10, -5, -5,-10,-10,-20
    ],
    'k': [ // King safety is important in the early/midgame
        -30,-40,-40,-50,-50,-40,-40,-30,
        -30,-40,-40,-50,-50,-40,-40,-30,
        -30,-40,-40,-50,-50,-40,-40,-30,
        -30,-40,-40,-50,-50,-40,-40,-30,
        -20,-30,-30,-40,-40,-30,-30,-20,
        -10,-20,-20,-20,-20,-20,-20,-10,
        20, 20,  0,  0,  0,  0, 20, 20,
        20, 30, 10,  0,  0, 10, 30, 20
    ]
};

// Initialize the board
function initializeBoard() {
    // Configuration for the chessboard
    const config = {
        draggable: true,
        position: 'start',
        onDragStart: onDragStart,
        onDrop: onDrop,
        onMouseoutSquare: onMouseoutSquare,
        onMouseoverSquare: onMouseoverSquare,
        onSnapEnd: onSnapEnd
    };
    
    // Initialize the board
    board = Chessboard('board', config);
    
    // Update status
    updateStatus();
}

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

// Update board position after the piece snap animation
function onSnapEnd() {
    board.position(game.fen());
}

// Highlight possible moves
function onMouseoverSquare(square, piece) {
    // Get all possible moves for this square
    const moves = game.moves({
        square: square,
        verbose: true
    });
    
    // If there are no moves available, return
    if (moves.length === 0) return;
    
    // Highlight the square
    highlightSquare(square);
    
    // Highlight possible moves
    for (let i = 0; i < moves.length; i++) {
        highlightSquare(moves[i].to);
    }
}

// Remove highlights on mouseout
function onMouseoutSquare(square, piece) {
    removeHighlights();
}

// Highlight a square
function highlightSquare(square) {
    const $square = $('#board .square-' + square);
    
    // Get the background color based on square color
    let backgroundColor = $square.hasClass('black-3c85d') ? blackSquareGrey : whiteSquareGrey;
    
    $square.css('background', backgroundColor);
}

// Remove all highlights
function removeHighlights() {
    $('#board .square-55d63').css('background', '');
}

// Update the game status
function updateStatus() {
    let status = '';
    
    // Check for checkmate
    if (game.in_checkmate()) {
        status = 'Game over, ' + (game.turn() === 'w' ? 'black' : 'white') + ' wins by checkmate!';
    }
    // Check for draw
    else if (game.in_draw()) {
        status = 'Game over, drawn position';
    }
    // Game still going
    else {
        status = (game.turn() === 'w' ? 'Your turn (white)' : 'Computer thinking...');
        
        // Check if we're in check
        if (game.in_check()) {
            status += ', ' + (game.turn() === 'w' ? 'You are' : 'Computer is') + ' in check!';
        }
    }
    
    // Update status
    $status.text(status);
    
    // Update captured pieces
    updateCapturedPieces();
    
    // Update last move
    const history = game.history({ verbose: true });
    if (history.length > 0) {
        const lastMove = history[history.length - 1];
        $lastMove.text(lastMove.from + ' to ' + lastMove.to);
    } else {
        $lastMove.text('None');
    }
}

// Update captured pieces display
function updateCapturedPieces() {
    // Get the current position as a FEN string
    const fen = game.fen();
    
    // Count each piece type
    const pieceCounts = {
        'p': 8, 'n': 2, 'b': 2, 'r': 2, 'q': 1, 'k': 1,
        'P': 8, 'N': 2, 'B': 2, 'R': 2, 'Q': 1, 'K': 1
    };
    
    // Subtract pieces still on the board
    for (let i = 0; i < fen.length; i++) {
        const char = fen.charAt(i);
        if (pieceCounts[char] !== undefined) {
            pieceCounts[char]--;
        }
        if (char === ' ') break; // Stop at the end of the position part of FEN
    }
    
    // Build captured pieces string
    let whiteCaptured = '';
    let blackCaptured = '';
    
    for (const piece in pieceCounts) {
        const count = pieceCounts[piece];
        
        if (count > 0) {
            const pieceSymbol = getPieceSymbol(piece);
            
            if (piece === piece.toUpperCase()) {
                // Black captured white pieces
                blackCaptured += pieceSymbol.repeat(count);
            } else {
                // White captured black pieces
                whiteCaptured += pieceSymbol.repeat(count);
            }
        }
    }
    
    // Update the display
    $captured.text('White captured: ' + (whiteCaptured || 'None') + ' | Black captured: ' + (blackCaptured || 'None'));
}

// Get Unicode symbol for a piece
function getPieceSymbol(piece) {
    const symbols = {
        'p': '♟', 'n': '♞', 'b': '♝', 'r': '♜', 'q': '♛', 'k': '♚',
        'P': '♙', 'N': '♘', 'B': '♗', 'R': '♖', 'Q': '♕', 'K': '♔'
    };
    
    return symbols[piece] || piece;
}

// Make the computer's move
function makeComputerMove() {
    // Do nothing if the game is over
    if (game.game_over()) return;
    
    // Show that the computer is thinking
    $thinking.text('Calculating best move...');
    
    // Use setTimeout to avoid blocking UI
    setTimeout(() => {
        // Get the best move
        const move = getBestMove(2); // Look ahead 2 plies (1 full move)
        
        // Make the move
        game.move(move);
        
        // Update the board
        board.position(game.fen());
        
        // Update the status
        updateStatus();
        
        // Update computer thinking display
        $thinking.text('Move calculated');
    }, 100);
}

// Evaluate the current board position
function evaluateBoard() {
    let totalEvaluation = 0;
    
    // Loop through the board
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            // Get the piece at this position
            const piece = game.get(getSquare(i, j));
            
            if (piece !== null) {
                // Add piece value
                totalEvaluation += getAbsolutePieceValue(piece, i, j);
            }
        }
    }
    
    return totalEvaluation;
}

// Get the square notation from coordinates
function getSquare(i, j) {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
    
    return files[j] + ranks[i];
}

// Get the absolute value of a piece with position bonus
function getAbsolutePieceValue(piece, row, col) {
    const pieceType = piece.type.toLowerCase();
    const pieceColor = piece.color;
    
    // Get base piece value
    let value = pieceValues[pieceType];
    
    // Add position bonus (white pieces are evaluated positively, black negatively)
    let squareIndex = row * 8 + col;
    
    // Flip the board for black pieces
    if (pieceColor === 'b') {
        squareIndex = 63 - squareIndex;
    }
    
    // Add position bonus if available
    if (positionBonus[pieceType]) {
        value += positionBonus[pieceType][squareIndex] / 100;
    }
    
    // Return positive value for white, negative for black
    return pieceColor === 'w' ? value : -value;
}

// Get the best move for the computer
function getBestMove(depth) {
    // Get all possible moves
    const possibleMoves = game.moves();
    
    // Initialize best move and value
    let bestMove = null;
    let bestValue = -9999;
    
    // Evaluate each move
    for (let i = 0; i < possibleMoves.length; i++) {
        const move = possibleMoves[i];
        
        // Make the move
        game.move(move);
        
        // Get the value of the move
        const value = minimax(depth - 1, false, -10000, 10000);
        
        // Undo the move
        game.undo();
        
        // Update best move if better
        if (value > bestValue) {
            bestValue = value;
            bestMove = move;
        }
    }
    
    // Return the best move
    return bestMove;
}

// Minimax algorithm with alpha-beta pruning
function minimax(depth, isMaximizingPlayer, alpha, beta) {
    // Base case: evaluate board at leaf nodes
    if (depth === 0) {
        return evaluateBoard();
    }
    
    // Get all possible moves
    const possibleMoves = game.moves();
    
    // Check for terminal states
    if (possibleMoves.length === 0) {
        // Checkmate or stalemate
        if (game.in_checkmate()) {
            return isMaximizingPlayer ? -9999 : 9999; // Lose for maximizing player, win for minimizing
        }
        return 0; // Draw
    }
    
    if (isMaximizingPlayer) {
        // Computer's turn (black), maximize score
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
                break;
            }
        }
        
        return bestValue;
    } else {
        // Human's turn (white), minimize score
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
                break;
            }
        }
        
        return bestValue;
    }
}

// New game button
$('#new-game').on('click', function() {
    // Reset the game
    game = new Chess();
    
    // Reset the board
    board.position('start');
    
    // Update status
    updateStatus();
    
    // Reset computer thinking
    $thinking.text('...');
    
    // Reset last move
    $lastMove.text('None');
    
    // Reset captured pieces
    $captured.text('None');
});

// Flip board button
$('#flip-board').on('click', function() {
    board.flip();
});

// Initialize the board when the page loads
$(document).ready(initializeBoard);
