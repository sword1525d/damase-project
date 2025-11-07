"use client";

import { useState, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Crown } from 'lucide-react';

type Piece = { player: 'p1' | 'p2'; isKing: boolean } | null;
type Board = Piece[][];
type Position = { row: number; col: number };

const initialBoard: Board = [
  [null, { player: 'p1', isKing: false }, null, { player: 'p1', isKing: false }, null, { player: 'p1', isKing: false }, null, { player: 'p1', isKing: false }],
  [{ player: 'p1', isKing: false }, null, { player: 'p1', isKing: false }, null, { player: 'p1', isKing: false }, null, { player: 'p1', isKing: false }, null],
  [null, { player: 'p1', isKing: false }, null, { player: 'p1', isKing: false }, null, { player: 'p1', isKing: false }, null, { player: 'p1', isKing: false }],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [{ player: 'p2', isKing: false }, null, { player: 'p2', isKing: false }, null, { player: 'p2', isKing: false }, null, { player: 'p2', isKing: false }, null],
  [null, { player: 'p2', isKing: false }, null, { player: 'p2', isKing: false }, null, { player: 'p2', isKing: false }, null, { player: 'p2', isKing: false }],
  [{ player: 'p2', isKing: false }, null, { player: 'p2', isKing: false }, null, { player: 'p2', isKing: false }, null, { player: 'p2', isKing: false }, null],
];

export function CheckersBoard() {
  const [board, setBoard] = useState<Board>(initialBoard);
  const [selectedPiece, setSelectedPiece] = useState<Position | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSquareClick = (row: number, col: number) => {
    const clickedPiece = board[row][col];

    if (selectedPiece) {
      const isPossibleMove = possibleMoves.some(move => move.row === row && move.col === col);
      if (isPossibleMove) {
        const newBoard = board.map(r => [...r]);
        const pieceToMove = newBoard[selectedPiece.row][selectedPiece.col];
        newBoard[row][col] = pieceToMove;
        newBoard[selectedPiece.row][selectedPiece.col] = null;
        setBoard(newBoard);
        setSelectedPiece(null);
      } else if (clickedPiece && clickedPiece.player === 'p2') {
        setSelectedPiece({ row, col });
      } else {
        setSelectedPiece(null);
      }
    } else if (clickedPiece && clickedPiece.player === 'p2') { // Only allow selecting player 2's pieces
      setSelectedPiece({ row, col });
    }
  };
  
  const possibleMoves = useMemo(() => {
    if (!selectedPiece) return [];
    const moves: Position[] = [];
    const { row, col } = selectedPiece;
    const piece = board[row][col];
    if (piece?.player === 'p2') {
        if (row > 0) {
            if (col > 0 && !board[row - 1][col - 1]) moves.push({ row: row - 1, col: col - 1 });
            if (col < 7 && !board[row - 1][col + 1]) moves.push({ row: row - 1, col: col + 1 });
        }
    }
    return moves;
  }, [selectedPiece, board]);

  if (!isClient) {
    return (
      <div className="w-full aspect-square max-w-2xl shadow-2xl rounded-lg overflow-hidden border-4 border-card bg-card animate-pulse" />
    );
  }

  return (
    <div className="w-full aspect-square max-w-2xl shadow-2xl rounded-lg overflow-hidden border-4 border-card">
      <div className="grid grid-cols-8 grid-rows-8 w-full h-full bg-card">
        {board.map((row, rowIndex) =>
          row.map((piece, colIndex) => {
            const isDark = (rowIndex + colIndex) % 2 !== 0;
            const isSelected = selectedPiece?.row === rowIndex && selectedPiece?.col === colIndex;
            const isMovable = possibleMoves.some(move => move.row === rowIndex && move.col === colIndex);

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                onClick={() => handleSquareClick(rowIndex, colIndex)}
                className={cn(
                  'flex items-center justify-center transition-colors duration-200',
                  isDark ? 'bg-primary/90' : 'bg-primary/20',
                  (piece || isMovable) && 'cursor-pointer'
                )}
                role="button"
                aria-label={`Board square ${rowIndex}, ${colIndex}`}
              >
                {isMovable && !piece && (
                    <div className="w-1/3 h-1/3 rounded-full bg-accent/50 transition-opacity hover:bg-accent/70" />
                )}
                {piece && (
                  <div
                    className={cn(
                      'w-[75%] h-[75%] rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ease-in-out',
                      piece.player === 'p1' ? 'bg-gray-900 border-2 border-gray-700' : 'bg-gray-100 border-2 border-gray-400',
                      isSelected && 'ring-4 ring-offset-2 ring-accent ring-offset-transparent'
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
