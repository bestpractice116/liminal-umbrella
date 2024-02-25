
import { Sequelize, DataTypes, Model, InferAttributes, InferCreationAttributes } from 'sequelize';
import * as path from 'path';

export const db = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    // SQLite only
    storage: path.join(__dirname, '..', '..', 'database.sqlite'),
});

interface UserModel extends Model<InferAttributes<UserModel>, InferCreationAttributes<UserModel>> {
    // Some fields are optional when calling UserModel.create() or UserModel.build()
    id: string;
    username: string;
    rulesaccepted: boolean;
    left: boolean;
  }

export const User = db.define<UserModel>('User', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        unique: true,
        validate: {
            isInt: true,
        },
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
    rulesaccepted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    left: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
});

export async function activeUsersMap() : Promise<Map<string, UserModel>> {
    const out = new Map();
    for (const user of await User.findAll({where: {left: false}})) {
        out.set(user.id, user);
    }
    return out;
}

export async function syncDb() : Promise<void> {
    await User.sync();
}