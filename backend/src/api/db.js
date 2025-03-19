import dbMapping from './db_mapping.json' with { type: 'json' };
import { MongoClient } from 'mongodb';
import { getEnv } from './env.js';

let db = null;

const getDb = async () => {
    const host = getEnv().dbHost || 'musicssheets';
    const url = `mongodb://${host}:27017`; 
    const dbName = 'musicssheets';
    const client = new MongoClient(url);
    
    try {
        await client.connect();
        return client.db(dbName);       
    } catch (error) {
        console.error('Error:', error);
    }
}

const dbCollection = async ( collec ) => {
    if ( !db ) {
        db = await getDb();
    }
        
    return db.collection(collec);
}

export const cs = {};
export const init = async () => {
    for ( const k in dbMapping ) {
        console.log('init ', k)
        cs[k] = await dbCollection(dbMapping[k]);
    }
}

export default { init, cs };