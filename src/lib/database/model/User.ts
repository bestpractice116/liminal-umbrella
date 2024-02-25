import { DataTypes, Model, InferAttributes, InferCreationAttributes } from '@sequelize/core';
import { Attribute, PrimaryKey, NotNull  } from '@sequelize/core/decorators-legacy';

export default class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
    @Attribute(DataTypes.STRING)
    @PrimaryKey
    @NotNull
    declare id: string;

    @Attribute(DataTypes.STRING)
    @NotNull
    declare username: string;

    @Attribute(DataTypes.BOOLEAN)
    @NotNull
    declare rulesaccepted: boolean;

    @Attribute(DataTypes.BOOLEAN)
    @NotNull
    declare left: boolean;

    static async activeUsersMap() : Promise<Map<string, User>> {
        const out = new Map();
        for (const user of await this.findAll({where: {left: false}})) {
            out.set(user.id, user);
        }
        return out;
    }
}