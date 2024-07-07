import { DataTypes } from '@sequelize/core';
import type { MigrationParams } from 'umzug';

export const up = async (uz: MigrationParams<any>) => {
	const qi = uz.context.sequelize.getQueryInterface();
	await qi.changeColumn('users', 'name', {
		type: DataTypes.STRING,
		allowNull: false
	});
	await qi.changeColumn('users', 'avatarURL', {
		type: DataTypes.STRING,
		allowNull: false
	});
	await qi.changeColumn('users', 'joinedDiscordAt', {
		type: DataTypes.INTEGER,
		allowNull: false
	});
};

export const down = async (uz: MigrationParams<any>) => {
	const qi = uz.context.sequelize.getQueryInterface();
	await qi.changeColumn('users', 'name', {
		type: DataTypes.STRING,
		allowNull: true
	});
	await qi.changeColumn('users', 'avatarURL', {
		type: DataTypes.STRING,
		allowNull: true
	});
	await qi.changeColumn('users', 'joinedDiscordAt', {
		type: DataTypes.INTEGER,
		allowNull: true
	});
};
