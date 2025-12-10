import { Document, Packer, ImageRun, Paragraph, PageBreak, PageNumber, AlignmentType, ISectionOptions } from 'docx';

export const A4_WIDTH_POINTS = 595.28;
export const A4_HEIGHT_POINTS = 841.89;

function dataUrlToBuffer(dataUrl: string): Buffer {
    const base64 = dataUrl.split(',')[1];
    return Buffer.from(base64, 'base64');
}

export async function createDocumentSection(canvasDataUrl: string, index: number, total: number): Promise<ISectionOptions> {
    const imageBuffer = dataUrlToBuffer(canvasDataUrl);

    return {
        properties: {
            page: {
                margin: {
                    top: 720,
                    right: 720,
                    bottom: 720,
                    left: 720,
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
                    new PageNumber({
                        format: `página ${index + 1} de ${total}`,
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
                            width: A4_HEIGHT_POINTS - 1440 / 20,
                            height: A4_WIDTH_POINTS - 1440 / 20,
                        },
                    }),
                ],
            }),
        ],
    };
}
