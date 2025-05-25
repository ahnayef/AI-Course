// This is a fixed version of the evaluation functions in script.js
// Replace these functions in your script.js file

// Evaluate the current board position
function evaluateBoard() {
    try {
        let totalEvaluation = 0;
        
        // Material evaluation - most important factor
        totalEvaluation += evaluateMaterial();
        
        // Mobility evaluation
        totalEvaluation += evaluateMobility() * 0.1;
        
        // Pawn structure
        totalEvaluation += evaluatePawnStructure() * 0.3;
        
        // King safety
        totalEvaluation += evaluateBasicKingSafety() * 0.5;
        
        // Center control
        totalEvaluation += evaluateCenterControl() * 0.3;
        
        // Piece development
        totalEvaluation += evaluateDevelopment() * 0.2;
        
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
