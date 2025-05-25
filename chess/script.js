// Initialize the chess game
let board = null; // chessboard.js board
let game = new Chess(); // chess.js game
let whiteSquareGrey = '#a9a9a9'; // Color for highlighting possible moves
let blackSquareGrey = '#696969'; // Color for highlighting possible moves on dark squares
let $status = $('#status'); // Game status element
let $thinking = $('#thinking'); // Computer thinking element
let $lastMove = $('#last-move'); // Last move element
let $captured = $('#captured'); // Captured pieces element

// Define possible image sources for pieces
const pieceImageSources = [
    'img/chesspieces/wikipedia/{piece}.png', // Try local images first
    'https://unpkg.com/@chrisoakman/chessboardjs@1.0.0/img/chesspieces/wikipedia/{piece}.png',
    'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png',
    'https://cdnjs.cloudflare.com/ajax/libs/chessboard-js/1.0.0/img/chesspieces/wikipedia/{piece}.png'
];

// Piece values for evaluation
const pieceValues = {
    'p': 1.0,  // pawn
    'n': 3.2,  // knight - slightly increased value
    'b': 3.3,  // bishop - slightly increased value
    'r': 5.1,  // rook
    'q': 9.5,  // queen - slightly increased value
    'k': 100   // king (high value to prioritize king safety)
};

// Position bonus values (improved)
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
        -40,-20,  0,  5,  5,  0,-20,-40,
        -30,  5, 15, 20, 20, 15,  5,-30,
        -30,  0, 15, 20, 20, 15,  0,-30,
        -30,  5, 10, 20, 20, 10,  5,-30,
        -30,  0, 10, 15, 15, 10,  0,-30,
        -40,-20,  0,  0,  0,  0,-20,-40,
        -50,-40,-30,-30,-30,-30,-40,-50
    ],
    'b': [ // Bishops are better in the center and on long diagonals
        -20,-10,-10,-10,-10,-10,-10,-20,
        -10,  5,  0,  0,  0,  0,  5,-10,
        -10, 10, 10, 10, 10, 10, 10,-10,
        -10,  0, 10, 10, 10, 10,  0,-10,
        -10,  5,  5, 10, 10,  5,  5,-10,
        -10,  0,  5, 10, 10,  5,  0,-10,
        -10,  0,  0,  0,  0,  0,  0,-10,
        -20,-10,-10,-10,-10,-10,-10,-20
    ],
    'r': [ // Rooks are better on open files and 7th rank
        0,  0,  0,  5,  5,  0,  0,  0,
        -5,  0,  0,  0,  0,  0,  0, -5,
        -5,  0,  0,  0,  0,  0,  0, -5,
        -5,  0,  0,  0,  0,  0,  0, -5,
        -5,  0,  0,  0,  0,  0,  0, -5,
        -5,  0,  0,  0,  0,  0,  0, -5,
        5, 10, 10, 10, 10, 10, 10,  5,
        0,  0,  0,  0,  0,  0,  0,  0
    ],
    'q': [ // Queen combines rook and bishop mobility
        -20,-10,-10, -5, -5,-10,-10,-20,
        -10,  0,  5,  0,  0,  0,  0,-10,
        -10,  5,  5,  5,  5,  5,  0,-10,
        0,  0,  5,  5,  5,  5,  0, -5,
        -5,  0,  5,  5,  5,  5,  0, -5,
        -10,  0,  5,  5,  5,  5,  0,-10,
        -10,  0,  0,  0,  0,  0,  0,-10,
        -20,-10,-10, -5, -5,-10,-10,-20
    ],
    'k': [ // King safety is important in the early/midgame
        20, 30, 10,  0,  0, 10, 30, 20,
        20, 20,  0,  0,  0,  0, 20, 20,
        -10,-20,-20,-20,-20,-20,-20,-10,
        -20,-30,-30,-40,-40,-30,-30,-20,
        -30,-40,-40,-50,-50,-40,-40,-30,
        -30,-40,-40,-50,-50,-40,-40,-30,
        -30,-40,-40,-50,-50,-40,-40,-30,
        -30,-40,-40,-50,-50,-40,-40,-30
    ],
    // King endgame position - will switch based on piece count
    'k_endgame': [
        -50,-30,-30,-30,-30,-30,-30,-50,
        -30,-20,-10,  0,  0,-10,-20,-30,
        -30,-10, 20, 30, 30, 20,-10,-30,
        -30,-10, 30, 40, 40, 30,-10,-30,
        -30,-10, 30, 40, 40, 30,-10,-30,
        -30,-10, 20, 30, 30, 20,-10,-30,
        -30,-30,  0,  0,  0,  0,-30,-30,
        -50,-30,-30,-30,-30,-30,-30,-50
    ]
};

