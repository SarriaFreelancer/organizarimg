'use server';

/**
 * @fileOverview Recommends an optimal number of images per page based on the number of photos uploaded.
 *
 * - recommendImageLayout - A function that recommends the number of images per page.
 * - RecommendImageLayoutInput - The input type for the recommendImageLayout function.
 * - RecommendImageLayoutOutput - The return type for the recommendImageLayout function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendImageLayoutInputSchema = z.object({
  numberOfPhotos: z
    .number()
    .describe('The number of photos the user has uploaded.'),
});
export type RecommendImageLayoutInput = z.infer<typeof RecommendImageLayoutInputSchema>;

const RecommendImageLayoutOutputSchema = z.object({
  imagesPerPage: z
    .number()
    .describe(
      'The recommended number of images to display per page (2, 4, or 6).' + 
      'The system balances canvas space use with visual coherence.'
    ),
});
export type RecommendImageLayoutOutput = z.infer<typeof RecommendImageLayoutOutputSchema>;

export async function recommendImageLayout(
  input: RecommendImageLayoutInput
): Promise<RecommendImageLayoutOutput> {
  return recommendImageLayoutFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendImageLayoutPrompt',
  input: {schema: RecommendImageLayoutInputSchema},
  output: {schema: RecommendImageLayoutOutputSchema},
  prompt: `Given that a user has uploaded {{numberOfPhotos}} photos, recommend the optimal number of images to display per page to create a visually coherent and balanced layout. The options are 2, 4, or 6 images per page.

  Consider these guidelines:
  *   Prioritize using as much of the canvas space as possible, without making the page look too crowded.
  *   With few images (1-4), avoid 6 images per page, select either 2 or 4.
  *   With many images (more than 12), choose 6 images per page where possible.
  
  Return the recommendation as a single integer (2, 4, or 6).`,
});

const recommendImageLayoutFlow = ai.defineFlow(
  {
    name: 'recommendImageLayoutFlow',
    inputSchema: RecommendImageLayoutInputSchema,
    outputSchema: RecommendImageLayoutOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
