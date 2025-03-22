import express from 'express';
import fs from 'fs';
import cors from 'cors';
import { exec } from 'child_process';
import Busboy from 'busboy';
import { v4 as uuid } from 'uuid';

// init middlewares
const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('Hello World!');
});

const execAudiveris = async(inputPath) => {
    console.log('[REST-API] execAudiveris', inputPath);
    const command = `sh -c "/audiveris-extract/bin/Audiveris -batch -export -output /data/outputs ${inputPath}"`;
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
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
}

app.post('/uploads', async (req, res) => {
    const id = uuid();
    const inputPath = `/data/inputs/${id}.pdf`;

    console.log('[REST-API] request', req.headers);
    const busboy = Busboy({ headers: req.headers });
    console.log('[REST-API] Uploading file...');

    try {
        await new Promise((resolve, reject) => {
            busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
                const buffer = [];
                file.on('data', data => buffer.push(data));
                file.on('end', () => fs.writeFileSync(inputPath, Buffer.concat(buffer)));
            });

            busboy.on('finish', () => resolve());

            req.pipe(busboy);
        });

        await execAudiveris(inputPath);

        res.status(200).send({ id });
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