// Preload chess piece images
function preloadChessPieceImages() {
    const pieces = ['wP', 'wR', 'wN', 'wB', 'wQ', 'wK', 'bP', 'bR', 'bN', 'bB', 'bQ', 'bK'];
    const imagePath = pieceImageSources[window.currentPieceThemeIndex];
    
    // Track successful and failed loads
    let failedLoads = 0;
    let successfulLoads = 0;
    const totalImages = pieces.length;
    
    return new Promise((resolve) => {
        pieces.forEach(piece => {
            const img = new Image();
            
            img.onload = () => {
                successfulLoads++;
                if (successfulLoads + failedLoads === totalImages) {
                    resolve(failedLoads === 0);
                }
            };
            
            img.onerror = () => {
                console.error(`Failed to load image for ${piece}`);
                failedLoads++;
                if (successfulLoads + failedLoads === totalImages) {
                    resolve(false);
                }
            };
            
            img.src = imagePath.replace('{piece}', piece);
        });
        
        // Set a timeout in case images take too long to load
        setTimeout(() => {
            if (successfulLoads + failedLoads < totalImages) {
                resolve(false);
            }
        }, 2000);
    });
}

// Initialize the board
async function initializeBoard() {
    // Check if we have already tried all image sources
    if (typeof window.currentPieceThemeIndex === 'undefined') {
        window.currentPieceThemeIndex = 0;
    }
    
    // Preload chess piece images
    const imagesLoaded = await preloadChessPieceImages();
    
    if (!imagesLoaded) {
        // If images failed to load, try the next source
        window.currentPieceThemeIndex = (window.currentPieceThemeIndex + 1) % pieceImageSources.length;
        
        // If we've tried all sources, use Unicode fallback
        if (window.currentPieceThemeIndex === 0) {
            console.log('All image sources failed. Using Unicode fallback for chess pieces.');
            $('#board').addClass('use-unicode-fallback');
        } else {
            console.log('Trying next image source:', pieceImageSources[window.currentPieceThemeIndex]);
            if (board) {
                board.destroy();
            }
            return initializeBoard();
        }
    }
    
    // Configuration for the chessboard
    const config = {
        draggable: true,
        position: 'start',
        onDragStart: onDragStart,
        onDrop: onDrop,
        onMouseoutSquare: onMouseoutSquare,
        onMouseoverSquare: onMouseoverSquare,
        onSnapEnd: onSnapEnd,
        pieceTheme: pieceImageSources[window.currentPieceThemeIndex]
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
            // Start with a simple random legal move as fallback
            const legalMoves = game.moves();
            let move = legalMoves[Math.floor(Math.random() * legalMoves.length)];
            
            // Try to get a better move with minimax (only if we have time)
            try {
                // Increased depth for stronger play - try depth 3 as default but adjust based on position complexity
                const depth = (legalMoves.length > 30) ? 3 : 4; // Adaptive depth based on position complexity
                const bestMove = getBestMove(depth);
                if (bestMove) move = bestMove;
            } catch (e) {
                console.error("Error in calculating best move:", e);
                // Fall back to random move (already set)
            }
            
            // Make the move
            game.move(move);
            
            // Update the board
            board.position(game.fen());
            
            // Update the status
            updateStatus();
            
            // Update computer thinking display
            $thinking.text('Move calculated');
        } catch (e) {
            console.error("Error in computer move:", e);
            $thinking.text('Error making move');
        }
    }, 100);
}

// Evaluate the current board position
function evaluateBoard() {
    try {
        let totalEvaluation = 0;
        
        // Material evaluation - most important factor
        totalEvaluation += evaluateMaterial();
        
        // Mobility evaluation - increased importance
        totalEvaluation += evaluateMobility() * 0.2;
        
        // Pawn structure
        totalEvaluation += evaluatePawnStructure() * 0.3;
        
        // King safety - critical factor
        totalEvaluation += evaluateBasicKingSafety() * 0.7;
        
        // Center control - increased importance
        totalEvaluation += evaluateCenterControl() * 0.5;
        
        // Piece development
        totalEvaluation += evaluateDevelopment() * 0.3;
        
        // Add a random small factor to avoid repetitive play
        totalEvaluation += (Math.random() * 0.1) - 0.05;
        
        return totalEvaluation;
    } catch (e) {
        console.error("Error in evaluateBoard:", e);
        
        // Fallback to simple material counting
        let material = 0;
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const piece = game.get(getSquare(i, j));
                if (piece) {
                    const value = pieceValues[piece.type.toLowerCase()];
                    if (piece.color === 'w') {
                        material += value;
                    } else {
                        material -= value;
                    }
                }
            }
        }
        return material;
    }
}

