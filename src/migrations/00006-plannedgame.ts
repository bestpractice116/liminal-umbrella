import { DataTypes } from '@sequelize/core';
import type { MigrationParams } from 'umzug';

export const up = async (uz: MigrationParams<any>) => {
	const qi = uz.context.sequelize.getQueryInterface();
	/*
	CREATE TABLE `Channels` (
		`id` TEXT NOT NULL PRIMARY KEY,
		`name` TEXT NOT NULL,
		`type` TEXT NOT NULL,
		`parentId` TEXT,
		`position` INTEGER NOT NULL,
		`rawPosition` INTEGER NOT NULL,
		`createdTimestamp` INTEGER NOT NULL,
		`createdAt` TEXT NOT NULL,
		`updatedAt` TEXT NOT NULL);
	*/
	await qi.createTable('plannedgames', {
		id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true,
            autoIncrement: true,
		},
		owner: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		name: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		system: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		datetime: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		max_players: {
			type: DataTypes.INTEGER,
			allowNull: true,
		},
		description: {
			type: DataTypes.STRING,
			allowNull: true,
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
    await qi.addIndex('plannedgames', {
        name: 'planned_games_owner_unique',
        fields: ['owner'],
        unique: true,
    });
};

export const down = async (uz: MigrationParams<any>) => {
	const qi = uz.context.sequelize.getQueryInterface()
	await qi.dropTable('plannedgames');
};
