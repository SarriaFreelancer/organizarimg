import { Document, Packer, ImageRun, Paragraph, PageBreak, PageNumber, AlignmentType } from 'docx';

const A4_WIDTH_POINTS = 595.28;
const A4_HEIGHT_POINTS = 841.89;

async function canvasToBuffer(canvas: HTMLCanvasElement): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error("Failed to create blob from canvas"));
                return;
            }
            const reader = new FileReader();
            reader.onload = () => {
                if (reader.result instanceof ArrayBuffer) {
                    resolve(Buffer.from(reader.result));
                } else {
                    reject(new Error("Failed to read canvas blob as ArrayBuffer"));
                }
            };
            reader.onerror = (error) => reject(error);
            reader.readAsArrayBuffer(blob);
        }, 'image/png');
    });
}


export async function createDocument(canvases: (HTMLCanvasElement | null)[]): Promise<Document> {
    const imageBuffers = await Promise.all(
        canvases.filter((c): c is HTMLCanvasElement => c !== null).map(canvasToBuffer)
    );

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
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                                new PageNumber({
                                    format: "página {current} de {total}",
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
                            data: buffer,
                            transformation: {
                                width: A4_HEIGHT_POINTS - 1440 / 20, // A4 landscape height in points minus margins
                                height: A4_WIDTH_POINTS - 1440 / 20, // A4 landscape width in points minus margins
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
