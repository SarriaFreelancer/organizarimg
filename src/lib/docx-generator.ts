import { Document, Packer, ImageRun, Paragraph, PageBreak, PageNumber, AlignmentType } from 'docx';

const A4_WIDTH_POINTS = 595.28;
const A4_HEIGHT_POINTS = 841.89;

function dataUrlToBuffer(dataUrl: string): Buffer {
    const base64 = dataUrl.split(',')[1];
    return Buffer.from(base64, 'base64');
}


export async function createDocument(canvasDataUrls: (string | undefined)[]): Promise<Document> {
    const imageBuffers = canvasDataUrls
        .filter((dataUrl): dataUrl is string => typeof dataUrl === 'string')
        .map(dataUrlToBuffer);

    const doc = new Document({
        sections: imageBuffers.map((buffer, index) => ({
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
                            format: "página {current} de {total}",
                        }),
                    ],
                }),
            },
            children: [
                new Paragraph({
                    children: [
                        new ImageRun({
                            data: buffer,
                            transformation: {
                                width: A4_HEIGHT_POINTS - 1440 / 20,
                                height: A4_WIDTH_POINTS - 1440 / 20,
                            },
                        }),
                    ],
                }),
                ...(index < imageBuffers.length - 1 ? [new Paragraph({ children: [new PageBreak()] })] : []),
            ],
        })),
    });

    return doc;
}
