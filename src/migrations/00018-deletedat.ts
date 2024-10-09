import type { MigrationParams } from 'umzug';
import { DataTypes } from '@sequelize/core';

export const up = async (uz: MigrationParams<any>) => {
    const sq = uz.context.sequelize;
    const qi = uz.context.sequelize.getQueryInterface();
    await sq.transaction(async (transaction: any) => {
        await qi.addColumn(
            'activities',
            'deletedAt',
            {
                type: DataTypes.STRING,
                allowNull: true
            },
            { transaction }
        );
        await qi.addColumn(
            'gamesessions',
            'deletedAt',
            {
                type: DataTypes.STRING,
                allowNull: true
            },
            { transaction }
        );
        await qi.addColumn(
            'gamesystems',
            'deletedAt',
            {
                type: DataTypes.STRING,
                allowNull: true
            },
            { transaction }
        );
        await qi.addColumn(
            'plannedgames',
            'deletedAt',
            {
                type: DataTypes.STRING,
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
        await qi.dropColumn('activities', 'deletedAt', { transaction });
        await qi.dropColumn('gamesessions', 'deletedAt', { transaction });
        await qi.dropColumn('gamesystems', 'deletedAt', { transaction });
        await qi.dropColumn('plannedgames', 'deletedAt', { transaction });
    });
};
