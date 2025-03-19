import { cs } from '../api/db.js';
import fs from 'fs';
import Busboy from 'busboy';
import PDFDocument from 'pdfkit';

export default {
    'uploads': {
        post: async (req, res) => {
            const outputPath = './uploads/output.pdf'; 
            const doc = new PDFDocument({ autoFirstPage: false });

            // Create a write stream to save the PDF to disk
            const writeStream = fs.createWriteStream(outputPath);
            doc.pipe(writeStream);

            const busboy = Busboy({ headers: req.headers });

            busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
                let buffer = [];

                // Collect chunks of the file
                file.on('data', data => buffer.push(data));

                file.on('end', () => {
                    const completeBuffer = Buffer.concat(buffer);

                    // Add the image to the PDF on a new page
                    doc.addPage().image(completeBuffer, 0, 0, {
                        width: doc.page.width,
                        height: doc.page.height,
                        align: 'center',
                        valign: 'center'
                    });
                });
            });

            busboy.on('finish', () => {
                // Finalize the PDF and close the write stream
                doc.end();

                writeStream.on('finish', () => {
                    res.send({ message: 'PDF created successfully!', path: outputPath });
                });

                writeStream.on('error', (err) => {
                    console.error('Error writing the PDF:', err);
                    res.status(500).send({ message: 'Error saving the PDF' });
                });
            });

            req.pipe(busboy);
        },
    }
};