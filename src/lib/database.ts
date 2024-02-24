
import { Sequelize, DataTypes } from 'sequelize';
import * as path from 'path';

export const db = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    // SQLite only
    storage: path.join(__dirname, '..', '..', 'database.sqlite'),
});

export const User = db.define('User', {
    username: DataTypes.STRING,
    birthday: DataTypes.DATE,
});

export function syncDb() : void {
    User.sync();
}