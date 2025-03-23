import AdmZip from 'adm-zip';
import { parseStringPromise } from 'xml2js';

export const extractScoreInfo =async (mxlFilePath) => {
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

	const xmlData = await parseStringPromise(xmlContent);
	const part = xmlData['score-partwise'];

	return {
		title: part?.['movement-title']?.[0],
		creator: part?.identification?.[0]?.creator?.[0]?.["_"]
	}
}
