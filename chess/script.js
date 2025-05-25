// Initialize the chess game
let board = null; // chessboard.js board
let game = new Chess(); // chess.js game
let whiteSquareGrey = '#a9a9a9'; // Color for highlighting possible moves
let blackSquareGrey = '#696969'; // Color for highlighting possible moves on dark squares
let $status = $('#status'); // Game status element
let $thinking = $('#thinking'); // Computer thinking element
let $lastMove = $('#last-move'); // Last move element
let $captured = $('#captured'); // Captured pieces element

// Piece values for evaluation (simplified)
const pieceValues = {
    'p': 1,   // pawn
    'n': 3,   // knight
    'b': 3,   // bishop
    'r': 5,   // rook
    'q': 9,   // queen
    'k': 100  // king (high value to prioritize king safety)
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
        onSnapEnd: onSnapEnd,
        pieceTheme: 'img/chesspieces/wikipedia/{piece}.png'
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
        try {
            // Get a simple but smart move using minimax with a depth of 2
            const bestMove = getBestMove(2);
            
            // Make the move
            game.move(bestMove);
            
            // Update the board
            board.position(game.fen());
            
            // Update the status
            updateStatus();
            
            // Update computer thinking display
            $thinking.text('Move calculated');
        } catch (e) {
            console.error("Error in computer move:", e);
            
            // Fallback to a random legal move
            const legalMoves = game.moves();
            const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
            game.move(randomMove);
            board.position(game.fen());
            updateStatus();
            $thinking.text('Move calculated');
        }
    }, 100); // Short delay to update UI
}

// Evaluate the current board position
function evaluateBoard() {
    // Simple evaluation focused on just a few key factors
    let totalEvaluation = 0;
    
    // Material evaluation (most important)
    totalEvaluation += evaluateMaterial();
    
    // Center control
    totalEvaluation += evaluateCenterControl() * 0.3;
    
    // King safety
    totalEvaluation += evaluateBasicKingSafety() * 0.5;
    
    // Small random factor to avoid repetitive play
    totalEvaluation += (Math.random() * 0.05) - 0.025;
    
    return totalEvaluation;
}

// Evaluate material (pieces) on the board
function evaluateMaterial() {
    let totalMaterial = 0;
    
    // Loop through the board
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            // Get the piece at this position
            const piece = game.get(getSquare(i, j));
            
            if (piece !== null) {
                // Get the piece value (positive for white, negative for black)
                totalMaterial += getAbsolutePieceValue(piece);
            }
        }
    }
    
    return totalMaterial;
}

// Simplified king safety evaluation
function evaluateBasicKingSafety() {
    let evaluation = 0;
    
    // Find king positions
    let whiteKingSquare = null;
    let blackKingSquare = null;
    
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const square = getSquare(i, j);
            const piece = game.get(square);
            
            if (piece && piece.type === 'k') {
                if (piece.color === 'w') {
                    whiteKingSquare = square;
                } else {
                    blackKingSquare = square;
                }
            }
        }
    }
    
    // Simple evaluation based on king position only
    if (whiteKingSquare) {
        // Bonus for castled king
        if (whiteKingSquare === 'g1' || whiteKingSquare === 'c1') {
            evaluation += 0.5;
        }
    }
    
    if (blackKingSquare) {
        // Bonus for castled king
        if (blackKingSquare === 'g8' || blackKingSquare === 'c8') {
            evaluation -= 0.5;
        }
    }
    
    return evaluation;
}

// Evaluate center control
function evaluateCenterControl() {
    const centerSquares = ['d4', 'e4', 'd5', 'e5'];
    let evaluation = 0;
    
    for (const square of centerSquares) {
        // Check who controls this square
        const piece = game.get(square);
        
        // Bonus for having a piece in the center
        if (piece) {
            if (piece.color === 'w') {
                evaluation += 0.2;
            } else {
                evaluation -= 0.2;
            }
        }
    }
    
    return evaluation;
}

// Get the square notation from coordinates
function getSquare(i, j) {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
    
    return files[j] + ranks[i];
}

// Get the absolute value of a piece with position bonus
function getAbsolutePieceValue(piece) {
    const pieceType = piece.type.toLowerCase();
    const pieceColor = piece.color;
    
    // Get base piece value
    let value = pieceValues[pieceType];
    
    // Return positive value for white, negative for black
    return pieceColor === 'w' ? value : -value;
}

// Get the best move for the computer
function getBestMove(depth) {
    // Get all possible moves
    const possibleMoves = game.moves();
    
    // If there's only one move, return it immediately
    if (possibleMoves.length === 1) {
        return possibleMoves[0];
    }
    
    // Handle special case: no moves
    if (possibleMoves.length === 0) {
        return null;
    }
    
    // Initialize best move and value
    let bestMove = possibleMoves[0];
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
    // Base case: if we've reached the maximum depth, evaluate the board
    if (depth === 0) {
        return evaluateBoard();
    }
    
    // Get all possible moves
    const possibleMoves = game.moves();
    
    // Check for terminal states (checkmate or stalemate)
    if (possibleMoves.length === 0) {
        if (game.in_checkmate()) {
            return isMaximizingPlayer ? -9999 : 9999;
        }
        return 0; // Draw (stalemate)
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

// Utility function to shuffle an array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Initialize the board when the page loads
$(document).ready(() => {
    initializeBoard();
    
    // Set up button handlers
    $('#new-game').on('click', startNewGame);
    $('#flip-board').on('click', function() {
        board.flip();
    });
});

// Start a new game
function startNewGame() {
    // Reset the game
    game = new Chess();
    
    // Reset the board
    if (board) {
        board.position('start');
    } else {
        initializeBoard();
    }
    
    // Update status
    updateStatus();
    
    // Reset displays
    $thinking.text('...');
    $lastMove.text('None');
    $captured.text('White captured: None | Black captured: None');
}
