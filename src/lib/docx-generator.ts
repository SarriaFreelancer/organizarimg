
import { ImageRun, Paragraph, Footer, AlignmentType, PageNumber, ISectionOptions, TextRun, PageOrientation } from 'docx';

// A4 dimensions in twentieths of a point (twips)
const A4_LANDSCAPE_WIDTH_TWIPS = 15840;
const A4_LANDSCAPE_HEIGHT_TWIPS = 12240;


export function createDocumentSection(imageBuffer: ArrayBuffer, pageNum: number, totalPages: number): ISectionOptions {
    const margin = 907; // ~1.59cm margin

    const availableWidth = A4_LANDSCAPE_WIDTH_TWIPS - (margin * 2);
    const availableHeight = A4_LANDSCAPE_HEIGHT_TWIPS - (margin * 2);

    const section: ISectionOptions = {
        properties: {
            page: {
                margin: { top: margin, right: margin, bottom: margin, left: margin },
                size: { width: A4_LANDSCAPE_WIDTH_TWIPS, height: A4_LANDSCAPE_HEIGHT_TWIPS },
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
                        width: availableWidth,
                        height: availableHeight,
                    }),
                ],
            }),
        ],
    };
    return section;
}
