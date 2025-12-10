"use server";

import { recommendImageLayout } from "@/ai/flows/ai-powered-layout-recommendation";
import { createDocumentSection } from "@/lib/docx-generator";
import { ISectionOptions } from "docx";

export async function getLayoutRecommendation(photoCount: number): Promise<2 | 4 | 6 | null> {
  if (photoCount === 0) {
    return null;
  }
  try {
    const result = await recommendImageLayout({ numberOfPhotos: photoCount });
    const imagesPerPage = result.imagesPerPage;
    if ([2, 4, 6].includes(imagesPerPage)) {
        return imagesPerPage as 2 | 4 | 6;
    }
    return null;
  } catch (error) {
    console.error("Error al obtener la recomendación de diseño:", error);
    // En caso de un error de la IA, podemos devolver un valor predeterminado o nulo
    if (photoCount <= 4) return 2;
    if (photoCount <= 8) return 4;
    return 6;
  }
}

export async function generateDocxPage(canvasDataUrl: string, pageIndex: number, totalPages: number): Promise<ISectionOptions> {
  const section = await createDocumentSection(canvasDataUrl, pageIndex, totalPages);
  return section;
}