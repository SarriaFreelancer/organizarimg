
import { ImageRun, Paragraph, Footer, AlignmentType, PageNumber, ISectionOptions, TextRun, PageOrientation } from 'docx';

const A4_LANDSCAPE_WIDTH_POINTS = 11906; // 8.27 in * 1440
const A4_LANDSCAPE_HEIGHT_POINTS = 8419; // 5.84 in * 1440

export function createDocumentSection(imageBuffer: ArrayBuffer, pageNum: number, totalPages: number): ISectionOptions {
    const margin = 720; // 0.5 inch in twentieths of a point

    const availableWidth = A4_LANDSCAPE_WIDTH_POINTS - (margin * 2);
    const availableHeight = A4_LANDSCAPE_HEIGHT_POINTS - (margin * 2);
    
    const section: ISectionOptions = {
        properties: {
            page: {
                margin: { top: margin, right: margin, bottom: margin, left: margin },
                size: { width: A4_LANDSCAPE_WIDTH_POINTS, height: A4_LANDSCAPE_HEIGHT_POINTS },
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

    