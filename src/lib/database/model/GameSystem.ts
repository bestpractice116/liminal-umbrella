import { DataTypes, Model, InferAttributes, InferCreationAttributes, NonAttribute, CreationOptional } from '@sequelize/core';
import { Attribute, NotNull, Unique, PrimaryKey, AutoIncrement, HasMany, DeletedAt } from '@sequelize/core/decorators-legacy';
import { StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';
import PlannedGame from './PlannedGame.js';
import Campaign from './Campaign.js';

export default class GameSystem extends Model<InferAttributes<GameSystem>, InferCreationAttributes<GameSystem>> {
    @Attribute(DataTypes.INTEGER)
    @PrimaryKey
    @AutoIncrement
    declare key: CreationOptional<number>;

    @Attribute(DataTypes.STRING)
    @Unique
    @NotNull
    declare name: string;

    @Attribute(DataTypes.STRING)
    @NotNull
    declare description: string;

    @Attribute(DataTypes.STRING)
    @NotNull
    declare tag: string;

    @DeletedAt
    declare deletedAt: Date | null;

    @HasMany(() => PlannedGame, {
        foreignKey: 'gamesystem',
        inverse: {
            as: 'gamesystemOb'
        }
    })
    declare plannedgames?: NonAttribute<PlannedGame[]>;

    static async addGameSystemOptions(menu: StringSelectMenuBuilder) {
        await this.findAll().then((gameSystemRows) => {
            const options = gameSystemRows.map((gameSystemRow) => {
                return new StringSelectMenuOptionBuilder()
                    .setLabel(gameSystemRow.name)
                    .setDescription(gameSystemRow.description)
                    .setValue(gameSystemRow.name);
            });
            menu.addOptions(options);
        });
    }

    @HasMany(() => Campaign, {
        foreignKey: 'gamesystemKey'
    })
    declare campaigns?: NonAttribute<PlannedGame>;
}
