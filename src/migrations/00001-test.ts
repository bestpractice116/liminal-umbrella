import { DataTypes } from '@sequelize/core';
import type { MigrationParams } from 'umzug';

export const up = async (uz: MigrationParams<any>) => {
	/*\
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
	await uz.context.sequelize.getQueryInterface().createTable('channels', {
		id: {
			type: DataTypes.TEXT,
			allowNull: false,
			primaryKey: true,
		},
		name: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		type: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		parentId: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		position: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		rawPosition: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		createdTimestamp: {
			type: DataTypes.INTEGER,
			allowNull: false,
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
	/*
	CREATE TABLE `Messages` (
		`id` TEXT NOT NULL PRIMARY KEY,
		`authorId` TEXT NOT NULL,
		`channelId` TEXT NOT NULL,
		`applicationId` TEXT NOT NULL,
		`type` TEXT NOT NULL,
		`content` TEXT NOT NULL,
		`createdTimestamp` INTEGER NOT NULL,
		`editedTimestamp` INTEGER,
		`hasThread` INTEGER NOT NULL,
		`threadId` TEXT,
		`embedCount` INTEGER NOT NULL,
		`pinned` INTEGER NOT NULL,
		`createdAt` TEXT NOT NULL,
		`updatedAt` TEXT NOT NULL);
	*/
	await uz.context.sequelize.getQueryInterface().createTable('messages', {
		id: {
			type: DataTypes.TEXT,
			allowNull: false,
			primaryKey: true,
		},
		authorId: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		channelId: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		applicationId: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		type: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		content: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		createdTimestamp: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		editedTimestamp: {
			type: DataTypes.INTEGER,
			allowNull: true,
		},
		hasThread: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		threadId: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		embedcount: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		pinned: {
			type: DataTypes.INTEGER,
			allowNull: false,
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
	/*
	CREATE TABLE `GameSessions` (
		`id` TEXT NOT NULL PRIMARY KEY,
		`availableGamesMessageId` TEXT REFERENCES `Channels` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
		`eventId` TEXT,
		`channelId` TEXT REFERENCES `Messages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
		`createdAt` TEXT NOT NULL,
		`updatedAt` TEXT NOT NULL);
	*/
	await uz.context.sequelize.getQueryInterface().createTable('gamesessions', {
		id: {
			type: DataTypes.TEXT,
			allowNull: false,
			primaryKey: true,
		},
		availableGamesMessageId: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		eventId: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		channelId: {
			type: DataTypes.TEXT,
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
	/*
	CREATE TABLE `GreetingMessages` (`
		`messageId` TEXT NOT NULL PRIMARY KEY,
		`userId` TEXT NOT NULL,
		`createdAt` TEXT NOT NULL,
		`updatedAt` TEXT NOT NULL);
	*/
	await uz.context.sequelize.getQueryInterface().createTable('greetingmessages', {
		messageId: {
			type: DataTypes.TEXT,
			allowNull: false,
			primaryKey: true,
		},
		userId: {
			type: DataTypes.TEXT,
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
	/*
	CREATE TABLE `Roles` (
		`id` TEXT NOT NULL PRIMARY KEY,
		`name` TEXT NOT NULL,
		`mentionable` INTEGER NOT NULL,\
		`tags` TEXT NOT NULL,
		`position` INTEGER NOT NULL,
		`rawPosition` INTEGER NOT NULL,
		`hexColor` TEXT NOT NULL,
		`unicodeEmoji` TEXT NOT NULL,
		`permissions` TEXT NOT NULL,
		`createdAt` TEXT NOT NULL,
		`updatedAt` TEXT NOT NULL);
	*/
	await uz.context.sequelize.getQueryInterface().createTable('roles', {
		id: {
			type: DataTypes.TEXT,
			allowNull: false,
			primaryKey: true,
		},
		name: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		mentionable: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		tags: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		position: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
	    rawPosition: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		hexcolor: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		unicodeemoji: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		permissions: {
			type: DataTypes.TEXT,
			allowNull: false,
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
	/*
	CREATE TABLE `Users` (
		`id` TEXT NOT NULL PRIMARY KEY,\
		`username` TEXT NOT NULL,
		`nickname` TEXT NOT NULL,
		`rulesaccepted` INTEGER NOT NULL,
		`left` INTEGER NOT NULL,
		`createdAt` TEXT NOT NULL,
		`updatedAt` TEXT NOT NULL);
	*/
	await uz.context.sequelize.getQueryInterface().createTable('users', {
		id: {
			type: DataTypes.TEXT,
			allowNull: false,
			primaryKey: true,
		},
		username: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		nickname: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		rulesaccepted: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		left: {
			type: DataTypes.INTEGER,
			allowNull: false,
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
	/*
	CREATE TABLE `RoleMembers` (
		`userId` TEXT NOT NULL REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
		`roleId` TEXT NOT NULL REFERENCES `Roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
		`createdAt` TEXT NOT NULL,
		`updatedAt` TEXT NOT NULL,
		PRIMARY KEY (`userId`, `roleId`));
	*/
	await uz.context.sequelize.getQueryInterface().createTable('rolemembers', {
		userId: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		roleId: {
			type: DataTypes.TEXT,
			allowNull: false,
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
};

export const down = async (uz: MigrationParams<any>) => {
	await uz.context.sequelize.getQueryInterface().dropTable('channels');
	await uz.context.sequelize.getQueryInterface().dropTable('messages');
	await uz.context.sequelize.getQueryInterface().dropTable('gamesessions');
	await uz.context.sequelize.getQueryInterface().dropTable('greetingmessges');
	await uz.context.sequelize.getQueryInterface().dropTable('roles');
	await uz.context.sequelize.getQueryInterface().dropTable('users');
	await uz.context.sequelize.getQueryInterface().dropTable('rolemembers');
};