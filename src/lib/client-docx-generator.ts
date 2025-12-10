"use client";
import { Document, Packer, ImageRun, Paragraph, ISectionOptions, AlignmentType, TextRun, Footer, PageNumber } from 'docx';

const A4_HEIGHT_POINTS = 841.89;
const A4_WIDTH_POINTS = 595.28;

function dataUrlToArrayBuffer(dataUrl: string): ArrayBuffer {
    const base64 = dataUrl.split(',')[1];
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

export async function generateFullDocx(canvasDataUrls: string[]): Promise<Blob> {
    const margin = 720; // 1 inch = 720 twentieths of a point
    const availableWidth = A4_HEIGHT_POINTS - margin * 2;
    const availableHeight = A4_WIDTH_POINTS - margin * 2;

    const sections: ISectionOptions[] = canvasDataUrls.map((dataUrl) => {
        if (!dataUrl) {
            // This should not happen, but as a fallback, return an empty section
            return { children: [] };
        }
        const imageBuffer = dataUrlToArrayBuffer(dataUrl);

        return {
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
                default: new Footer({
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                                new TextRun({
                                    children: ["Página ", PageNumber.CURRENT, " de ", PageNumber.TOTAL_PAGES],
                                }),
                            ],
                        }),
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
    });
    
    const doc = new Document({ sections });

    const blob = await Packer.toBlob(doc);
    return blob;
}
