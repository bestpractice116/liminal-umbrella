import { DataTypes } from '@sequelize/core';
import type { MigrationParams } from 'umzug';

export const up = async (uz: MigrationParams<any>) => {
    const sq = uz.context.sequelize;
    const qi = uz.context.sequelize.getQueryInterface();
    await sq.transaction(async (transaction: any) => {
        await qi.addColumn(
            'gamesessions',
            'name',
            {
                type: DataTypes.STRING,
                allowNull: false
            },
            { transaction }
        );
        await qi.addColumn(
            'gamesessions',
            'gamesystem',
            {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            { transaction }
        );
        await qi.addColumn(
            'gamesessions',
            'type',
            {
                type: DataTypes.STRING,
                allowNull: false
            },
            { transaction }
        );
        await qi.addColumn(
            'gamesessions',
            'starttime',
            {
                type: DataTypes.STRING,
                allowNull: false
            },
            { transaction }
        );
        await qi.addColumn(
            'gamesessions',
            'endtime',
            {
                type: DataTypes.STRING,
                allowNull: false
            },
            { transaction }
        );
        await qi.addColumn(
            'gamesessions',
            'maxplayers',
            {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            { transaction }
        );
        await qi.addColumn(
            'gamesessions',
            'signed_up_players',
            {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            { transaction }
        );
        await qi.addColumn(
            'gamesessions',
            'description',
            {
                type: DataTypes.STRING,
                allowNull: false
            },
            { transaction }
        );
        await qi.addColumn(
            'gamesessions',
            'location',
            {
                type: DataTypes.STRING,
                allowNull: false
            },
            { transaction }
        );
        await qi.removeColumn('plannedgames', 'signed_up_players', { transaction });
    });
};

export const down = async (uz: MigrationParams<any>) => {
    const sq = uz.context.sequelize;
    const qi = uz.context.sequelize.getQueryInterface();
    await sq.transaction(async (transaction: any) => {
        await qi.removeColumn('gamesessions', 'name', { transaction });
        await qi.removeColumn('gamesessions', 'gamesystem', { transaction });
        await qi.removeColumn('gamesessions', 'type', { transaction });
        await qi.removeColumn('gamesessions', 'starttime', { transaction });
        await qi.removeColumn('gamesessions', 'endtime', { transaction });
        await qi.removeColumn('gamesessions', 'maxplayers', { transaction });
        await qi.removeColumn('gamesessions', 'signed_up_players', { transaction });
        await qi.removeColumn('gamesessions', 'description', { transaction });
        await qi.removeColumn('gamesessions', 'location', { transaction });
        await qi.addColumn(
            'plannedgames',
            'signed_up_players',
            {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            { transaction }
        );
    });
};
