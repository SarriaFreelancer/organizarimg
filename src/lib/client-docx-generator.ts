
"use client";
import { Document, Packer, ImageRun, Paragraph, ISectionOptions, AlignmentType, TextRun } from 'docx';

const A4_HEIGHT_POINTS = 841.89;
const A4_WIDTH_POINTS = 595.28;

function dataUrlToBuffer(dataUrl: string): Buffer {
    const base64 = dataUrl.split(',')[1];
    return Buffer.from(base64, 'base64');
}

export async function generateFullDocx(canvasDataUrls: string[]): Promise<Blob> {
    const sections: ISectionOptions[] = [];

    const margin = 720; // 1 inch = 720 twentieths of a point
    const availableWidth = A4_HEIGHT_POINTS - margin * 2;
    const availableHeight = A4_WIDTH_POINTS - margin * 2;

    for (let i = 0; i < canvasDataUrls.length; i++) {
        const dataUrl = canvasDataUrls[i];
        if (!dataUrl) continue;

        const imageBuffer = dataUrlToBuffer(dataUrl);

        const section: ISectionOptions = {
            properties: {
                page: {
                    margin: {
                        top: margin,
                        right: margin,
                        bottom: margin,
                        left: margin,
                    },
                    size: {
                        orientation: 'landscape',
                        width: A4_HEIGHT_POINTS,
                        height: A4_WIDTH_POINTS,
                    },
                },
            },
            footers: {
                default: new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                        new TextRun(`Página ${i + 1} de ${canvasDataUrls.length}`),
                    ],
                }),
            },
            children: [
                new Paragraph({
                    children: [
                        new ImageRun({
                            data: imageBuffer,
                            transformation: {
                                width: availableWidth,
                                height: availableHeight,
                            },
                        }),
                    ],
                }),
            ],
        };
        sections.push(section);
    }
    
    const doc = new Document({ sections });

    const blob = await Packer.toBlob(doc);
    return blob;
}
