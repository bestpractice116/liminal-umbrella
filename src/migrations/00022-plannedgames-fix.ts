import type { MigrationParams } from 'umzug';

export const up = async (uz: MigrationParams<any>) => {
	const sq = uz.context.sequelize;
	const qi = uz.context.sequelize.getQueryInterface();
	await sq.transaction(async (transaction: any) => {
		await qi.removeColumn('plannedgames', 'deletedAt', { transaction });
	});
};

export const down = async (_uz: MigrationParams<any>) => {};
