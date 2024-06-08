
import { DataTypes, Model, InferAttributes, InferCreationAttributes } from '@sequelize/core';
import { Attribute, NotNull, Unique, PrimaryKey } from '@sequelize/core/decorators-legacy';
import {
    StringSelectMenuBuilder, StringSelectMenuOptionBuilder,
} from 'discord.js';

export default class GameSystem extends Model<InferAttributes<GameSystem>, InferCreationAttributes<GameSystem>> {
    @Attribute(DataTypes.STRING)
    @NotNull
    @PrimaryKey
    declare id: string;

    @Attribute(DataTypes.STRING)
    @Unique
    @NotNull
    declare name: string;

    @Attribute(DataTypes.STRING)
    @NotNull
    declare description: string;

    static async addGameSystemOptions(menu: StringSelectMenuBuilder) {
        await this.findAll().then(gameSystemRows => {
            const options = gameSystemRows.map((gameSystemRow) => {
                return new StringSelectMenuOptionBuilder()
                    .setLabel(gameSystemRow.name)
                    .setDescription(gameSystemRow.description)
                    .setValue(gameSystemRow.name);
            })
            menu.addOptions(options);
        });
    }
}

