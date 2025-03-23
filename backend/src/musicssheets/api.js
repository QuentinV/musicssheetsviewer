import { cs } from '../api/db.js';
import Busboy from 'busboy';
import FormData from 'form-data';
import fetch from 'node-fetch';
import fs from 'fs';
import { getEnv } from '../api/env.js';
import { extractScoreInfo } from './service.js';

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
            
            res.send({ total, data: data.map( ({ uuid, title }) => ({ uuid, title })) });
        }
    },
    'sheets/:id/book.mxl': {
        get: async (req, res) => {
            const { id } = req.params;
            
            const data = await cs.musicssheets.findOne({ uuid: id });
            if ( !data ) {
                res.sendStatus(404);
                return;
            }
            
            const pathFile = `../data/${id}.mxl`;
            if ( fs.existsSync(pathFile) ) {
                const size = fs.statSync(pathFile).size;
                res.setHeader('Content-Length', size);

                const fileStream = fs.createReadStream(pathFile);
                fileStream.pipe(res);

                res.setHeader('Content-Disposition', `attachment; filename="${id}.mxl"`);
                res.setHeader('Content-Type', 'application/vnd.recordare.musicxml');

                return;
            }
            
            res.sendStatus(404);
        }
    },
    'sheets/:id': {
        get: async (req, res) => {
            const { id } = req.params;
            const name = await extractScoreName(`../data/${id}.mxl`);
            res.send({ title: name });
        }
    },
    'uploads': {
        post: async (req, res) => {   
            const formData = new FormData();

            await new Promise((resolve, reject) => {      
                const busboy = Busboy({ headers: req.headers });
                busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
                    let buffer = [];
                    file.on('data', data => buffer.push(data));

                    file.on('end', () => {
                        const completeBuffer = Buffer.concat(buffer);
                        formData.append('file', completeBuffer, filename);
                    });
                });

                busboy.on('finish', () => resolve());

                req.pipe(busboy);
            });

            try {
                const result = await fetch(`${getEnv().audiverisHost}/uploads`, {
                    method: 'POST',
                    body: formData,
                    headers: formData.getHeaders()
                });
    
                const json = await result.json();
                if ( result.ok ) {
                    const info = await extractScoreInfo(`../data/${json.id}.mxl`);
                   
                    await cs.musicssheets.insertOne({
                        uuid: json.id,
                        ...info
                    });

                    res.status(200).send({ id: json.id });
                } else {
                    res.status(500).send({ error: json.error });
                }
            } catch( e ) {
                console.error(e);
                res.sendStatus(500);
            }
        }
    }
};