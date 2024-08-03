import type { MigrationParams } from 'umzug';

export const up = async (uz: MigrationParams<any>) => {
	const sq = uz.context.sequelize;
	const qi = uz.context.sequelize.getQueryInterface();
	await sq.transaction(async (transaction: any) => {
		await qi.removeIndex(
			'gamesessionusersignups', 'game_session_user_signups_user_key'
		);
		await qi.addIndex(
			'gamesessionusersignups',
			{
				name: 'game_session_user_signups_user_key',
				fields: ['userKey'],
			},
			{ transaction }
		);
	});
};

export const down = async (_uz: MigrationParams<any>) => {
};
