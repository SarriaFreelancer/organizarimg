
import { ImageRun, Paragraph, Footer, AlignmentType, PageNumber, ISectionOptions, TextRun, PageSize, PageOrientation } from 'docx';

const A4_HEIGHT_POINTS = 841.89;
const A4_WIDTH_POINTS = 595.28;

export function createDocumentSection(imageBuffer: ArrayBuffer, pageNum: number, totalPages: number): ISectionOptions {
    const margin = 720; // 0.5 inch in twentieths of a point
    const availableWidth = A4_HEIGHT_POINTS - margin * 2;
    const availableHeight = A4_WIDTH_POINTS - margin * 2;
    
    const section: ISectionOptions = {
        properties: {
            page: {
                margin: { top: margin, right: margin, bottom: margin, left: margin },
                size: { width: A4_HEIGHT_POINTS, height: A4_WIDTH_POINTS },
                orientation: PageOrientation.LANDSCAPE,
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
    return section;
}

    