import { Listener, container } from '@sapphire/framework';
import { TickOneTwenty } from '../../../lib/events/index.js';
import { Sequential } from '../../../lib/utils.js';
import { GameSession } from '../../../lib/database/model.js';
import { Op } from '@sequelize/core';
import { shortSleep, sleepUpToTwoHours } from '../../../lib/utils.js';
import { CUSTOM_EVENTS } from '../../../lib/events.js';

const CLEANUP_GAME_LISTINGS_AFTER_TIME = 1 * 24 * 60 * 60 * 1000; // 1 day ago
const CLEANUP_GAME_CHANNELS_AFTER_TIME = 10 * 24 * 60 * 60 * 1000; // 10 days ago

interface GameChannelsLocked {
    considered: number;
    locked: number;
}

export class gameSessionCleanupTickOneTwentyListener extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            name: 'gameSessionCleanupTickOneTwenty',
            emitter: container.events,
            event: CUSTOM_EVENTS.TickOneTwenty
        });
    }

    async run(_e: TickOneTwenty) {
        await sleepUpToTwoHours();
        this.container.logger.info('Doing gameSessionCleanup now');
        const gameListingsDeleted = await this.cleanupGameListings();
        const gameChannelsHandled = await this.cleanupGameChannels();
        const statusMessage = `deleted ${gameListingsDeleted} game listings, considered ${gameChannelsHandled.considered} threads and locked ${gameChannelsHandled.locked} of them`;
        this.container.logger.info(`Finished gameSessionCleanup: ${statusMessage}`);
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

    async cleanupGameListings(): Promise<number> {
        const gameListingsToDelete = await this.getGameListingsToDelete();
        await shortSleep();

        // Delete them from Discord and the bot's database.
        this.container.logger.info(`Found ${gameListingsToDelete.length} game_listings posts to consider deleting`);
        for (const gameSession of gameListingsToDelete) {
            await this.cleanupGameListing(gameSession);
            await shortSleep();
        }
        return gameListingsToDelete.length;
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

    async cleanupGameChannels(): Promise<GameChannelsLocked> {
        // Find all non-pinned messages > 30 days old from the channel.
        const gameChannelsToLock = await this.getGameChannelsToLockSessions();

        let locked = 0;
        // Delete them from Discord and the bot's database.
        this.container.logger.info(`Found ${gameChannelsToLock.length} game threads to consider locking`);
        for (const gameSession of gameChannelsToLock) {
            if (await this.cleanupGameChannel(gameSession)) locked++;
            await shortSleep();
        }
        return {
            considered: gameChannelsToLock.length,
            locked
        };
    }

    @Sequential
    async cleanupGameChannel(gameSession: GameSession): Promise<boolean> {
        const db = await this.container.database.getdb();
        return await db.transaction(async () => {
            const gameThread = await gameSession.getGameThread();
            if (!gameThread) {
                container.logger.info(`Game thread ${gameSession.channelId} for game ${gameSession.name} has been deleted, marking cleaned up`);
                gameSession.set({ channelCleanedup: true });
                await gameSession.save();
                return true;
            }
            if (gameThread.archived) {
                if (!gameThread.locked) {
                    container.logger.info(`Game thread ${gameSession.channelId} for game ${gameSession.name} is archived, locking`);
                    // Yes - this is lame... You need to un-archive a thread to then lock it...
                    await gameThread.setArchived(false);
                    await gameThread.setLocked(true);
                }
                gameSession.set({ channelCleanedup: true });
                await gameSession.save();
                return true;
            }
            container.logger.info(`Game thread ${gameSession.channelId} for game "${gameSession.name}" is not yet archived - ignoring`);
            return false;
        });
    }
}
