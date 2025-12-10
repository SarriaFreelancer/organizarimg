
import * as docx from 'docx';

// A4 dimensions in twentieths of a point (twips)
const A4_LANDSCAPE_WIDTH_TWIPS = 15840;
const A4_LANDSCAPE_HEIGHT_TWIPS = 12240;

// User specified dimensions in twips (1cm = 567 twips)
// Width: 24.9cm * 567 = 14118.3 -> 14118
const IMAGE_WIDTH_TWIPS = 14118;
// Height: 18.5cm * 567 = 10489.5 -> 10490
const IMAGE_HEIGHT_TWIPS = 10490;

export function createDocumentSection(imageBuffer: ArrayBuffer, pageNum: number, totalPages: number): docx.ISectionOptions {
    const margin = 907; // ~1.59cm margin
    const availableWidth = A4_LANDSCAPE_WIDTH_TWIPS - (margin * 2);
    const availableHeight = A4_LANDSCAPE_HEIGHT_TWIPS - (margin * 2);

    const section: docx.ISectionOptions = {
        properties: {
            page: {
                margin: { top: margin, right: margin, bottom: margin, left: margin },
                size: { width: A4_LANDSCAPE_WIDTH_TWIPS, height: A4_LANDSCAPE_HEIGHT_TWIPS },
                orientation: docx.PageOrientation.LANDSCAPE,
            },
        },
        footers: {
            default: new docx.Footer({
                children: [
                    new docx.Paragraph({
                        alignment: docx.AlignmentType.CENTER,
                        children: [
                            new docx.TextRun({
                                children: ["Página ", docx.PageNumber.CURRENT, " de ", docx.PageNumber.TOTAL_PAGES],
                            }),
                        ],
                    }),
                ],
            }),
        },
        children: [
            new docx.Paragraph({
                alignment: docx.AlignmentType.CENTER,
                children: [
                    new docx.ImageRun({
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
