import { DataTypes } from '@sequelize/core';
import type { MigrationParams } from 'umzug';

export const up = async (uz: MigrationParams<any>) => {
	const sq = uz.context.sequelize;
	const qi = uz.context.sequelize.getQueryInterface();
	await sq.transaction(async (transaction: any) => {
		await qi.addColumn(
			'gamesessions',
			'gameListingsMessageCleanedup',
			{
				type: DataTypes.BOOLEAN,
				allowNull: true
			},
			{ transaction }
		);
		await qi.addColumn(
			'gamesessions',
			'channelCleanedup',
			{
				type: DataTypes.BOOLEAN,
				allowNull: true
			},
			{ transaction }
		);
		await sq.query('UPDATE gamesessions SET gameListingsMessageCleanedup = false, channelCleanedup = false', { raw: true, transaction });
		await qi.changeColumn(
			'gamesessions',
			'channelCleanedup',
			{
				allowNull: false
			},
			{ transaction }
		);
		await qi.changeColumn(
			'gamesessions',
			'gameListingsMessageCleanedup',
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
		await qi.removeColumn('gamesessions', 'channelCleanedup', { transaction });
		await qi.removeColumn('gamesessions', 'gameListingsMessageCleanedup', { transaction });
	});
};
