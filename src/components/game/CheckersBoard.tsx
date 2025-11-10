

"use client";

import { useState, useMemo, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Crown } from 'lucide-react';
import { updateDocumentNonBlocking, useUser } from '@/firebase';
import type { DocumentReference } from 'firebase/firestore';
import { BotMoveInput, getBotMove } from '@/ai/flows/bot-move-flow';

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
  const [isBotThinking, setIsBotThinking] = useState(false);
  const { user } = useUser();

  const isBotGame = !!gameSession?.botPlayer;
  const botPlayerKey = gameSession?.botPlayer?.playerKey;
  const isBotTurn = isBotGame && gameSession?.turn === gameSession?.botPlayer?.id;
  
  const currentPlayerKey = gameSession?.turn === gameSession?.player1Id ? 'p1' : 'p2';
  const localPlayerKey = gameSession?.player1Id === user?.uid ? 'p1' : 'p2';
  
  const isMyTurn = (gameSession?.status === 'active' || gameSession?.status === 'ready') && currentPlayerKey === localPlayerKey;

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (gameSession?.board) {
      setBoard(gameSession.board);
    }
  }, [gameSession]);

  const checkWinCondition = (currentBoard: Board) => {
    let p1Pieces = 0;
    let p2Pieces = 0;
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = currentBoard[r]?.[c];
            if (piece) {
                if (piece.player === 'p1') p1Pieces++;
                else p2Pieces++;
            }
        }
    }
    if (p1Pieces === 0) return gameSession.player2Id;
    if (p2Pieces === 0) return gameSession.player1Id;
    return null;
  }
  
    const calculatePossibleMoves = useCallback((piecePosition: Position, currentBoard: Board): Move[] => {
        if (!piecePosition) return [];
        const moves: Move[] = [];
        const { row, col } = piecePosition;
        const piece = currentBoard[row]?.[col];
        if (!piece) return [];
    
        const player = piece.player;
        const opponent = player === 'p1' ? 'p2' : 'p1';
    
        const directions = piece.isKing
            ? [{ r: -1, c: -1 }, { r: -1, c: 1 }, { r: 1, c: -1 }, { r: 1, c: 1 }] // King moves
            : player === 'p1'
                ? [{ r: 1, c: -1 }, { r: 1, c: 1 }] // p1 moves down
                : [{ r: -1, c: -1 }, { r: -1, c: 1 }]; // p2 moves up
    
        for (const dir of directions) {
            if (piece.isKing) {
                // King movement and capture logic
                let tempRow = row + dir.r;
                let tempCol = col + dir.c;
    
                // Movement
                while (tempRow >= 0 && tempRow < 8 && tempCol >= 0 && tempCol < 8) {
                    if (currentBoard[tempRow]?.[tempCol] === null) {
                        moves.push({ to: { row: tempRow, col: tempCol }, capturedPiece: null });
                        tempRow += dir.r;
                        tempCol += dir.c;
                    } else {
                        break; // Blocked by a piece
                    }
                }
    
                // Capture
                tempRow = row + dir.r;
                tempCol = col + dir.c;
                let foundOpponent: Position | null = null;
    
                while (tempRow >= 0 && tempRow < 8 && tempCol >= 0 && tempCol < 8) {
                    const currentPiece = currentBoard[tempRow]?.[tempCol];
                    if (currentPiece) {
                        if (currentPiece.player === opponent && !foundOpponent) {
                            foundOpponent = { row: tempRow, col: tempCol };
                        } else {
                            break; // Blocked by another piece or own piece
                        }
                    } else if (foundOpponent) {
                        // We've jumped an opponent, this is a valid capture landing spot
                        moves.push({ to: { row: tempRow, col: tempCol }, capturedPiece: foundOpponent });
                    }
                    tempRow += dir.r;
                    tempCol += dir.c;
                }
    
            } else {
                // Regular piece movement
                const oneStepRow = row + dir.r;
                const oneStepCol = col + dir.c;
                if (oneStepRow >= 0 && oneStepRow < 8 && oneStepCol >= 0 && oneStepCol < 8 && !currentBoard[oneStepRow]?.[oneStepCol]) {
                    moves.push({ to: { row: oneStepRow, col: oneStepCol }, capturedPiece: null });
                }
    
                // Regular piece capture
                const twoStepsRow = row + dir.r * 2;
                const twoStepsCol = col + dir.c * 2;
                const jumpedPiece = currentBoard[oneStepRow]?.[oneStepCol];
    
                if (
                    twoStepsRow >= 0 && twoStepsRow < 8 && twoStepsCol >= 0 && twoStepsCol < 8 &&
                    jumpedPiece && jumpedPiece.player === opponent &&
                    !currentBoard[twoStepsRow]?.[twoStepsCol]
                ) {
                    moves.push({ to: { row: twoStepsRow, col: twoStepsCol }, capturedPiece: { row: oneStepRow, col: oneStepCol } });
                }
            }
        }
    
        return moves;
    }, []);

    const performMove = useCallback(async (piecePos: Position, move: Move, currentBoard: Board) => {
        if (!gameSessionRef) return { newBoard: currentBoard, nextTurn: gameSession.turn, pieceAtEnd: piecePos };

        const newBoard = JSON.parse(JSON.stringify(currentBoard));
        const pieceToMove = newBoard[piecePos.row][piecePos.col];

        newBoard[move.to.row][move.to.col] = pieceToMove;
        newBoard[piecePos.row][piecePos.col] = null;

        if (move.capturedPiece) {
            newBoard[move.capturedPiece.row][move.capturedPiece.col] = null;
        }

        if (pieceToMove && ((pieceToMove.player === 'p1' && move.to.row === 7) || (pieceToMove.player === 'p2' && move.to.row === 0))) {
            pieceToMove.isKing = true;
        }

        const canCaptureAgain = move.capturedPiece && calculatePossibleMoves(move.to, newBoard).some(m => m.capturedPiece);
        const nextTurn = canCaptureAgain ? gameSession.turn : (gameSession.turn === gameSession.player1Id ? gameSession.player2Id : gameSession.player1Id);
        
        return { newBoard, nextTurn, pieceAtEnd: move.to };

    }, [gameSessionRef, gameSession, calculatePossibleMoves]);


  const handleSquareClick = async (row: number, col: number) => {
    if (!gameSessionRef || !isMyTurn) return;

    const clickedPiece = board[row]?.[col];
    const targetMove = possibleMoves.find(move => move.to.row === row && move.to.col === col);

    if (selectedPiece && targetMove) {
        const { newBoard, nextTurn } = await performMove(selectedPiece, targetMove, board);
        
        const winnerId = checkWinCondition(newBoard);
        const gameUpdate: any = { board: newBoard, turn: nextTurn };
        
        if (gameSession.status === 'ready') {
            gameUpdate.status = 'active';
        }

        if(winnerId){
            gameUpdate.winnerId = winnerId;
            gameUpdate.status = 'completed';
            gameUpdate.endTime = new Date().toISOString();
        }

        await updateDocumentNonBlocking(gameSessionRef, gameUpdate);
        
        const canCaptureAgain = targetMove.capturedPiece && calculatePossibleMoves({row, col}, newBoard).some(m => m.capturedPiece);
        setSelectedPiece(canCaptureAgain ? {row, col} : null);

    } else if (clickedPiece && clickedPiece.player === localPlayerKey) {
      // Force selection of capturing piece if available
      const mandatoryMoves = getMandatoryMoves(board, localPlayerKey);
      if (mandatoryMoves.length > 0 && !mandatoryMoves.some(m => m.piece.row === row && m.piece.col === col)) {
        setSelectedPiece(mandatoryMoves[0].piece);
      } else {
        setSelectedPiece({ row, col });
      }
    } else {
      setSelectedPiece(null);
    }
  };

  const getMandatoryMoves = (currentBoard: Board, player: 'p1' | 'p2'): { piece: Position, moves: Move[] }[] => {
      const allCaptureMoves: { piece: Position, moves: Move[] }[] = [];
      for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
              const piece = currentBoard[r]?.[c];
              if (piece && piece.player === player) {
                  const moves = calculatePossibleMoves({ row: r, col: c }, currentBoard);
                  const captureMoves = moves.filter(m => m.capturedPiece);
                  if (captureMoves.length > 0) {
                      allCaptureMoves.push({ piece: { row: r, col: c }, moves: captureMoves });
                  }
              }
          }
      }
      return allCaptureMoves;
  };
  
    const possibleMoves = useMemo(() => {
        if (!selectedPiece) return [];
        
        const mandatoryMoves = getMandatoryMoves(board, localPlayerKey);
        const movesForSelectedPiece = calculatePossibleMoves(selectedPiece, board);
        
        if (mandatoryMoves.length > 0) {
            const capturesForSelected = mandatoryMoves.find(p => p.piece.row === selectedPiece.row && p.piece.col === selectedPiece.col);
            return capturesForSelected ? capturesForSelected.moves : [];
        }

        return movesForSelectedPiece.filter(m => !m.capturedPiece);

    }, [selectedPiece, board, localPlayerKey, calculatePossibleMoves]);

    useEffect(() => {
        if (isMyTurn) {
            const mandatoryMoves = getMandatoryMoves(board, localPlayerKey);
            if (mandatoryMoves.length > 0) {
                // If only one piece can capture, auto-select it.
                if (mandatoryMoves.length === 1) {
                    setSelectedPiece(mandatoryMoves[0].piece);
                }
            }
        } else {
            setSelectedPiece(null);
        }
    }, [isMyTurn, board, localPlayerKey]);
    
    // Bot move logic
    useEffect(() => {
        if (isBotTurn && gameSessionRef) {
            
            const runBotMove = async () => {
                setIsBotThinking(true);
                let currentBoard = JSON.parse(JSON.stringify(board)); // Work on a copy
                let finalNextTurn = gameSession.turn;
                let continueTurn = true;
                let pieceToMoveAfterCapture: Position | null = null;
    
                while(continueTurn) {
                    const mandatoryMoves = getMandatoryMoves(currentBoard, botPlayerKey!);
                    let pieceToMove: Position;
                    let movesForPiece: Move[];
    
                    if (pieceToMoveAfterCapture) {
                        pieceToMove = pieceToMoveAfterCapture;
                        const subsequentCaptures = calculatePossibleMoves(pieceToMove, currentBoard).filter(m => m.capturedPiece);
                        if (subsequentCaptures.length > 0) {
                            movesForPiece = subsequentCaptures;
                        } else {
                            continueTurn = false; // No more captures, end turn
                            break;
                        }
                    } else if (mandatoryMoves.length > 0) {
                        const randomChoice = mandatoryMoves[Math.floor(Math.random() * mandatoryMoves.length)];
                        pieceToMove = randomChoice.piece;
                        movesForPiece = randomChoice.moves;
                    } else {
                        const allBotPieces: Position[] = [];
                        for(let r = 0; r < 8; r++){
                            for(let c = 0; c < 8; c++){
                                if(currentBoard[r]?.[c]?.player === botPlayerKey) {
                                    allBotPieces.push({row: r, col: c});
                                }
                            }
                        }
                        const piecesWithMoves = allBotPieces.map(p => ({piece: p, moves: calculatePossibleMoves(p, currentBoard).filter(m => !m.capturedPiece)})).filter(p => p.moves.length > 0);
                        if(piecesWithMoves.length === 0) {
                            continueTurn = false; // No moves available
                            break;
                        }
                        
                        const randomChoice = piecesWithMoves[Math.floor(Math.random() * piecesWithMoves.length)];
                        pieceToMove = randomChoice.piece;
                        movesForPiece = randomChoice.moves;
                    }
                    
                    let bestMove: Move;
                    if (movesForPiece.length === 1) {
                        bestMove = movesForPiece[0];
                    } else {
                         try {
                            const response = await getBotMove({ possibleMoves: movesForPiece, botPlayerKey: botPlayerKey! });
                            bestMove = response.bestMove;
                        } catch (error) {
                            console.error("AI failed, picking random move:", error);
                            bestMove = movesForPiece[Math.floor(Math.random() * movesForPiece.length)];
                        }
                    }
    
                    const { newBoard, nextTurn, pieceAtEnd } = await performMove(pieceToMove, bestMove, currentBoard);
                    currentBoard = newBoard; // Update board state for the next loop iteration
                    finalNextTurn = nextTurn; // Keep track of the final turn owner
                    
                    // Decide if the bot's turn should continue
                    if (bestMove.capturedPiece && nextTurn === gameSession.botPlayer.id) {
                        pieceToMoveAfterCapture = pieceAtEnd;
                        continueTurn = true; // There might be more captures
                    } else {
                        pieceToMoveAfterCapture = null;
                        continueTurn = false; // Turn ends after a non-capture move or when turn switches
                    }
                }
                
                const winnerId = checkWinCondition(currentBoard);
                const gameUpdate: any = { board: currentBoard, turn: finalNextTurn };
                
                if (winnerId) {
                    gameUpdate.winnerId = winnerId;
                    gameUpdate.status = 'completed';
                    gameUpdate.endTime = new Date().toISOString();
                }
    
                await updateDocumentNonBlocking(gameSessionRef, gameUpdate);
                setIsBotThinking(false);
            };
    
            // Delay bot move slightly for better UX
            const timeoutId = setTimeout(runBotMove, 1000);
            return () => clearTimeout(timeoutId);
        }
    }, [isBotTurn, gameSession.turn, board, botPlayerKey, gameSessionRef, performMove, calculatePossibleMoves, gameSession.botPlayer?.id]);


  if (!isClient) {
    return (
      <div className="w-full aspect-square max-w-2xl shadow-2xl rounded-lg overflow-hidden border-4 border-card bg-card animate-pulse" />
    );
  }

  const renderBoard = boardMapToArray(board);
  const effectiveTurn = isBotThinking ? false : isMyTurn;

  return (
    <div className={cn("w-full aspect-square max-w-2xl shadow-2xl rounded-lg overflow-hidden border-4 border-stone-800 transition-all", !effectiveTurn && "opacity-70")}>
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
                   isDark ? 'bg-[#8B4513]' : 'bg-[#DEB887]', // SaddleBrown and BurlyWood
                  (effectiveTurn && (piece || isMovable)) && 'cursor-pointer'
                )}
                role="button"
                aria-label={`Board square ${rowIndex}, ${colIndex}`}
              >
                {effectiveTurn && isMovable && !piece && (
                    <div className="w-1/3 h-1/3 rounded-full bg-black/20 transition-opacity hover:bg-black/30" />
                )}
                {piece && (
                  <div
                    className={cn(
                      'w-[80%] h-[80%] rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ease-in-out',
                      piece.player === 'p1' ? 'bg-[#A0522D] border-4 border-[#6F381D]' : 'bg-[#D2B48C] border-4 border-[#B89C74]', // Sienna and Tan
                      isSelected && effectiveTurn && 'ring-4 ring-offset-2 ring-blue-500 ring-offset-transparent'
                    )}
                  >
                    {piece.isKing && (
                      <Crown
                        className={cn(
                          'w-1/2 h-1/2',
                          piece.player === 'p1' ? 'text-yellow-400' : 'text-yellow-200'
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


