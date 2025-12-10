
import { Document, ImageRun, Paragraph, Footer, AlignmentType, PageNumber, ISectionOptions, TextRun } from 'docx';

const A4_HEIGHT_POINTS = 841.89;
const A4_WIDTH_POINTS = 595.28;

export function createDocumentSection(imageBuffer: Buffer, pageNum: number, totalPages: number): ISectionOptions {
    const margin = 720;
    const availableWidth = A4_HEIGHT_POINTS - margin * 2;
    const availableHeight = A4_WIDTH_POINTS - margin * 2;
    
    const section: ISectionOptions = {
        properties: {
            page: {
                margin: { top: margin, right: margin, bottom: margin, left: margin },
                size: { orientation: 'landscape', width: A4_HEIGHT_POINTS, height: A4_WIDTH_POINTS },
            },
        },
        footers: {
            default: new Footer({
                children: [
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new TextRun({
                                children: ["Página ", String(pageNum), " de ", String(totalPages)],
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
    return section;
}
