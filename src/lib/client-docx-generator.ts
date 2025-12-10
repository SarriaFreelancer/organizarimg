
"use client";

import JSZip from 'jszip';

// This is a simplified representation of the DOCX structure.
// It helps in merging the XML parts from different DOCX files.
const filePathsToMerge = [
    'word/document.xml',
    'word/_rels/document.xml.rels'
];

async function mergeContentTypes(zip: JSZip, newZip: JSZip) {
    const contentTypesXml = await zip.file('[Content_Types].xml')?.async('string');
    if (!contentTypesXml) return;

    let finalContentTypes = await newZip.file('[Content_Types].xml')?.async('string') || contentTypesXml;
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(contentTypesXml, "application/xml");
    const newDoc = parser.parseFromString(finalContentTypes, "application/xml");

    // Merge overrides
    const overrides = doc.getElementsByTagName('Override');
    const existingPartNames = new Set(Array.from(newDoc.getElementsByTagName('Override')).map(o => o.getAttribute('PartName')));
    
    for (const override of Array.from(overrides)) {
        const partName = override.getAttribute('PartName');
        if (partName && !existingPartNames.has(partName)) {
            newDoc.documentElement.appendChild(override.cloneNode(true));
        }
    }
    
    const serializer = new XMLSerializer();
    newZip.file('[Content_Types].xml', serializer.serializeToString(newDoc));
}


async function mergeXmlFile(zip: JSZip, newZip: JSZip, filePath: string) {
    const xmlStr = await zip.file(filePath)?.async('string');
    let finalXmlStr = await newZip.file(filePath)?.async('string');
    
    if (!xmlStr) return;
    if (!finalXmlStr) {
        newZip.file(filePath, xmlStr);
        return;
    }
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlStr, "application/xml");
    const finalDoc = parser.parseFromString(finalXmlStr, "application/xml");

    // In word/document.xml, we want to append the <w:body> children
    if (filePath === 'word/document.xml') {
        const body = doc.getElementsByTagName('w:body')[0];
        const finalBody = finalDoc.getElementsByTagName('w:body')[0];
        if (body && finalBody) {
             // Append sectPr from the last document
            const sectPr = body.getElementsByTagName('w:sectPr')[0];
            const finalSectPr = finalBody.getElementsByTagName('w:sectPr')[0];
            if (finalSectPr) finalBody.removeChild(finalSectPr);

            for (const child of Array.from(body.children)) {
                 finalBody.appendChild(child.cloneNode(true));
            }
        }
    }
    // In word/_rels/document.xml.rels, we merge all relationships
    else if (filePath === 'word/_rels/document.xml.rels') {
        const relationships = doc.getElementsByTagName('Relationship');
        const finalRelationships = finalDoc.getElementsByTagName('Relationships')[0];
        if (relationships && finalRelationships) {
            const existingIds = new Set(Array.from(finalDoc.getElementsByTagName('Relationship')).map(r => r.getAttribute('Id')));
            for (const rel of Array.from(relationships)) {
                 if (!existingIds.has(rel.getAttribute('Id')!)) {
                    finalRelationships.appendChild(rel.cloneNode(true));
                 }
            }
        }
    }
    
    const serializer = new XMLSerializer();
    newZip.file(filePath, serializer.serializeToString(finalDoc));
}

async function copyFile(fromZip: JSZip, toZip: JSZip, filePath: string) {
    const fileData = await fromZip.file(filePath)?.async('blob');
    if (fileData) {
        toZip.file(filePath, fileData);
    }
}

export async function mergeDocx(docxB64Pages: string[]): Promise<Blob> {
    const finalZip = new JSZip();

    for (let i = 0; i < docxB64Pages.length; i++) {
        const b64 = docxB64Pages[i];
        const zip = await JSZip.loadAsync(b64, { base64: true });

        if (i === 0) {
            // First document, copy all files
            const promises = Object.keys(zip.files).map(filePath => copyFile(zip, finalZip, filePath));
            await Promise.all(promises);
        } else {
            // For subsequent documents, merge specific files and copy media
            const promises: Promise<any>[] = [];

            promises.push(mergeContentTypes(zip, finalZip));
            
            for (const filePath of filePathsToMerge) {
                promises.push(mergeXmlFile(zip, finalZip, filePath));
            }

            // Copy media files
            const mediaFiles = Object.keys(zip.files).filter(fp => fp.startsWith('word/media/'));
            for (const filePath of mediaFiles) {
                promises.push(copyFile(zip, finalZip, filePath));
            }
            
            await Promise.all(promises);
        }
    }

    return finalZip.generateAsync({ type: 'blob' });
}
