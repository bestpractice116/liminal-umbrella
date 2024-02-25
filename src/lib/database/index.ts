
import { Sequelize, importModels } from '@sequelize/core';
import * as path from 'path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const db = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    // SQLite only
    storage: path.join(__dirname, '..', '..', 'database.sqlite'),
    models: await importModels(__dirname + '/model/*.{ts,js}'),
});
