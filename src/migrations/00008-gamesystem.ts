import { DataTypes } from '@sequelize/core';
import type { MigrationParams } from 'umzug';

export const up = async (uz: MigrationParams<any>) => {
    const qi = uz.context.sequelize.getQueryInterface();
    await qi.createTable('gamesystems', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        createdAt: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		updatedAt: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
    });
    await qi.addIndex('gamesystems', {
        name: 'gamesystems_name_unique',
        fields: ['name'],
        unique: true,
    });
    await qi.bulkInsert('gamesystems', [
        {
            name: 'dnd5e',
            description: 'DnD 5e',
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            name: 'pathfinder',
            description: 'Pathfinder 2e',
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            name: 'alien',
            description: 'Alien',
            createdAt: new Date(),
            updatedAt: new Date()
        },
    ]);
};

export const down = async (uz: MigrationParams<any>) => {
    const qi = uz.context.sequelize.getQueryInterface()
    await qi.dropTable('gamesystems');
};
