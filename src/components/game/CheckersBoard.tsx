"use client";

import { useState, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Crown } from 'lucide-react';
import { updateDocumentNonBlocking, useUser } from '@/firebase';
import type { DocumentReference } from 'firebase/firestore';

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

export function CheckersBoard({ gameSession, gameSessionRef }: { gameSession: any, gameSessionRef: DocumentReference | null }) {
  const [board, setBoard] = useState<Board>(gameSession?.board || initialBoard);
  const [selectedPiece, setSelectedPiece] = useState<Position | null>(null);
  const [isClient, setIsClient] = useState(false);
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
    if (currentPlayer !== localPlayer) return; // Not your turn

    const clickedPiece = board[row][col];

    if (selectedPiece) {
      const isPossibleMove = possibleMoves.some(move => move.row === row && move.col === col);
      if (isPossibleMove) {
        const newBoard = board.map(r => [...r]);
        const pieceToMove = newBoard[selectedPiece.row][selectedPiece.col];
        newBoard[row][col] = pieceToMove;
        newBoard[selectedPiece.row][selectedPiece.col] = null;
        
        // King me?
        if (pieceToMove && ( (pieceToMove.player === 'p1' && row === 7) || (pieceToMove.player === 'p2' && row === 0) ) ){
            pieceToMove.isKing = true;
        }


        const nextTurn = gameSession.turn === gameSession.player1Id ? gameSession.player2Id : gameSession.player1Id;
        updateDocumentNonBlocking(gameSessionRef, { board: newBoard, turn: nextTurn });
        setSelectedPiece(null);
      } else if (clickedPiece && clickedPiece.player === localPlayer) {
        setSelectedPiece({ row, col });
      } else {
        setSelectedPiece(null);
      }
    } else if (clickedPiece && clickedPiece.player === localPlayer) {
      setSelectedPiece({ row, col });
    }
  };
  
  const possibleMoves = useMemo(() => {
    if (!selectedPiece) return [];
    const moves: Position[] = [];
    const { row, col } = selectedPiece;
    const piece = board[row][col];
    if (!piece) return [];

    const moveForward = (player: 'p1' | 'p2') => {
        const forwardRow = player === 'p1' ? row + 1 : row - 1;
        if (forwardRow >= 0 && forwardRow < 8) {
            if (col > 0 && !board[forwardRow][col - 1]) moves.push({ row: forwardRow, col: col - 1 });
            if (col < 7 && !board[forwardRow][col + 1]) moves.push({ row: forwardRow, col: col + 1 });
        }
    }
    
    moveForward(piece.player);
    if(piece.isKing){
        moveForward(piece.player === 'p1' ? 'p2' : 'p1');
    }

    return moves;
  }, [selectedPiece, board]);

  if (!isClient) {
    return (
      <div className="w-full aspect-square max-w-2xl shadow-2xl rounded-lg overflow-hidden border-4 border-card bg-card animate-pulse" />
    );
  }

  const isMyTurn = currentPlayer === localPlayer;

  return (
    <div className={cn("w-full aspect-square max-w-2xl shadow-2xl rounded-lg overflow-hidden border-4 border-neutral-800 transition-all", !isMyTurn && "opacity-70")}>
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
                  isDark ? 'bg-black' : 'bg-white',
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
                      piece.player === 'p1' ? 'bg-yellow-900 border-4 border-yellow-950' : 'bg-white border-4 border-gray-400',
                      isSelected && isMyTurn && 'ring-4 ring-offset-2 ring-blue-500 ring-offset-transparent'
                    )}
                  >
                    {piece.isKing && (
                      <Crown
                        className={cn(
                          'w-1/2 h-1/2',
                          piece.player === 'p1' ? 'text-yellow-300' : 'text-yellow-500'
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
