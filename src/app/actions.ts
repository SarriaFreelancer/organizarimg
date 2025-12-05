"use server";

import { recommendImageLayout } from "@/ai/flows/ai-powered-layout-recommendation";
import { createDocument } from "@/lib/docx-generator";
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
    console.error("Error fetching layout recommendation:", error);
    // In case of an AI error, we can return a sensible default or null
    if (photoCount <= 4) return 2;
    if (photoCount <= 8) return 4;
    return 6;
  }
}

export async function generateDocx(canvasDataUrls: (string | undefined)[]): Promise<Blob> {
  const doc = await createDocument(canvasDataUrls);
  const blob = await Packer.toBlob(doc);
  return blob;
}
