import db from './api/db.js';

export const init = async () => {
    await db.init();
};