import { DataTypes } from '@sequelize/core';
//import type { Migration } from '../umzug';

export const up = async (foo: any) => {
	await foo.context.sequelize.getQueryInterface().createTable('users', {
		id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	});
};

export const down = async (foo: any) => {
	await foo.context.sequelize.getQueryInterface().dropTable('users');
};