// Evaluate material (pieces) on the board
function evaluateMaterial() {
    try {
        let totalMaterial = 0;
        
        // Loop through the board
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                // Get the piece at this position
                const piece = game.get(getSquare(i, j));
                
                if (piece !== null) {
                    // Add piece value with position bonus
                    totalMaterial += getAbsolutePieceValue(piece, i, j);
                }
            }
        }
        
        return totalMaterial;
    } catch (e) {
        console.error("Error in evaluateMaterial:", e);
        return 0; // Neutral evaluation on error
    }
}

// Evaluate mobility (number of legal moves)
function evaluateMobility() {
    try {
        const currentTurn = game.turn();
        
        // Store current turn
        let mobility = 0;
        
        // Simple approximation - just count legal moves for current position
        if (currentTurn === 'w') {
            mobility = game.moves().length;
        } else {
            mobility = -game.moves().length;
        }
        
        return mobility / 10; // Scale down mobility factor
    } catch (e) {
        console.error("Error in evaluateMobility:", e);
        return 0;
    }
}

// Evaluate pawn structure (doubled pawns, isolated pawns)
function evaluatePawnStructure() {
    try {
        let evaluation = 0;
        
        // Penalty for doubled pawns - simplified approach
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        
        for (const file of files) {
            // Count pawns in this file
            let whitePawns = 0;
            let blackPawns = 0;
            
            for (let rank = 1; rank <= 8; rank++) {
                const square = file + rank;
                const piece = game.get(square);
                
                if (piece && piece.type === 'p') {
                    if (piece.color === 'w') {
                        whitePawns++;
                    } else {
                        blackPawns++;
                    }
                }
            }
            
            // Penalty for doubled pawns
            if (whitePawns > 1) {
                evaluation -= 0.3 * (whitePawns - 1);
            }
            if (blackPawns > 1) {
                evaluation += 0.3 * (blackPawns - 1);
            }
        }
        
        return evaluation;
    } catch (e) {
        console.error("Error in evaluatePawnStructure:", e);
        return 0;
    }
}

// Simplified king safety evaluation
function evaluateBasicKingSafety() {
    try {
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
            const file = whiteKingSquare.charCodeAt(0) - 'a'.charCodeAt(0);
            const rank = parseInt(whiteKingSquare.charAt(1));
            
            // Bonus for castling positions
            if (whiteKingSquare === 'g1' || whiteKingSquare === 'c1') {
                evaluation += 0.5;
            }
            
            // Penalty for being in the center early in the game
            if (file > 2 && file < 6 && rank < 3) {
                evaluation -= 0.3;
            }
        }
        
        if (blackKingSquare) {
            const file = blackKingSquare.charCodeAt(0) - 'a'.charCodeAt(0);
            const rank = parseInt(blackKingSquare.charAt(1));
            
            // Bonus for castling positions
            if (blackKingSquare === 'g8' || blackKingSquare === 'c8') {
                evaluation -= 0.5;
            }
            
            // Penalty for being in the center early in the game
            if (file > 2 && file < 6 && rank > 6) {
                evaluation += 0.3;
            }
        }
        
        return evaluation;
    } catch (e) {
        console.error("Error in evaluateBasicKingSafety:", e);
        return 0;
    }
}

// Evaluate center control
function evaluateCenterControl() {
    try {
        const centerSquares = ['d4', 'e4', 'd5', 'e5'];
        let evaluation = 0;
        
        for (const square of centerSquares) {
            // Check who attacks this square
            const whiteAttacks = isSquareAttackedBy(square, 'w');
            const blackAttacks = isSquareAttackedBy(square, 'b');
            
            // Bonus for controlling center
            evaluation += whiteAttacks * 0.1;
            evaluation -= blackAttacks * 0.1;
            
            // Extra bonus for piece in center
            const piece = game.get(square);
            if (piece) {
                if (piece.color === 'w') {
                    evaluation += 0.2;
                } else {
                    evaluation -= 0.2;
                }
                
                // Even more bonus for knight/bishop in center
                if (piece.type === 'n' || piece.type === 'b') {
                    if (piece.color === 'w') {
                        evaluation += 0.1;
                    } else {
                        evaluation -= 0.1;
                    }
                }
            }
        }
        
        return evaluation;
    } catch (e) {
        console.error("Error in evaluateCenterControl:", e);
        return 0;
    }
}

