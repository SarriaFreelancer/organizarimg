
import { Document, Packer, ImageRun, Paragraph, PageBreak, PageNumber, AlignmentType, ISectionOptions } from 'docx';

export const A4_WIDTH_POINTS = 595.28;
export const A4_HEIGHT_POINTS = 841.89;

function dataUrlToBuffer(dataUrl: string): Buffer {
    const base64 = dataUrl.split(',')[1];
    return Buffer.from(base64, 'base64');
}

export async function createDocumentSection(canvasDataUrl: string, index: number, total: number): Promise<ISectionOptions> {
    const imageBuffer = dataUrlToBuffer(canvasDataUrl);
    
    const margin = 720; // 1 inch
    const availableWidth = A4_HEIGHT_POINTS - margin * 2;
    const availableHeight = A4_WIDTH_POINTS - margin * 2;

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
        headers: {
            default: new Paragraph({
                children: [], 
            }),
        },
        footers: {
            default: new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new Paragraph(`Página ${index + 1} de ${total}`),
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
}

    