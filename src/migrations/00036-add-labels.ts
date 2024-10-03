import type { MigrationParams } from 'umzug';

const data = [
	['LABEL_POST_GAME_NAME', 'Name'],
	['LABEL_POST_GAME_DATE', 'Date'],
	['LABEL_POST_GAME_START_TIME', 'Start Time'],
	['LABEL_POST_GAME_END_TIME', 'End Time'],
	['LABEL_POST_GAME_LOCATION', 'Location'],
	['LABEL_POST_GAME_DESCRIPTION', 'Description'],
	['LABEL_POST_GAME_MAX_PLAYERS', 'Max Players']
];

const clean = (uz: MigrationParams<any>, transaction: any) => {
	const qi = uz.context.sequelize.getQueryInterface();
	return qi.bulkDelete('botmessages', { name: data.map(([name, _value]) => name) }, { transaction });
};

export const up = async (uz: MigrationParams<any>) => {
	const sq = uz.context.sequelize;
	const qi = uz.context.sequelize.getQueryInterface();
	await sq.transaction(async (transaction: any) => {
		await clean(uz, transaction);
		await qi.bulkInsert(
			'botmessages',
			data.map(([name, value]) => {
				return {
					name,
					value,
					createdAt: new Date(),
					updatedAt: new Date()
				};
			}),
			{ transaction }
		);
	});
};

export const down = async (uz: MigrationParams<any>) => {
	const sq = uz.context.sequelize;
	await sq.transaction(async (transaction: any) => {
		await clean(uz, transaction);
	});
};