// Check if a square is attacked by a given color
function isSquareAttackedBy(square, color) {
    // More efficient approach than trying actual moves
    try {
        // Use the built-in chess.js isAttacked method if available
        if (typeof game._attacked === 'function') {
            const opponent = color === 'w' ? 'b' : 'w';
            return !game._attacked(opponent, Chess.SQUARES[square]);
        }
        
        // Fallback to a simple approximation if method not available
        const file = square.charCodeAt(0) - 'a'.charCodeAt(0);
        const rank = parseInt(square.charAt(1));
        let attackCount = 0;
        
        // Just check pieces in adjacent squares and potential knight moves for simplicity
        // This is much faster than the previous approach and gives a reasonable approximation
        
        // Check adjacent squares for kings and pawns
        const adjacentOffsets = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];
        
        for (const [rowOffset, colOffset] of adjacentOffsets) {
            const newRow = rank + rowOffset;
            const newCol = file + colOffset;
            
            if (newRow >= 1 && newRow <= 8 && newCol >= 0 && newCol < 8) {
                const checkSquare = String.fromCharCode('a'.charCodeAt(0) + newCol) + newRow;
                const piece = game.get(checkSquare);
                
                if (piece && piece.color === color) {
                    // Kings can attack any adjacent square
                    if (piece.type === 'k') {
                        attackCount++;
                    }
                    
                    // Pawns attack diagonally forward
                    if (piece.type === 'p') {
                        const pawnDir = color === 'w' ? 1 : -1;
                        if (rowOffset === pawnDir && Math.abs(colOffset) === 1) {
                            attackCount++;
                        }
                    }
                }
            }
        }
        
        // Check knight moves
        const knightOffsets = [
            [-2, -1], [-2, 1],
            [-1, -2], [-1, 2],
            [1, -2],  [1, 2],
            [2, -1],  [2, 1]
        ];
        
        for (const [rowOffset, colOffset] of knightOffsets) {
            const newRow = rank + rowOffset;
            const newCol = file + colOffset;
            
            if (newRow >= 1 && newRow <= 8 && newCol >= 0 && newCol < 8) {
                const checkSquare = String.fromCharCode('a'.charCodeAt(0) + newCol) + newRow;
                const piece = game.get(checkSquare);
                
                if (piece && piece.color === color && piece.type === 'n') {
                    attackCount++;
                }
            }
        }
        
        return attackCount;
    } catch (e) {
        console.error("Error in isSquareAttackedBy:", e);
        return 0; // Default to no attacks in case of error
    }
}

// Evaluate piece development
function evaluateDevelopment() {
    try {
        let evaluation = 0;
        const startPositions = {
            'w': ['a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1', 'a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2'],
            'b': ['a8', 'b8', 'c8', 'd8', 'e8', 'f8', 'g8', 'h8', 'a7', 'b7', 'c7', 'd7', 'e7', 'f7', 'g7', 'h7']
        };
        
        // Count developed pieces (pieces not in starting position)
        let whiteDeveloped = 0;
        let blackDeveloped = 0;
        
        // Check starting positions
        for (const square of startPositions['w']) {
            const piece = game.get(square);
            if (!piece || piece.color !== 'w') {
                whiteDeveloped++;
            }
        }
        
        for (const square of startPositions['b']) {
            const piece = game.get(square);
            if (!piece || piece.color !== 'b') {
                blackDeveloped++;
            }
        }
        
        // Adjust for pawns - we don't want to count pawn advances as "development"
        whiteDeveloped = Math.min(whiteDeveloped, 8); // Maximum of 8 developed pieces (excluding pawns)
        blackDeveloped = Math.min(blackDeveloped, 8); // Maximum of 8 developed pieces (excluding pawns)
        
        evaluation = 0.1 * (whiteDeveloped - blackDeveloped);
        
        return evaluation;
    } catch (e) {
        console.error("Error in evaluateDevelopment:", e);
        return 0;
    }
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
    
    // For kings, check if we're in endgame
    let positionTable = positionBonus[pieceType];
    if (pieceType === 'k') {
        // Count material to determine if we're in endgame
        const material = countMaterial();
        // If total material is less than 20 points, consider it an endgame
        if (material < 20) {
            positionTable = positionBonus['k_endgame'];
        }
    }
    
    // Add position bonus if available
    if (positionTable) {
        value += positionTable[squareIndex] / 100;
    }
    
    // Return positive value for white, negative for black
    return pieceColor === 'w' ? value : -value;
}

