import { cs } from '../api/db.js';
import Busboy from 'busboy';
import PDFDocument from 'pdfkit';
import FormData from 'form-data';
import { PassThrough } from 'stream';
import fetch from 'node-fetch';

export default {
    'sheets': {
        get: async (req, res) => {
            const { rows, first, q } = req.query;
            const filter = {};
            if (q) {
                filter.title = new RegExp("^" + q, "i");
            } else {
                filter.title = { "$ne": "" }
            }
            
            const total = await cs.musicssheets.count({ ...filter }, { ignoreUndefined: true });
            const data = await cs.musicssheets.find({ ...filter }, { limit: Number(rows), skip: Number(first), sort: { title: 1 }, ignoreUndefined: true }).toArray();
            
            res.send({ total, data: data.map( ({ id, title }) => ({ id, title })) });
        }
    },
    'uploads': {
        post: async (req, res) => {           
            const pdfBuffer = await new Promise((resolve, reject) => {
                const doc = new PDFDocument({ autoFirstPage: false });
                const chunks = [];
                const stream = new PassThrough();
                stream.on('data', (chunk) => chunks.push(chunk));
                stream.on('end', () => resolve(Buffer.concat(chunks)));
                stream.on('error', (err) => reject(err));
                doc.pipe(stream);
    
                
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

                busboy.on('finish', () => doc.end());

                req.pipe(busboy);
            });

            console.log('PDF created');

            const formData = new FormData();
            formData.append('file', pdfBuffer, 'score.pdf'); // Attach the Buffer with a file name

            try {
                const result = await fetch('http://localhost:8096/uploads', {
                    method: 'POST',
                    body: formData,
                    headers: formData.getHeaders()
                });
    
                console.log(result.status);
                const json = await result.json();
                console.log(json);
                if ( result.ok ) {
                    /*await cs.musicssheets.insertOne({
                        uuid: id,
                        title: result.res.title,
                        filename
                    });*/
                    return;
                } 
            
                res.status(result.status).send(json);
            } catch( e ) {
                res.sendStatus(500);
            }
        }
    }
};