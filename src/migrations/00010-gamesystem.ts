import { DataTypes } from '@sequelize/core';
import type { MigrationParams } from 'umzug';
import { PlannedGame } from '../lib/database/model.js';

export const up = async (uz: MigrationParams<any>) => {
	const sq = uz.context.sequelize;
	const qi = uz.context.sequelize.getQueryInterface();
	await sq.transaction(async (transaction: any) => {
		await qi.dropTable('gamesystems');
		await qi.createTable(
			'gamesystems',
			{
				key: {
					type: DataTypes.INTEGER,
					allowNull: false,
					primaryKey: true,
					autoIncrement: true
				},
				name: {
					type: DataTypes.TEXT,
					allowNull: false
				},
				description: {
					type: DataTypes.TEXT,
					allowNull: false
				},
				createdAt: {
					type: DataTypes.TEXT,
					allowNull: false
				},
				updatedAt: {
					type: DataTypes.TEXT,
					allowNull: false
				}
			},
			{ transaction }
		);
		await qi.addIndex(
			'gamesystems',
			{
				name: 'gamesystems_name_unique',
				fields: ['name'],
				unique: true
			},
			{ transaction }
		);
		await qi.bulkInsert(
			'gamesystems',
			[
				{
					name: 'dnd5e',
					description: 'DnD 5e',
					createdAt: new Date(),
					updatedAt: new Date()
				},
				{
					name: 'dnd3e',
					description: 'DnD 3e',
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
					name: 'knave2e',
					description: 'Knave 2e (DnD 1e OSR)',
					createdAt: new Date(),
					updatedAt: new Date()
				},
				{
					name: 'dcc',
					description: 'Dungeon Crawl Classics (DnD 1e OSR)',
					createdAt: new Date(),
					updatedAt: new Date()
				},
				{
					name: 'alien',
					description: 'Alien RPG (Year Zero)',
					createdAt: new Date(),
					updatedAt: new Date()
				},
				{
					name: 'coriolis',
					description: 'Coriolis (Year Zero)',
					createdAt: new Date(),
					updatedAt: new Date()
				},
				{
					name: 'forvbiden-lands',
					description: 'Forbidden Lands (Year Zero)',
					createdAt: new Date(),
					updatedAt: new Date()
				},
				{
					name: 'fallout',
					description: 'Fallout RPG',
					createdAt: new Date(),
					updatedAt: new Date()
				},
				{
					name: 'cthulu',
					description: 'Call of Cthulhu',
					createdAt: new Date(),
					updatedAt: new Date()
				},
				{
					name: 'delta-green',
					description: 'Delta Green',
					createdAt: new Date(),
					updatedAt: new Date()
				},
				{
					name: 'whitehack',
					description: 'Whitehack',
					createdAt: new Date(),
					updatedAt: new Date()
				},
				{
					name: 'vtm',
					description: 'Vampire: The Masquerade (World of Darkness)',
					createdAt: new Date(),
					updatedAt: new Date()
				},
				{
					name: 'mausritter',
					description: 'Mausritter',
					createdAt: new Date(),
					updatedAt: new Date()
				},
				{
					name: 'other-d6',
					description: 'Other d6',
					createdAt: new Date(),
					updatedAt: new Date()
				}
			],
			{ transaction }
		);
		for (const i of await PlannedGame.findAll()) {
			await i.destroy();
		}
		await qi.removeColumn('plannedgames', 'system', { transaction });
		await qi.addColumn(
			'plannedgames',
			'system',
			{
				type: DataTypes.INTEGER,
				allowNull: true
			},
			{ transaction }
		);
		for (const i of await PlannedGame.findAll()) {
			i.set('system', 0);
			await i.save();
		}
		await qi.changeColumn(
			'plannedgames',
			'system',
			{
				allowNull: false
			},
			{ transaction }
		);
	});
};

export const down = async (uz: MigrationParams<any>) => {
	const qi = uz.context.sequelize.getQueryInterface();
	await qi.dropTable('gamesystems');
};
