import tesseract from 'tesseract.js';
import AdmZip from 'adm-zip';
import { parseStringPromise } from 'xml2js';
import fs from 'fs';

export const getTitle = async(image) => {
    try {
        const { data: { text } } = await tesseract.recognize(image, 'eng', {
            logger: (info) => console.log(info) // Log OCR progress (optional)
        });
    
        // Assuming the title is at the top, extract the first few lines
        const lines = text.split('\n');
        const title = lines[0].trim(); // The first line is likely the title
    
        console.log('Extracted Title:', title);
        return title;
    } catch( e ) {
        console.error('Error during OCR:', error);
    }
};

export const extractScoreName =async (mxlFilePath) => {
  try {
    // Load the .mxl file
    const zip = new AdmZip(mxlFilePath);
    const entries = zip.getEntries();

    // Find the main MusicXML file (usually ends with .xml)
    const musicXmlEntry = entries.find(entry => entry.entryName.endsWith(".xml"));
    if (!musicXmlEntry) {
      throw new Error("MusicXML file not found in .mxl archive.");
    }

    // Read the XML content
    const xmlContent = musicXmlEntry.getData().toString("utf-8");

    // Parse the XML to extract the score name
    const xmlData = await parseStringPromise(xmlContent);
    return xmlData?.scorePartwise.work?.[0]["work-title"]?.[0] || "Unknown Title";
  } catch (error) {
    console.error("Error:", error.message);
  }
}
