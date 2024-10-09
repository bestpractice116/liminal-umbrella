import { DataTypes } from '@sequelize/core';
import type { MigrationParams } from 'umzug';
//import { Message } from '../lib/database/model.js';

export const up = async (uz: MigrationParams<any>) => {
    const sq = uz.context.sequelize;
    const qi = uz.context.sequelize.getQueryInterface();
    await sq.transaction(async (transaction: any) => {
        await qi.removeColumn('users', 'name', { transaction });
        await qi.removeColumn('users', 'avatarURL', { transaction });
        await qi.removeColumn('users', 'joinedDiscordAt', { transaction });
        await qi.addColumn(
            'users',
            'name',
            {
                type: DataTypes.STRING,
                allowNull: true
            },
            { transaction }
        );
        await qi.addColumn(
            'users',
            'avatarURL',
            {
                type: DataTypes.STRING,
                allowNull: true
            },
            { transaction }
        );
        await qi.addColumn(
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

export const down = async (uz: MigrationParams<any>) => {
    const sq = uz.context.sequelize;
    const qi = uz.context.sequelize.getQueryInterface();
    await sq.transaction(async (transaction: any) => {
        await qi.removeColumn('users', 'name', { transaction });
        await qi.removeColumn('users', 'avatarURL', { transaction });
        await qi.removeColumn('users', 'joinedDiscordAt', { transaction });
    });
};
