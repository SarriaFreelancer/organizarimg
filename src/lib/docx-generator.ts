
import * as docx from 'docx';

export function createDocumentSectionChildren(imageBuffer: ArrayBuffer): (docx.Paragraph | docx.Table)[] {
    const imageWidthTwips = (27 / 2.54) * 72 * 20; // 15309 twips for 27cm
    const imageHeightTwips = (18.8 / 2.54) * 72 * 20; // 10659 twips for 18.8cm

    return [
        new docx.Paragraph({
            alignment: 'center',
            children: [
                new docx.ImageRun({
                    data: imageBuffer,
                    transformation: {
                        width: imageWidthTwips,
                        height: imageHeightTwips,
                    },
                }),
            ],
        }),
    ];
}
