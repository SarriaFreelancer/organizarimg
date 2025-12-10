
import * as docx from 'docx';

export function createDocumentSection(imageBuffer: ArrayBuffer): docx.ISectionOptions {
    const A4_LANDSCAPE_WIDTH_TWIPS = 16838; // 29.7cm
    const A4_LANDSCAPE_HEIGHT_TWIPS = 11906; // 21cm
    const margin = 720; // 0.5 inch

    const imageWidth = A4_LANDSCAPE_WIDTH_TWIPS - (margin * 2);
    const imageHeight = A4_LANDSCAPE_HEIGHT_TWIPS - (margin * 2);

    return {
        properties: {
            page: {
                margin: { top: margin, right: margin, bottom: margin, left: margin },
                size: { 
                    width: A4_LANDSCAPE_WIDTH_TWIPS, 
                    height: A4_LANDSCAPE_HEIGHT_TWIPS, 
                    orientation: 'landscape' as docx.PageOrientation,
                },
            },
        },
        footers: {
            default: new docx.Footer({
                children: [
                    new docx.Paragraph({
                        alignment: 'right' as docx.AlignmentType,
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
                alignment: 'center' as docx.AlignmentType,
                children: [
                    new docx.ImageRun({
                        data: imageBuffer,
                        transformation: {
                            width: imageWidth,
                            height: imageHeight,
                        },
                    }),
                ],
            }),
        ],
    };
}
