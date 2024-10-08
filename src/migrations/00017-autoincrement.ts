import type { MigrationParams } from 'umzug';

export const up = async (uz: MigrationParams<any>) => {
	const sq = uz.context.sequelize;
	const qi = uz.context.sequelize.getQueryInterface();
	await sq.transaction(async (transaction: any) => {
		await qi.changeColumn('plannedgames', 'key', { autoIncrement: false }, { transaction });
		await qi.changeColumn('activities', 'key', { autoIncrement: false }, { transaction });
		await qi.changeColumn('gamesystems', 'key', { autoIncrement: false }, { transaction });
		await qi.changeColumn('botmessages', 'key', { autoIncrement: false }, { transaction });
	});
};

export const down = async (uz: MigrationParams<any>) => {
	const sq = uz.context.sequelize;
	const qi = uz.context.sequelize.getQueryInterface();
	await sq.transaction(async (transaction: any) => {
		await qi.changeColumn('plannedgames', 'key', { autoIncrement: true }, { transaction });
		await qi.changeColumn('activities', 'key', { autoIncrement: true }, { transaction });
		await qi.changeColumn('gamesystems', 'key', { autoIncrement: true }, { transaction });
		await qi.changeColumn('botmessages', 'key', { autoIncrement: true }, { transaction });
	});
};
