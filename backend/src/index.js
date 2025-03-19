import express from 'express';
import fs from 'fs';
import https from 'https';
import cors from 'cors';
import { init } from './init.js';
import musicssheetsapi from './musicssheets/api.js';

const apis = {
    public: {
        ...musicssheetsapi
    }
}

// init app
init();

// init middlewares
const app = express();
app.use(express.json());
app.use(cors());

// init endpoints
const defaultPath = '/api/';

Object.keys(apis.public).forEach( path => {
    Object.keys(apis.public[path]).forEach( method => {
        app[method](`${defaultPath}${path}`, apis.public[path][method]);
        console.log(`Endpoint ${method.toUpperCase()} ${defaultPath}${path} initialized`);
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});


// Start the Express server
const port = 3010;
let server = null;
try {
    const privateKey = fs.readFileSync('certs/live/mymovies.freeboxos.fr/privkey.pem');
    const certificate = fs.readFileSync('certs/live/mymovies.freeboxos.fr/cert.pem');

    server = https.createServer({ key: privateKey, cert: certificate }, app);
    server.listen(port, () => {
        console.log(`Https server listening on port ${port}`);
    });    
} catch( e ) {
    server = app.listen(port, () => {
        console.log(`Http server listening on port ${port}`);
    });
}