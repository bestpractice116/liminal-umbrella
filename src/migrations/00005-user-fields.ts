import { DataTypes } from '@sequelize/core';
import type { MigrationParams } from 'umzug';

export const up = async (uz: MigrationParams<any>) => {
    const sq = uz.context.sequelize;
    const qi = uz.context.sequelize.getQueryInterface();
    await sq.transaction(async (transaction: any) => {
        await qi.changeColumn(
            'users',
            'name',
            {
                type: DataTypes.STRING,
                allowNull: false
            },
            { transaction }
        );
        await qi.changeColumn(
            'users',
            'avatarURL',
            {
                type: DataTypes.STRING,
                allowNull: false
            },
            { transaction }
        );
        await qi.changeColumn(
            'users',
            'joinedDiscordAt',
            {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            { transaction }
        );
    });
};

export const down = async (uz: MigrationParams<any>) => {
    const sq = uz.context.sequelize;
    const qi = uz.context.sequelize.getQueryInterface();
    await sq.transaction(async (transaction: any) => {
        await qi.changeColumn(
            'users',
            'name',
            {
                type: DataTypes.STRING,
                allowNull: true
            },
            { transaction }
        );
        await qi.changeColumn(
            'users',
            'avatarURL',
            {
                type: DataTypes.STRING,
                allowNull: true
            },
            { transaction }
        );
        await qi.changeColumn(
            'users',
            'joinedDiscordAt',
            {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            { transaction }
        );
    });
};
