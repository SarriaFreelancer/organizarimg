'use server';

/**
 * @fileOverview Recomienda un número óptimo de imágenes por página basado en el número de fotos subidas.
 *
 * - recommendImageLayout - Una función que recomienda el número de imágenes por página.
 * - RecommendImageLayoutInput - El tipo de entrada para la función recommendImageLayout.
 * - RecommendImageLayoutOutput - El tipo de retorno para la función recommendImageLayout.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendImageLayoutInputSchema = z.object({
  numberOfPhotos: z
    .number()
    .describe('El número de fotos que el usuario ha subido.'),
});
export type RecommendImageLayoutInput = z.infer<typeof RecommendImageLayoutInputSchema>;

const RecommendImageLayoutOutputSchema = z.object({
  imagesPerPage: z
    .number()
    .describe(
      'El número recomendado de imágenes a mostrar por página (2, 4, o 6).' + 
      'El sistema equilibra el uso del espacio del lienzo con la coherencia visual.'
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
  prompt: `Dado que un usuario ha subido {{numberOfPhotos}} fotos, recomienda el número óptimo de imágenes a mostrar por página para crear un diseño visualmente coherente y equilibrado. Las opciones son 2, 4 o 6 imágenes por página.

  Considera estas directrices:
  *   Prioriza usar tanto espacio del lienzo como sea posible, sin que la página se vea demasiado concurrida.
  *   Con pocas imágenes (1-4), evita 6 imágenes por página, selecciona 2 o 4.
  *   Con muchas imágenes (más de 12), elige 6 imágenes por página cuando sea posible.
  
  Devuelve la recomendación como un único número entero (2, 4 o 6).`,
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
