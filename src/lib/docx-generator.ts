
import * as docx from 'docx';

export function createDocumentSection(imageBuffer: ArrayBuffer): docx.ISectionOptions {
    const A4_LANDSCAPE_WIDTH_TWIPS = 16838; // 29.7cm
    const A4_LANDSCAPE_HEIGHT_TWIPS = 11906; // 21cm
    const margin = 720; // 0.5 inch

    // 27cm in twips = 27 * 567 = 15309
    const imageWidth = 15309;
    // 18.8cm in twips = 18.8 * 567 = 10659.6
    const imageHeight = 10660;

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
