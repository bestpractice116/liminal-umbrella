import { DataTypes } from '@sequelize/core';
import type { MigrationParams } from 'umzug';

export const up = async (uz: MigrationParams<any>) => {
	const sq = uz.context.sequelize;
	const qi = uz.context.sequelize.getQueryInterface();
	await sq.transaction(async (transaction: any) => {
		await sq.query('DELETE FROM plannedgames', { raw: true, transaction });
		await sq.query('DELETE FROM gamesessionusersignups', { raw: true, transaction });
		await sq.query('DELETE FROM gamesessions', { raw: true, transaction });
		await sq.query('DELETE FROM gamesystems', { raw: true, transaction });
		await qi.addColumn(
			'gamesessions',
			'channel_cleanedup',
			{
				type: DataTypes.BOOLEAN,
				allowNull: true
			},
			{ transaction }
		);
		await qi.addColumn(
			'gamesessions',
			'game_listings_message_cleanedup',
			{
				type: DataTypes.BOOLEAN,
				allowNull: true
			},
			{ transaction }
		);
		await sq.query('UPDATE gamesessions SET game_listings_message_cleanedup = false, channel_cleanedup = false', { raw: true, transaction });
		await qi.changeColumn(
			'gamesessions',
			'channel_cleanedup',
			{
				allowNull: false
			},
			{ transaction }
		);
		await qi.changeColumn(
			'gamesessions',
			'game_listings_message_cleanedup',
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
		await qi.removeColumn('gamesessions', 'channel_cleanedup', { transaction });
		await qi.removeColumn('gamesessions', 'game_listings_message_cleanedup', { transaction });
	});
};
