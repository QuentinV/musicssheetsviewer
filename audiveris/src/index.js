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

const execAudiveris = async(id, files) => {
    console.log('[REST-API] execAudiveris');
    fs.writeFileSync(
        `${inputPath}/${id}/playlist.xml`, 
        `<play-list>
${files.map((f, i) => 
`<excerpt>
    <path>${f}</path>
    <sheets-selection>${i+1}</sheets-selection>
</excerpt>`).join('\r\n')}
</play-list>               
        `, { encoding: 'utf-8' });

    await new Promise((resolve, reject) => {
        exec(`sh -c "/audiveris-extract/bin/Audiveris -batch -playlist ${inputPath}/${id}/playlist.xml"`, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error}`);
                reject(error);
                return;
            }
            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);
            resolve();
        });
    });
    await new Promise((resolve, reject) => {
        exec(`sh -c "/audiveris-extract/bin/Audiveris -batch -export ${inputPath}/${id}/playlist.omr"`, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error}`);
                reject(error);
                return;
            }
            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);
            resolve();
        });
    });
    fs.copyFileSync(`${inputPath}/${id}/playlist.mxl`, `/data/outputs/${id}.mxl`);
}

app.post('/uploads', async (req, res) => {
    const id = uuid();
    const inPath = `${inputPath}/${id}`;
    fs.mkdirSync(inPath);

    console.log('[REST-API] request', req.headers);
    const busboy = Busboy({ headers: req.headers });
    console.log('[REST-API] Uploading files...');

    try {
        const files = await new Promise((resolve, reject) => {
            let index = 0;
            const files = [];
            busboy.on('file', (fieldname, file, item, encoding, mimetype) => {
                const fileExtension = path.extname(item.filename);
                const buffer = [];
                file.on('data', data => buffer.push(data));
                file.on('end', () => {
                    const p = `${inPath}/${index}${fileExtension}`;
                    fs.writeFileSync(p, Buffer.concat(buffer));
                    files.push(p);
                    index++;
                });
            });

            busboy.on('finish', () => resolve(files));

            req.pipe(busboy);
        });

        await execAudiveris(id, files);

        console.log('[REST-API] Remove temporary files...');
        fs.rmSync(inPath, { recursive: true });

        res.status(200).send({ id });
    } catch(err) {
        console.log('[REST-API] Send error...');
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