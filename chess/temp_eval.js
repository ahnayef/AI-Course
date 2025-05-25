// Evaluate the current board position
function evaluateBoard() {
    try {
        let totalEvaluation = 0;
        
        // Material evaluation - most important factor
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                // Get the piece at this position
                const piece = game.get(getSquare(i, j));
                
                if (piece !== null) {
                    // Add piece value with position bonus
                    totalEvaluation += getAbsolutePieceValue(piece, i, j);
                }
            }
        }
        
        return totalEvaluation;
    } catch (e) {
        console.error('Error in evaluateBoard:', e);
        
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
