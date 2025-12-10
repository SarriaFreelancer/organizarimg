
import * as docx from 'docx';

export function createDocumentSection(imageBuffer: ArrayBuffer): docx.ISectionOptions {
    const A4_LANDSCAPE_WIDTH_TWIPS = 16838;
    const A4_LANDSCAPE_HEIGHT_TWIPS = 11906;
    const margin = 720; // 0.5 inch = 720 twips

    const imageWidth = (27 / 2.54) * 72 * 20; // 27cm to twips
    const imageHeight = (18.8 / 2.54) * 72 * 20; // 18.8cm to twips

    return {
        properties: {
            page: {
                margin: { top: margin, right: margin, bottom: margin, left: margin },
                size: { 
                    width: A4_LANDSCAPE_WIDTH_TWIPS, 
                    height: A4_LANDSCAPE_HEIGHT_TWIPS, 
                    orientation: 'landscape',
                },
            },
        },
        footers: {
            default: new docx.Footer({
                children: [
                    new docx.Paragraph({
                        alignment: 'right',
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
                alignment: 'center',
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

    