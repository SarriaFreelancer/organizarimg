
import { AlignmentType, Footer, ImageRun, ISectionOptions, PageNumber, PageOrientation, Paragraph, TextRun } from 'docx';

const A4_LANDSCAPE_WIDTH_TWIPS = 16838;
const A4_LANDSCAPE_HEIGHT_TWIPS = 11906;

export function createDocumentSection(imageBuffer: ArrayBuffer): ISectionOptions {
    const margin = 720; // 0.5 inch margin in twips
    const availableWidth = A4_LANDSCAPE_WIDTH_TWIPS - (margin * 2);
    const availableHeight = A4_LANDSCAPE_HEIGHT_TWIPS - (margin * 2);

    return {
        properties: {
            page: {
                margin: { top: margin, right: margin, bottom: margin, left: margin },
                size: { width: A4_LANDSCAPE_WIDTH_TWIPS, height: A4_LANDSCAPE_HEIGHT_TWIPS, orientation: PageOrientation.LANDSCAPE },
            },
        },
        footers: {
            default: new Footer({
                children: [
                    new Paragraph({
                        alignment: AlignmentType.RIGHT,
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
                alignment: AlignmentType.CENTER,
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

    