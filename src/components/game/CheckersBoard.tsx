"use client";

import { useState, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Crown } from 'lucide-react';
import { updateDocumentNonBlocking, useUser } from '@/firebase';
import type { DocumentReference } from 'firebase/firestore';

type Piece = { player: 'p1' | 'p2'; isKing: boolean } | null;
type Board = { [row: number]: { [col: number]: Piece } };
type Position = { row: number; col: number };
type Move = {
    to: Position;
    capturedPiece: Position | null;
};


const generateInitialBoard = (): Board => {
    const board: Board = {};
    const p1Rows = [0, 1, 2];
    const p2Rows = [5, 6, 7];

    for (let row = 0; row < 8; row++) {
        board[row] = {};
        for (let col = 0; col < 8; col++) {
            if ((row + col) % 2 !== 0) {
                if (p1Rows.includes(row)) {
                    board[row][col] = { player: 'p1', isKing: false };
                } else if (p2Rows.includes(row)) {
                    board[row][col] = { player: 'p2', isKing: false };
                } else {
                    board[row][col] = null;
                }
            } else {
                board[row][col] = null;
            }
        }
    }
    return board;
};

// Helper to convert the board map to an array for rendering
const boardMapToArray = (board: Board): Piece[][] => {
    const boardArray: Piece[][] = Array(8).fill(null).map(() => Array(8).fill(null));
    for (const row in board) {
        for (const col in board[row]) {
            boardArray[parseInt(row)][parseInt(col)] = board[row][col];
        }
    }
    return boardArray;
};

