import { DataTypes } from '@sequelize/core';
import type { MigrationParams } from 'umzug';

export const up = async (uz: MigrationParams<any>) => {
    const sq = uz.context.sequelize;
    const qi = uz.context.sequelize.getQueryInterface();
    await sq.transaction(async (transaction: any) => {
        await qi.addColumn(
            'users',
            'kicked',
            {
                type: DataTypes.BOOLEAN,
                allowNull: true
            },
            { transaction }
        );
        await sq.query('UPDATE users SET kicked = false', { raw: true, transaction });
        await qi.changeColumn(
            'users',
            'kicked',
            {
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
        await qi.removeColumn('users', 'kicked', { transaction });
    });
};
