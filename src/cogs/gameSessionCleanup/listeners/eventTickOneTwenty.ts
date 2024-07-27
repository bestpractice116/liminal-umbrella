// FIXME change this to eventTickOneTwenty

import { Listener, container } from '@sapphire/framework';
import { TickFive } from '../../../lib/events/index.js';
import { Sequential } from '../../../lib/utils.js';
import { GameSession } from '../../../lib/database/model.js';
import { Op } from '@sequelize/core';
import { shortSleep, sleepUpToTwoHours } from '../../../lib/utils.js';

const CLEANUP_GAME_LISTINGS_AFTER_TIME = 1 * 24 * 60 * 60 * 1000; // 1 day ago
const CLEANUP_GAME_CHANNELS_AFTER_TIME = 10 * 24 * 60 * 60 * 1000; // 10 days ago

export class gameSessionCleanupTickFiveListener extends Listener {
	public constructor(context: Listener.LoaderContext, options: Listener.Options) {
		super(context, {
			...options,
			name: 'gameSessionCleanupTickFive',
			emitter: container.events,
			event: 'tickFive'
		});
	}

	async run(_e: TickFive) {
		await sleepUpToTwoHours();
		this.container.logger.info('Doing gameSessionCleanup now');
		await this.cleanupGameListings();
		await this.cleanupGameChannels();
		this.container.logger.info('Finished gameSessionCleanup');
	}

	@Sequential
	getGameListingsToDelete() {
		// Find all non-pinned messages > 30 days old from the channel.
		const since = Date.now() - CLEANUP_GAME_LISTINGS_AFTER_TIME;
		return GameSession.findAll({
			where: {
				endtime: { [Op.lt]: since },
				gameListingsMessageCleanedup: false
			},
			order: [['endtime', 'ASC']]
		});
	}

	async cleanupGameListings() {
		const gameListingsToDelete = await this.getGameListingsToDelete();
		await shortSleep();

		// Delete them from Discord and the bot's database.
		this.container.logger.info(`Found ${gameListingsToDelete.length} game_listings posts to consider deleting`);
		for (const gameSession of gameListingsToDelete) {
			await this.cleanupGameListing(gameSession);
			await shortSleep();
		}
	}

	@Sequential
	async cleanupGameListing(gameSession: GameSession) {
		const db = await this.container.database.getdb();
		await db.transaction(async () => {
			container.logger.info(`Delete game_listings post ${gameSession.gameListingsMessageId} for game ${gameSession.name}`);
			const discordMessage = await gameSession.getGameListing();
			if (discordMessage) {
				await discordMessage.delete();
			}
			gameSession.set({ gameListingsMessageCleanedup: true });
			await gameSession.save();
		});
	}

	@Sequential
	getGameChannelsToLockSessions() {
		const since = Date.now() - CLEANUP_GAME_CHANNELS_AFTER_TIME;
		return GameSession.findAll({
			where: {
				endtime: { [Op.lt]: since },
				channelCleanedup: false
			},
			order: [['endtime', 'ASC']]
		});
	}

	async cleanupGameChannels() {
		// Find all non-pinned messages > 30 days old from the channel.
		const gameChannelsToLock = await this.getGameChannelsToLockSessions();

		// Delete them from Discord and the bot's database.
		this.container.logger.info(`Found ${gameChannelsToLock.length} game threads to consider locking`);
		for (const gameSession of gameChannelsToLock) {
			await this.cleanupGameChannel(gameSession);
			await shortSleep();
		}
	}

	@Sequential
	async cleanupGameChannel(gameSession: GameSession) {
		const db = await this.container.database.getdb();
		await db.transaction(async () => {
			const gameThread = await gameSession.getGameThread();
			if (!gameThread) {
				container.logger.info(`Game thread ${gameSession.channelId} for game ${gameSession.name} has been deleted, marking cleaned up`);
				gameSession.set({ channelCleanedup: true });
				await gameSession.save();
				return;
			}
			if (gameThread.archived) {
				container.logger.info(`Game thread ${gameSession.channelId} for game ${gameSession.name} is archived, locking`);
				await gameThread.setLocked(true);
				gameSession.set({ channelCleanedup: true });
				await gameSession.save();
				return;
			}
			container.logger.info(`Game thread ${gameSession.channelId} for game ${gameSession.name} is not yet archived - ignoring`);
		});
	}
}
