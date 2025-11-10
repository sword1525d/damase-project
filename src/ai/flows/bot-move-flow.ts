
'use server';
import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Types for the board state and moves
const PieceSchema = z.object({
  player: z.enum(['p1', 'p2']),
  isKing: z.boolean(),
});

const BoardRowSchema = z.record(z.union([PieceSchema, z.null()]));
const BoardSchema = z.record(BoardRowSchema);

const PositionSchema = z.object({
  row: z.number(),
  col: z.number(),
});

const MoveSchema = z.object({
  to: PositionSchema,
  capturedPiece: PositionSchema.nullable(),
});

const BotMoveInputSchema = z.object({
  board: BoardSchema.describe('The current state of the checkers board as a JSON object.'),
  possibleMoves: z.array(MoveSchema).describe('A list of all valid moves for the bot to choose from.'),
  botPlayerKey: z.enum(['p1', 'p2']).describe("The key representing the bot player, either 'p1' or 'p2'."),
  botPiecePosition: PositionSchema.describe('The position of the piece the bot should move.'),
});
export type BotMoveInput = z.infer<typeof BotMoveInputSchema>;

const BotMoveOutputSchema = z.object({
  bestMove: MoveSchema.describe('The best move the bot has decided to make from the list of possible moves.'),
});
export type BotMoveOutput = z.infer<typeof BotMoveOutputSchema>;

export async function getBotMove(input: BotMoveInput): Promise<BotMoveOutput> {
  return await botMoveFlow(input);
}


const botMovePrompt = ai.definePrompt({
    name: 'checkersBotMovePrompt',
    input: { schema: BotMoveInputSchema },
    output: { schema: BotMoveOutputSchema },
    prompt: `
        You are an expert Checkers (Draughts) player AI. Your goal is to win the game.
        You are playing as player '{{botPlayerKey}}'.
        You have been asked to make a move for the piece at position (row: {{botPiecePosition.row}}, col: {{botPiecePosition.col}}).

        Analyze the current board state and the list of possible moves provided.
        Your decision should be strategic, aiming to either capture an opponent's piece, move to a defensively strong position, become a king, or set up future captures.

        Current Board State:
        \`\`\`json
        {{{json stringify=board}}}
        \`\`\`

        Here are the valid moves for the piece at ({{botPiecePosition.row}}, {{botPiecePosition.col}}):
        \`\`\`json
        {{{json stringify=possibleMoves}}}
        \`\`\`
        
        Rules for selecting the best move:
        1.  **Forced Capture:** If any of the 'possibleMoves' include a capture ('capturedPiece' is not null), you MUST choose one of those moves. This is a mandatory rule in checkers.
        2.  **Strategic Priority (if multiple captures exist):**
            a.  Choose a capture that allows for a subsequent capture in the next turn if possible.
            b.  Choose a capture that saves your piece from being captured in the opponent's next turn.
            c.  Choose a capture that results in your piece becoming a king.
        3.  **Strategic Priority (if no captures exist):**
            a.  Prioritize moves that lead to your piece becoming a king (reaching the opponent's back row).
            b.  Prioritize moves that place your piece in a safe position (e.g., on the side of the board or where it cannot be immediately jumped).
            c.  Prioritize moves that block the opponent's key pieces.
            d.  As a lower priority, move pieces from your back row forward into the game.

        Based on your analysis, select the single best move from the 'possibleMoves' list and return it in the 'bestMove' field.
    `,
});

const botMoveFlow = ai.defineFlow(
  {
    name: 'checkersBotMoveFlow',
    inputSchema: BotMoveInputSchema,
    outputSchema: BotMoveOutputSchema,
  },
  async (input) => {
    // If there's only one possible move, just return it.
    if (input.possibleMoves.length === 1) {
        return { bestMove: input.possibleMoves[0] };
    }

    const { output } = await botMovePrompt(input);
    return output!;
  }
);
