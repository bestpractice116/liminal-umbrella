import { DataTypes } from '@sequelize/core';
import type { MigrationParams } from 'umzug';
//import { Message } from '../lib/database/model.js';

export const up = async (uz: MigrationParams<any>) => {
    const sq = uz.context.sequelize;
    const qi = uz.context.sequelize.getQueryInterface();
    await sq.transaction(async (transaction: any) => {
        await qi.removeColumn('messages', 'pinned', { transaction });
        await qi.addColumn(
            'messages',
            'pinned',
            {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            { transaction }
        );
    });
};

export const down = async (uz: MigrationParams<any>) => {
    const qi = uz.context.sequelize.getQueryInterface();
    await qi.removeColumn('messages', 'pinned');
};