export function CheckersBoard({ gameSession, gameSessionRef }: { gameSession: any, gameSessionRef: DocumentReference | null }) {
  const [board, setBoard] = useState<Board>(gameSession?.board || generateInitialBoard());
  const [selectedPiece, setSelectedPiece] = useState<Position | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [forcedCaptureMoves, setForcedCaptureMoves] = useState<Move[]>([]);
  const { user } = useUser();

  const currentPlayer = gameSession?.turn === gameSession?.player1Id ? 'p1' : 'p2';
  const localPlayer = gameSession?.player1Id === user?.uid ? 'p1' : 'p2';


  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (gameSession?.board) {
      setBoard(gameSession.board);
    }
  }, [gameSession]);

  const handleSquareClick = (row: number, col: number) => {
    if (!gameSessionRef) return;
    if (currentPlayer !== localPlayer) return;

    const clickedPiece = board[row]?.[col];
    const targetMove = possibleMoves.find(move => move.to.row === row && move.to.col === col);

    if (selectedPiece && targetMove) {
        const newBoard = JSON.parse(JSON.stringify(board)); // Deep copy
        const pieceToMove = newBoard[selectedPiece.row][selectedPiece.col];

        // Move piece
        newBoard[row][col] = pieceToMove;
        newBoard[selectedPiece.row][selectedPiece.col] = null;

        // Handle capture
        if (targetMove.capturedPiece) {
            newBoard[targetMove.capturedPiece.row][targetMove.capturedPiece.col] = null;
        }

        // King me?
        if (pieceToMove && ((pieceToMove.player === 'p1' && row === 7) || (pieceToMove.player === 'p2' && row === 0))) {
            pieceToMove.isKing = true;
            newBoard[row][col] = pieceToMove; // Update the piece on the new board
        }
        
        const canCaptureAgain = targetMove.capturedPiece && calculatePossibleMoves({row, col}, newBoard).some(m => m.capturedPiece);
        const nextTurn = canCaptureAgain ? gameSession.turn : (gameSession.turn === gameSession.player1Id ? gameSession.player2Id : gameSession.player1Id);

        updateDocumentNonBlocking(gameSessionRef, { board: newBoard, turn: nextTurn });
        setSelectedPiece(null);

    } else if (clickedPiece && clickedPiece.player === localPlayer) {
      setSelectedPiece({ row, col });
    } else {
      setSelectedPiece(null);
    }
  };
  
    const calculatePossibleMoves = (piecePosition: Position, currentBoard: Board): Move[] => {
        if (!piecePosition) return [];
        const moves: Move[] = [];
        const { row, col } = piecePosition;
        const piece = currentBoard[row]?.[col];
        if (!piece) return [];
    
        const moveDirections = (player: 'p1' | 'p2', isKing: boolean): number[] => {
            if (isKing) return [-1, 1]; // Up and Down
            return player === 'p1' ? [1] : [-1]; // p1 Down, p2 Up
        };
    
        const directions = moveDirections(piece.player, piece.isKing);
    
        for (const dir of directions) {
            // Normal moves
            [-1, 1].forEach(side => {
                const newRow = row + dir;
                const newCol = col + side;
                if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8 && !currentBoard[newRow]?.[newCol]) {
                    moves.push({ to: { row: newRow, col: newCol }, capturedPiece: null });
                }
            });
    
            // Capture moves
            [-1, 1].forEach(side => {
                const newRow = row + dir;
                const newCol = col + side;
                const jumpRow = row + dir * 2;
                const jumpCol = col + side * 2;
    
                if (jumpRow >= 0 && jumpRow < 8 && jumpCol >= 0 && jumpCol < 8 &&
                    currentBoard[newRow]?.[newCol]?.player &&
                    currentBoard[newRow][newCol]?.player !== piece.player &&
                    !currentBoard[jumpRow]?.[jumpCol]) {
                    moves.push({ to: { row: jumpRow, col: jumpCol }, capturedPiece: { row: newRow, col: newCol } });
                }
            });
        }
        return moves;
    };
    
    const possibleMoves = useMemo(() => {
        if (!selectedPiece) return [];
        
        const allCaptureMoves: {piece: Position, moves: Move[]}[] = [];
         for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = board[r]?.[c];
                if (piece && piece.player === localPlayer) {
                    const moves = calculatePossibleMoves({ row: r, col: c }, board);
                    const captureMoves = moves.filter(m => m.capturedPiece);
                    if(captureMoves.length > 0){
                        allCaptureMoves.push({piece: {row: r, col: c}, moves: captureMoves});
                    }
                }
            }
        }

        const movesForSelectedPiece = calculatePossibleMoves(selectedPiece, board);
        if(allCaptureMoves.length > 0){
            const capturesForSelected = allCaptureMoves.find(p => p.piece.row === selectedPiece.row && p.piece.col === selectedPiece.col);
            return capturesForSelected ? capturesForSelected.moves : [];
        }

        return movesForSelectedPiece.filter(m => !m.capturedPiece);

    }, [selectedPiece, board, localPlayer]);


  if (!isClient) {
    return (
      <div className="w-full aspect-square max-w-2xl shadow-2xl rounded-lg overflow-hidden border-4 border-card bg-card animate-pulse" />
    );
  }

  const isMyTurn = currentPlayer === localPlayer;
  const renderBoard = boardMapToArray(board);

  return (
    <div className={cn("w-full aspect-square max-w-2xl shadow-2xl rounded-lg overflow-hidden border-4 border-neutral-800 transition-all", !isMyTurn && "opacity-70")}>
      <div className="grid grid-cols-8 grid-rows-8 w-full h-full bg-card">
        {renderBoard.map((row, rowIndex) =>
          row.map((piece, colIndex) => {
            const isDark = (rowIndex + colIndex) % 2 !== 0;
            const isSelected = selectedPiece?.row === rowIndex && selectedPiece?.col === colIndex;
            const isMovable = possibleMoves.some(move => move.to.row === rowIndex && move.to.col === colIndex);

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                onClick={() => handleSquareClick(rowIndex, colIndex)}
                className={cn(
                  'flex items-center justify-center transition-colors duration-200',
                   isDark ? 'bg-neutral-800' : 'bg-neutral-200',
                  (isMyTurn && (piece || isMovable)) && 'cursor-pointer'
                )}
                role="button"
                aria-label={`Board square ${rowIndex}, ${colIndex}`}
              >
                {isMyTurn && isMovable && !piece && (
                    <div className="w-1/3 h-1/3 rounded-full bg-black/20 transition-opacity hover:bg-black/30" />
                )}
                {piece && (
                  <div
                    className={cn(
                      'w-[80%] h-[80%] rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ease-in-out',
                      piece.player === 'p1' ? 'bg-zinc-800 border-4 border-zinc-950' : 'bg-stone-300 border-4 border-stone-400',
                      isSelected && isMyTurn && 'ring-4 ring-offset-2 ring-blue-500 ring-offset-transparent'
                    )}
                  >
                    {piece.isKing && (
                      <Crown
                        className={cn(
                          'w-1/2 h-1/2',
                          piece.player === 'p1' ? 'text-yellow-400' : 'text-yellow-600'
                        )}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