// Count total material on board
function countMaterial() {
    let material = 0;
    
    // Loop through the board
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            // Get the piece at this position
            const piece = game.get(getSquare(i, j));
            
            if (piece !== null && piece.type !== 'k') {
                // Add piece value
                material += pieceValues[piece.type.toLowerCase()];
            }
        }
    }
    
    return material;
}

// Get the best move for the computer
function getBestMove(depth) {
    try {
        // Set a maximum time for calculation to prevent hanging
        const startTime = Date.now();
        const maxTime = 4000; // 4 seconds max - increased from 3 for better moves
        
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
        let bestMove = possibleMoves[0]; // Default to first move
        let bestValue = -9999;
        let bestMoves = [bestMove]; // Array to store equally good moves
        
        // Sort captures and checks first for better pruning
        possibleMoves.sort((a, b) => {
            const aIsCapture = a.includes('x');
            const bIsCapture = b.includes('x');
            const aIsCheck = a.includes('+');
            const bIsCheck = b.includes('+');
            
            // Prioritize checks, then captures
            if (aIsCheck && !bIsCheck) return -1;
            if (!aIsCheck && bIsCheck) return 1;
            if (aIsCapture && !bIsCapture) return -1;
            if (!aIsCapture && bIsCapture) return 1;
            return 0;
        });
        
        // Evaluate each move
        for (let i = 0; i < possibleMoves.length; i++) {
            const move = possibleMoves[i];
            
            // Check if we've exceeded time limit
            if (Date.now() - startTime > maxTime) {
                console.log("Time limit exceeded, returning best move found so far");
                break;
            }
            
            // Make the move
            game.move(move);
            
            // Get the value of the move
            let value;
            try {
                value = minimax(depth - 1, false, -10000, 10000);
                
                // Give extra weight to captures and checks for more aggressive play
                if (move.includes('x')) {
                    value += 0.2; // Small bonus for captures
                }
                if (move.includes('+')) {
                    value += 0.3; // Bigger bonus for checks
                }
                
                // Give bonus for center control
                if (move.includes('d4') || move.includes('d5') || 
                    move.includes('e4') || move.includes('e5')) {
                    value += 0.1; // Bonus for moves to center squares
                }
            } catch (e) {
                console.error("Error in minimax:", e);
                value = -9999; // Fallback value
            }
            
            // Undo the move
            game.undo();
            
            // Update best move if better
            if (value > bestValue) {
                bestValue = value;
                bestMove = move;
                bestMoves = [move]; // Reset the array with just this move
            } 
            // If this move is equally good, add it to the array
            else if (value === bestValue) {
                bestMoves.push(move);
            }
        }
        
        // Choose a random move from the best moves to add variety
        if (bestMoves.length > 1) {
            return bestMoves[Math.floor(Math.random() * bestMoves.length)];
        }
        
        // Return the best move
        return bestMove;
    } catch (e) {
        console.error("Error in getBestMove:", e);
        // Fallback to a random legal move in case of error
        const legalMoves = game.moves();
        if (legalMoves.length > 0) {
            return legalMoves[Math.floor(Math.random() * legalMoves.length)];
        }
        return null;
    }
}

// Minimax algorithm with alpha-beta pruning
function minimax(depth, isMaximizingPlayer, alpha, beta) {
    // Add a depth check to avoid excessive recursion
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
    
    // Randomize move order for better alpha-beta performance and variety
    shuffleArray(possibleMoves);
    
    // Handle capturing moves first for better pruning
    possibleMoves.sort((a, b) => {
        const aIsCapture = a.includes('x');
        const bIsCapture = b.includes('x');
        return bIsCapture - aIsCapture; // Captures first
    });
    
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

// New game button
$('#new-game').on('click', function() {
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
$(document).ready(() => {
    // Remove the checkPieceImagesLoaded function since we handle it differently now
    initializeBoard();
    
    // Add a listener for the board to handle any image loading issues
    $(window).on('error', function(e) {
        if (e.target.tagName === 'IMG' && e.target.src.includes('chesspieces')) {
            console.log('Image load error detected, switching to fallback');
            $('#board').addClass('use-unicode-fallback');
        }
    }, true);
});
