import { cs } from '../api/db.js';
import fs from 'fs';
import Busboy from 'busboy';
import PDFDocument from 'pdfkit';
import { getTitle } from './title/service.js';
import { v4 as uuid } from 'uuid';

export default {
    'uploads': {
        post: async (req, res) => {
            const filename = `${uuid()}.pdf`;
            const outputPath = `./uploads/${filename}`; 
            const doc = new PDFDocument({ autoFirstPage: false });

            // Create a write stream to save the PDF to disk
            const writeStream = fs.createWriteStream(outputPath);
            doc.pipe(writeStream);

            const busboy = Busboy({ headers: req.headers });
            let index = 0;

            let titlePromise = null;
            const result = await new Promise((resolve, reject) => {
                busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
                    let buffer = [];

                    // Collect chunks of the file
                    file.on('data', data => buffer.push(data));

                    file.on('end', () => {
                        const completeBuffer = Buffer.concat(buffer);

                        if ( index === 0 ) {
                            titlePromise = getTitle(completeBuffer);
                        }

                        // Add the image to the PDF on a new page
                        doc.addPage().image(completeBuffer, 0, 0, {
                            width: doc.page.width,
                            height: doc.page.height,
                            align: 'center',
                            valign: 'center'
                        });

                        index++;
                    });
                });

                busboy.on('finish', () => {
                    // Finalize the PDF and close the write stream
                    doc.end();

                    writeStream.on('finish', () => {
                        resolve({ status: 200, res: { message: 'PDF created successfully!' } });
                    });

                    writeStream.on('error', (err) => {
                        console.error('Error writing the PDF:', err);
                        resolve({ status: 500, res: { message: 'Error saving the PDF' } });
                    });
                });

                req.pipe(busboy);
            });

            if ( titlePromise ) {
                const title = await titlePromise;
                result.res.title = title;
            }

            await cs.musicssheets.insertOne({
                title: result.res.title,
                filename
            });

            res.status(result.status).send(result.res);
        },
    }
};