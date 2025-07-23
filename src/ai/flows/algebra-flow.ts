
'use server';
/**
 * @fileOverview An AI flow for solving algebra problems.
 *
 * - solveAlgebra - A function that takes an algebra problem and returns the solution.
 * - AlgebraInput - The input type for the solveAlgebra function.
 * - AlgebraOutput - The return type for the solveAlgebra function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AlgebraInputSchema = z.object({
  problem: z.string().describe('The algebra problem to solve.'),
});
export type AlgebraInput = z.infer<typeof AlgebraInputSchema>;

const AlgebraOutputSchema = z.object({
  solution: z.string().describe('The step-by-step solution to the algebra problem.'),
});
export type AlgebraOutput = z.infer<typeof AlgebraOutputSchema>;


export async function solveAlgebra(input: AlgebraInput): Promise<AlgebraOutput> {
  return solveAlgebraFlow(input);
}

const prompt = ai.definePrompt({
  name: 'algebraPrompt',
  input: { schema: AlgebraInputSchema },
  output: { schema: AlgebraOutputSchema },
  prompt: `You are a friendly and helpful math tutor. Your task is to solve the following algebra problem and provide a clear, step-by-step explanation of how to arrive at the solution.

Problem:
{{{problem}}}

Provide the final answer and the detailed steps to solve it.
`,
});

const solveAlgebraFlow = ai.defineFlow(
  {
    name: 'solveAlgebraFlow',
    inputSchema: AlgebraInputSchema,
    outputSchema: AlgebraOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
