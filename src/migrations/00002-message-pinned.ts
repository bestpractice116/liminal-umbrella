import { DataTypes } from '@sequelize/core';
import type { MigrationParams } from 'umzug';
//import { Message } from '../lib/database/model.js';

export const up = async (uz: MigrationParams<any>) => {
	const qi = uz.context.sequelize.getQueryInterface();
	await qi.addColumn('messages', 'pinned', {
	    type: DataTypes.INTEGER,
	    allowNull: true,
	});
	/*await qi.bulkUpdate('messages', {'pinned': false});
	await qi.changeColumn('messages', 'pinned', {
		type: DataTypes.INTEGER,
		allowNull: false,
	});
	for (const msg of await Message.findAll()) {
		console.log('start discord fetch of message');
		const discordChannel = await uz.context.guild.channels.fetch(msg.channelId);
		const discordMessage = await discordChannel.messages.fetch(msg.id);
		console.log('discord got message');
		await Message.update(
			{ pinned: discordMessage.pinned},
			{
			  where: {
				id: msg.id,
			  },
			},
		);
		console.log(`Updated pinned on message ${msg.id}`);
	}*/
};

export const down = async (uz: MigrationParams<any>) => {
	const qi = uz.context.sequelize.getQueryInterface()
	await qi.removeColumn('messages', 'pinned')
};
