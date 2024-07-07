import { DataTypes } from '@sequelize/core';
import type { MigrationParams } from 'umzug';

export const up = async (uz: MigrationParams<any>) => {
	const qi = uz.context.sequelize.getQueryInterface();
	await qi.createTable('activities', {
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
		type: {
			type: DataTypes.ENUM('playing', 'streaming', 'listening', 'watching'),
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
	});
	await qi.addIndex('activities', {
		name: 'activities_name_unique',
		fields: ['name'],
		unique: true
	});
	await qi.bulkInsert(
		'activities',
		[
			'DnD 5e',
			'DnD 3.5',
			'DnD 1e',
			'Whitehack',
			'Shadowdark',
			'Knave',
			'Vampire: The Masquerade',
			'Mage: The Ascension',
			'Dungeons Crawl Classics',
			'Mutant Crawl Classics',
			'Best Left Buried: Deeper',
			'Zenobia',
			'43AD',
			'Call of Cthulhu',
			'Delta Green',
			'Alien',
			'Shadowrun',
			'Mörk Borg',
			'Honey Heist',
			'Coriolis',
			'Vasen',
			'Dragonbane',
			'APOCALYPSE FRAME',
			'H.O.N.K.',
			'Mausritter',
			'The bagpipes',
			"Baldur's Gate 3",
			'Tetris',
			'Mario Kart',
			'Exploding Kittens',
			'with puppies',
			'Goat simulator',
			'The Secret of Monkey Island',
			'Lemmings',
			'Worms',
			'Pacman',
			'Angry Birds',
			'Pong'
		].map((activityName) => {
			return {
				name: activityName,
				type: 'playing',
				createdAt: new Date(),
				updatedAt: new Date()
			};
		})
	);
};

export const down = async (uz: MigrationParams<any>) => {
	const qi = uz.context.sequelize.getQueryInterface();
	await qi.dropTable('activities');
};
