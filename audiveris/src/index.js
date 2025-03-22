import express from 'express';
import fs from 'fs';
import cors from 'cors';
import { exec } from 'child_process';
import Busboy from 'busboy';
import { v4 as uuid } from 'uuid';
import path from 'path';

// init middlewares
const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('Hello World!');
});

const inputPath = '/data/inputs';

const execAudiveris = async(id, count) => {
    console.log('[REST-API] execAudiveris');
    const command = `sh -c "/audiveris-extract/bin/Audiveris -batch -export -output /data/outputs/${id}/temp $(ls ${inputPath}/${id}/*.jpg ${inputPath}/${id}/*.png)"`;
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error}`);
                reject(error);
                return;
            }
            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);
            for ( let i = 0; i < count; i++ ) {
                fs.renameSync(`/data/outputs/${id}/temp/${i}.mxl`, `/data/outputs/${id}/${i}.mxl`);
            }
            fs.rmSync(`/data/outputs/${id}/temp`, { recursive: true });
            resolve();
        });
    });
}

app.post('/uploads', async (req, res) => {
    const id = uuid();
    const inPath = `${inputPath}/${id}`;
    fs.mkdirSync(inPath);

    console.log('[REST-API] request', req.headers);
    const busboy = Busboy({ headers: req.headers });
    console.log('[REST-API] Uploading files...');

    try {
        const count = await new Promise((resolve, reject) => {
            let index = 0;
            busboy.on('file', (fieldname, file, item, encoding, mimetype) => {
                const fileExtension = path.extname(item.filename);
                const buffer = [];
                file.on('data', data => buffer.push(data));
                file.on('end', () => fs.writeFileSync(`${inPath}/${index}${fileExtension}`, Buffer.concat(buffer)));
            });

            busboy.on('finish', () => resolve(index+1));

            req.pipe(busboy);
        });

        await execAudiveris(id, count);

        fs.rmSync(inPath, { recursive: true });

        res.status(200).send({ id, items: [...Array(count)].map((_, i) => `${i}.mxl`) });
    } catch(err) {
        res.status(500).send({ error: err }); 
    }
});


// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Start the Express server
const port = 3015;
app.listen(port, () => {
    console.log(`Http server listening on port ${port}`);
});