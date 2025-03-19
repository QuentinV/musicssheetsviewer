import tesseract from 'tesseract.js';

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
