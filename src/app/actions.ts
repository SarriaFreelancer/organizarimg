
"use server";

import { recommendImageLayout } from "@/ai/flows/ai-powered-layout-recommendation";
import { createDocumentSection } from "@/lib/docx-generator";
import { Packer } from "docx";

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
    if (photoCount <= 4) return 2;
    if (photoCount <= 8) return 4;
    return 6;
  }
}

function dataUrlToBuffer(dataUrl: string): Buffer {
  const base64 = dataUrl.split(',')[1];
  return Buffer.from(base64, 'base64');
}

export async function generateDocxPage(canvasDataUrl: string, pageNum: number, totalPages: number): Promise<string> {
    const imageBuffer = dataUrlToBuffer(canvasDataUrl);
    const section = createDocumentSection(imageBuffer, pageNum, totalPages);
    
    // We create a temporary document with just one section to pack it.
    // The client will unzip this and re-assemble the final document.
    const doc = {
        sections: [section],
    };

    const packer = new Packer();
    const b64 = await packer.toBase64String(doc as any);
    return b64;
}
