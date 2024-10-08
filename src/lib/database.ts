import { Sequelize, importModels, DataTypes, TransactionType, Op, CreationAttributes } from '@sequelize/core';
import { container } from '@sapphire/framework';
import { Umzug, SequelizeStorage } from 'umzug';
import * as path from 'path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import type {
	TextChannel,
	TextBasedChannel,
	CategoryChannel,
	Guild,
	FetchMessagesOptions,
	FetchArchivedThreadOptions,
	Message as DiscordMessage,
	NonThreadGuildBasedChannel,
	GuildScheduledEvent,
	User as GuildUser,
	Role as GuildRole,
	AnyThreadChannel
} from 'discord.js';
import { ChannelType, GuildBasedChannel, MessageType, GuildMember } from 'discord.js';
import { User, Role, Channel, Message, Watermark, EventInterest, GameSessionUserSignup, Thread } from './database/model.js';
import { TypedEvent } from '../lib/typedEvents.js';
import {
	UserJoined,
	UserLeft,
	UserChangedNickname,
	MessageUpdated,
	MessageAdded,
	UserInterestedInEvent,
	UserDisinterestedInEvent
} from './events/index.js';
import GreetingMessage from './database/model/GreetingMessage.js';
import { arrayStrictEquals } from '@sapphire/utilities';
import { sleep } from './utils.js';
import { CustomEvents } from './events.js';
import { getGuildMemberById } from './discord.js';
import { END_OF_TIME, START_OF_TIME } from './dates.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

function assertIsDefined<T>(value: T): asserts value is NonNullable<T> {
	if (value === undefined || value === null) {
		throw new Error(`${value} is not defined`);
	}
}

export const DATABASE_FILENAME = process.env.DATABASE_NAME.startsWith('/')
	? process.env.DATABASE_NAME
	: path.join(__dirname, '..', '..', process.env.DATABASE_NAME);

type ThreadMeta = { [key: string]: string | number | boolean | Date | undefined };

export default class Database {
	db: Sequelize | undefined;

	events: TypedEvent;

	highwatermark: number;

	syncedChannels: Set<string>;

	indexedChannels: Set<string>;

	constructor(e: TypedEvent) {
		this.events = e;
		this.highwatermark = 0;
		this.syncedChannels = new Set<string>();
		this.indexedChannels = new Set<string>();
	}

	indexChannel(id: string) {
		this.indexedChannels.add(id);
	}

	async getdb(): Promise<Sequelize> {
		const storage = DATABASE_FILENAME;

		if (this.db) {
			return this.db;
		}

		const log = process.env.NODE_ENV === 'development' || !!process.env.LOG_QUERIES;

		this.db = new Sequelize('database', 'user', 'password', {
			host: 'localhost',
			dialect: 'sqlite',
			logging: log ? (msg) => container.logger.debug(msg) : false,
			storage,
			models: await importModels(__dirname + '/database/model/*.js'),
			transactionType: TransactionType.IMMEDIATE,
			retry: {
				match: [/SQLITE_BUSY/],
				name: 'query',
				max: 5
			}
		});

		return this.db;
	}

	async doMigrations(guild: Guild) {
		const umzug = new Umzug({
			migrations: {
				glob: ['migrations/*.js', { cwd: path.join(path.dirname(import.meta.url.replace('file://', '')), '..', '..', 'dist') }]
			},
			context: {
				sequelize: await this.getdb(),
				guild,
				DataTypes
			},
			storage: new SequelizeStorage({
				sequelize: await this.getdb()
			}),
			logger: console
		});
		return umzug.up();
	}

	async greetingMessageAdd(message: DiscordMessage, user: User): Promise<void> {
		const db = await this.getdb();
		await db.transaction(async () => {
			await GreetingMessage.findOrCreate({
				where: { userId: user.key },
				defaults: { userId: user.key, messageId: message.id }
			});
			await user.updateLastSeenFromMessage(message);
		});
	}

	getRoleData(role: GuildRole): any {
		return {
			name: role.name,
			mentionable: role.mentionable,
			tags: JSON.stringify(role.tags || []) || '',
			position: role.position,
			rawPosition: role.rawPosition,
			hexColor: role.hexColor,
			unicodeEmoji: role.unicodeEmoji || '',
			permissions: JSON.stringify(role.permissions.serialize())
		};
	}

	async syncRoles(guild: Guild): Promise<void> {
		const roles = await guild.roles.fetch();
		const dbRoles = await Role.rolesMap();
		const missingRoles = [];
		for (const [key, role] of roles) {
			const dbRole = dbRoles.get(key);
			if (!dbRole) {
				missingRoles.push(key);
			} else {
				await this.roleUpdate(role, dbRole);
			}
			dbRoles.delete(key);
		}
		for (const missingId of missingRoles) {
			const role = roles.get(missingId)!;
			await this.roleCreate(role);
		}
		for (const [_key, dbRole] of dbRoles) {
			this.roleDelete(undefined, dbRole);
		}
	}

	async roleCreate(role: GuildRole) {
		await Role.create({
			key: role.id,
			...this.getRoleData(role)
		});
	}

	async roleDelete(role?: GuildRole | undefined, dbRole?: Role | undefined) {
		if (!dbRole && !role) {
			throw new Error('Must supply either discord Guildrole or DB role as parameter');
		}
		if (!dbRole) dbRole = (await Role.findByPk(role!.id)) || undefined;
		if (!dbRole) return;
		await dbRole?.destroy();
	}

	async roleUpdate(role: GuildRole, dbRole?: Role | undefined) {
		if (!dbRole) dbRole = (await Role.findByPk(role!.id)) || undefined;
		if (!dbRole) return this.roleCreate(role);
		dbRole.set(this.getRoleData(role));
		await dbRole.save();
	}

	async guildMemberAdd(guildMember: GuildMember) {
		let user = await User.findByPk(guildMember.id);
		let exMember = true;
		if (!user) {
			user = await User.createFromGuildMember(guildMember);
			exMember = false;
		} else {
			user.updateFromGuildMember(guildMember);
			await user.save();
		}
		await user.setRoles(guildMember.roles.cache.keys());
		if (this.highwatermark == 0) {
			// Skip these events if we are bootstrapping - to avoid us spamming channels with repeated user joined / welcome messages.
			return;
		}
		if (!guildMember.user.bot) {
			this.events.emit(
				'userJoined',
				new UserJoined(user.key, user.username, user.name, user.nickname, exMember, user.avatarURL, new Date(user.joinedDiscordAt), user)
			);
			await this.maybeSetHighestWatermark();
		}
	}

	async guildMemberUpdate(guildMember: GuildMember, user: User | null = null) {
		user ||= await User.findByPk(guildMember.id);
		if (!user) {
			return;
		}
		let changed = false;
		const newNick = (guildMember.nickname || guildMember.user.globalName || guildMember.user.username)!;
		if (newNick != user.nickname) {
			this.events.emit('userChangedNickname', new UserChangedNickname(guildMember.id, user.nickname, newNick, user, guildMember));
			user.nickname = newNick;
			changed = true;
		}
		const newAvatar = guildMember.user.avatarURL() || guildMember.user.defaultAvatarURL;
		if (newAvatar != user.avatarURL) {
			user.avatarURL = newAvatar;
			changed = true;
		}
		if (!arrayStrictEquals(Array.from(guildMember.roles.cache.keys()).sort(), ((await user.roles) || []).map((role) => role.name).sort())) {
			await user.setRoles(guildMember.roles.cache.keys());
		}
		if (changed) {
			user.save();
		}
		await this.maybeSetHighestWatermark();
	}

	async guildMemberRemove(id: string, member: User | null = null) {
		if (!member) {
			member = await User.findByPk(id);
		}
		if (!member) {
			return;
		}
		let greetingMessageId: string | undefined = undefined;
		await this.db!.transaction(async () => {
			member!.left = true;
			await member!.save();
			await member!.setRoles([]);
			const eventInterests = await EventInterest.findAll({
				where: {
					userId: id
				}
			});
			for (const eventInterest of eventInterests) {
				await eventInterest.destroy();
			}
			const sessions = await GameSessionUserSignup.findAll({
				where: {
					userKey: id
				}
			});
			for (const session of sessions) {
				// FIXME - also need to call updateGameListing
				await session.destroy();
			}
			const greeting = await GreetingMessage.findOne({ where: { userId: id } });
			if (greeting) {
				greetingMessageId = greeting.messageId;
				await greeting.destroy();
			}
		});
		this.events.emit(
			'userLeft',
			new UserLeft(
				id,
				member.username,
				member.name,
				member.nickname,
				member.avatarURL,
				new Date(member.joinedDiscordAt),
				member,
				greetingMessageId
			)
		);
		await this.maybeSetHighestWatermark();
	}

	async syncUsers(guild: Guild) {
		const members = await guild.members.fetch();
		const dbusers = await User.activeUsersMap();
		const missingMembers = [];
		for (const [id, guildMember] of members) {
			const dbMember = dbusers.get(id);
			if (!dbMember) {
				missingMembers.push(id);
			} else {
				await this.guildMemberUpdate(guildMember, dbMember);
				if (
					JSON.stringify(Array.from(guildMember.roles.cache.keys()).sort()) !=
					JSON.stringify(((await dbMember.roles) || []).map((role) => role.key).sort())
				) {
					await dbMember.setRoles(guildMember.roles.cache.keys());
				}
			}
			dbusers.delete(id);
		}
		for (const missingId of missingMembers) {
			const guildMember = members.get(missingId)!;
			await this.guildMemberAdd(guildMember);
		}
		for (const [id, dbMember] of dbusers) {
			await this.guildMemberRemove(id, dbMember);
		}
	}

	getChannelData(guildChannel: NonThreadGuildBasedChannel): any {
		const data: any = {};
		data['name'] = guildChannel.name;
		data['type'] = guildChannel.type.toString();
		data['parentId'] = guildChannel.parentId;
		data['position'] = guildChannel.position;
		data['rawPosition'] = guildChannel.rawPosition;
		data['createdTimestamp'] = guildChannel.createdTimestamp;
		let chan: any = null;
		if (
			guildChannel.type == ChannelType.GuildText ||
			guildChannel.type == ChannelType.GuildAnnouncement ||
			guildChannel.type == ChannelType.GuildForum
		) {
			chan = guildChannel as TextChannel;
		}
		if (guildChannel.type == ChannelType.GuildCategory) {
			chan = guildChannel as CategoryChannel;
		}
		data['nsfw'] = chan.nsfw;
		data['lastMessageId'] = chan.lastMessageId;
		data['topic'] = chan.topic;
		data['rateLimitPerUser'] = chan.rateLimitPerUser;
		return data;
	}

	async channelUpdate(channel: NonThreadGuildBasedChannel) {
		const dbChannel = await Channel.findOne({ where: { id: channel.id } });
		dbChannel!.set(this.getChannelData(channel!));
		await dbChannel!.save();
	}

	async channelCreate(channel: NonThreadGuildBasedChannel) {
		await Channel.create({
			id: channel.id,
			...this.getChannelData(channel)
		});
	}

	async syncChannels(guild: Guild) {
		const channels = (await guild.channels.fetch()).filter(
			(channel) =>
				channel?.type == ChannelType.GuildText ||
				channel?.type == ChannelType.GuildCategory ||
				channel?.type == ChannelType.GuildAnnouncement ||
				channel?.type == ChannelType.GuildForum
		);
		const dbchannels = await Channel.channelsMap();
		const missingChannels = [];
		for (const [id, guildChannel] of channels) {
			const dbChannel = dbchannels.get(id);
			if (!dbChannel) {
				missingChannels.push(id);
			} else {
				dbChannel.set(this.getChannelData(guildChannel!));
				await dbChannel.save();
				await this.syncChannel(guildChannel!);
			}
			dbchannels.delete(id);
		}
		for (const missingId of missingChannels) {
			const guildChannel = channels.get(missingId)!;
			await this.channelCreate(guildChannel);
			await this.syncChannel(guildChannel);
		}
		for (const [_, dbChannel] of dbchannels) {
			await dbChannel.destroy();
		}
	}

	async sync(guild: Guild): Promise<void> {
		await this.syncRoles(guild);
		await this.syncUsers(guild);
		await this.syncChannels(guild);
		await this.syncEvents(guild);
	}

	async getHighestWatermark() {
		const mark = await Watermark.findOne({ order: [['time', 'DESC']] });
		if (mark) {
			this.highwatermark = mark.time;
		}
	}

	// This logic here is that if the watermark in the database is > 10 seconds old we automatically set it to now - 5 seconds.
	// This 5 seconds should allow for delays and etc meaning that we don't see Discord events for some time after they happen or if getting
	// stuff committed to the database takes a while.
	// The 10 seconds should mean that if a bunch of stuff happens in a fairly short space of time, we don't repeatedly hammer the
	// dataabase with repeated watermark updates.
	// Also note - that we don't update the watermark at all if it's 0 - this means that we don't write the watermark when we are
	// bootstrapping with an empty database.
	async maybeSetHighestWatermark() {
		if (this.highwatermark == 0) {
			return;
		}
		const now = Date.now();
		const maxwatermark = now - 1000 * 5;
		const minwatermark = now - 1000 * 10;
		if (this.highwatermark < minwatermark) {
			return this.setHighestWatermark(maxwatermark);
		}
	}

	async setHighestWatermark(watermark: number) {
		await this.db!.transaction(async () => {
			await Watermark.create({ time: watermark });
			await Watermark.destroy({
				where: { time: { [Op.lt]: watermark } }
			});
		});
		this.highwatermark = watermark;
		return Promise.resolve();
	}

	async getdiscordChannel(guild: Guild, channel_name: string): Promise<GuildBasedChannel> {
		const channel = await Channel.findOne({ where: { name: channel_name } });
		assertIsDefined(channel);
		const discordChannel = await guild.channels.fetch(channel.id);
		assertIsDefined(discordChannel);
		return discordChannel;
	}

	async deleteMessage(msg: DiscordMessage) {
		const dbMessage = await Message.findOne({ where: { id: msg.id } });
		if (dbMessage) await dbMessage.destroy();
	}

	async indexMessage(msg: DiscordMessage) {
		const user = await User.findOne({ where: { key: msg.author.id } });
		if (user && !user.bot) {
			await user.updateLastSeenFromMessage(msg);
		}
		if (!this.indexedChannels.has(msg.channel.id)) {
			return;
		}
		const dbMessage = await Message.findOne({ where: { id: msg.id } });
		if (dbMessage) {
			if (
				(!dbMessage.editedTimestamp && msg.editedTimestamp) ||
				(dbMessage.editedTimestamp && dbMessage.editedTimestamp < msg.editedTimestamp!) ||
				dbMessage.hasThread != msg.hasThread ||
				dbMessage.pinned != msg.pinned
			) {
				dbMessage.content = msg.content;
				dbMessage.editedTimestamp = msg.editedTimestamp;
				dbMessage.hasThread = msg.hasThread;
				if (dbMessage.hasThread) {
					dbMessage.threadId = msg.thread?.id || null;
				}
				dbMessage.embedCount = msg.embeds.length;
				dbMessage.pinned = msg.pinned;
				await dbMessage.save();
				this.events.emit('messageUpdated', new MessageUpdated(msg, dbMessage));
			}
		} else {
			const dbMessage = await Message.create({
				id: msg.id,
				authorId: msg.author.id,
				channelId: msg.channel.id,
				applicationId: msg.applicationId || '',
				type: MessageType[msg.type],
				content: msg.content,
				createdTimestamp: msg.createdTimestamp,
				editedTimestamp: msg.editedTimestamp,
				hasThread: msg.hasThread,
				threadId: msg.thread?.id,
				embedCount: msg.embeds.length,
				pinned: msg.pinned
			});
			this.events.emit('messageAdded', new MessageAdded(msg, dbMessage));
		}
	}

	async fetchAndStoreMessages(channel: TextBasedChannel, earliest?: Date): Promise<{ lastSeenIndexedToDate: Date; lastSeenIndexedFromDate: Date }> {
		console.log(`fetchAndStoreMessages for ${(channel as any).name}`);
		const fetchAmount = 100;
		const options: FetchMessagesOptions = {
			limit: fetchAmount
		};
		earliest ||= START_OF_TIME;
		let earliestDate = END_OF_TIME;
		let latestDate = START_OF_TIME;
		while (true) {
			const messages = await channel.messages.fetch(options);
			await sleep(100);

			if (messages.size > 0) {
				let earliestMessage;
				for (let pairs of messages) {
					let msg = pairs[1];
					const createdTimestamp = new Date(msg.createdTimestamp);

					console.log(`Message content ${msg.content}`);

					if (createdTimestamp < earliestDate) {
						console.log(`Message created at ${createdTimestamp} which is less than ${earliestDate} - new earliest message`);
						earliestDate = new Date(msg.createdTimestamp);
						earliestMessage = msg;
					} else {
						console.log(`Message created at${createdTimestamp} which is after ${earliestDate} - NOT earliest message`);
					}
					if (createdTimestamp > latestDate) {
						console.log(`Message created at ${createdTimestamp} which is more than than ${latestDate} - new latest message`);
						latestDate = new Date(msg.createdTimestamp);
					}
					await this.indexMessage(msg);
				}

				options.before = earliestMessage!.id;
			} else {
				console.log('NO MESSAGES');
			}

			if (messages.size < fetchAmount || earliestDate <= earliest) {
				break;
			}
		}
		console.log({
			lastSeenIndexedToDate: new Date(latestDate),
			lastSeenIndexedFromDate: new Date(earliestDate)
		});
		return {
			lastSeenIndexedToDate: new Date(latestDate),
			lastSeenIndexedFromDate: new Date(earliestDate)
		};
	}

	async syncChannel(discordChannel: GuildBasedChannel) {
		// We only need to sync each channel once!
		if (this.syncedChannels.has(discordChannel.id)) {
			return;
		}
		const doIndex = this.indexedChannels.has(discordChannel.id);
		if (discordChannel.type === ChannelType.GuildText) {
			this.syncedChannels.add(discordChannel.id);
			const channel = await Channel.findByPk(discordChannel.id);
			if (!channel) throw new Error(`Could not find discord channel ID ${discordChannel.id} in DB`);
			const earliest = channel.lastSeenIndexedToDate;
			await this.db!.transaction(async () => {
				const dates = await this.fetchAndStoreMessages(discordChannel, earliest);
				channel.set(dates);
				await channel.save();
			});
		}
		if (discordChannel.type === ChannelType.PublicThread) {
			throw new Error(`We should not end up in syncChannel for a thread ID ${discordChannel.id}`);
		}
		if (discordChannel.type === ChannelType.GuildForum) {
			let fetchArchivedOptions: FetchArchivedThreadOptions = {
				fetchAll: true,
				limit: 100
			};
			console.log('Fetch archived threads START');
			while (true) {
				console.log('Fetch archived threads TOP OF LOOP');
				const archivedThreads = await discordChannel.threads.fetchArchived(fetchArchivedOptions);
				await sleep(100);

				for (const [_name, thread] of archivedThreads.threads) {
					this.syncedChannels.add(thread.id);
					if (doIndex) this.indexedChannels.add(thread.id);
					await this.syncThread(thread);
				}

				if (!archivedThreads.hasMore) {
					console.log('no more archived threads');
					break;
				}
				fetchArchivedOptions.before = archivedThreads.threads.first()!.id;
			}

			// No need to do extra stuff with active threads, as fetchActive() just always returns them all
			const activeThreads = await discordChannel.threads.fetchActive();
			if (activeThreads) {
				for (const [_name, thread] of activeThreads.threads) {
					this.syncedChannels.add(thread.id);
					if (doIndex) this.indexedChannels.add(thread.id);
					await this.syncThread(thread);
				}
			}
		}
	}

	async syncThread(thread: AnyThreadChannel) {
		await this.db!.transaction(async () => {
			let dbThread = await Thread.findByPk(thread.id);
			if (
				dbThread &&
				dbThread.locked == thread.locked &&
				dbThread.archived == thread.archived &&
				thread.archiveTimestamp == dbThread.archiveTimestamp
			)
				return;
			let earliest = START_OF_TIME;
			if (dbThread) {
				earliest = dbThread.lastSeenIndexedToDate;
			}
			let dates: { [key: string]: Date } = {};
			if (!dbThread || dbThread.archiveTimestamp !== thread.archiveTimestamp || dbThread.lastMessageId !== thread.lastMessageId) {
				dates = await this.fetchAndStoreMessages(thread, earliest);
			}
			const threadMetadata: ThreadMeta = {
				name: thread.name,
				parentId: thread.parentId!,
				archived: thread.archived!,
				archiveTimestamp: thread.archiveTimestamp!,
				locked: thread.locked!,
				createdTimestamp: thread.createdTimestamp!,
				lastMessageId: thread.lastMessageId || undefined,
				...dates
			};
			if (!dbThread) {
				const data: ThreadMeta = { key: thread.id, ...threadMetadata };
				await Thread.create(data as CreationAttributes<Thread>);
			} else {
				if (Object.keys(threadMetadata).some((key) => threadMetadata[key] !== dbThread!.get(key))) {
					dbThread.set(threadMetadata);
					await dbThread.save();
				}
			}
		});
	}

	// Catch up on any users interested
	async syncEvents(guild: Guild) {
		const allEvents = await guild.scheduledEvents.fetch();
		for (const guildScheduledEvent of allEvents.values()) {
			const subscribers = await guildScheduledEvent.fetchSubscribers();
			for (const subscriber of subscribers.values()) {
				await this.addUserInterestedInEvent(subscriber.user, guildScheduledEvent);
			}
			const uninteresteds = await EventInterest.findAll({
				where: {
					userId: { [Op.notIn]: Array.from(subscribers.keys()) },
					guildScheduledEventId: guildScheduledEvent.id
				}
			});
			for (const uninterested of uninteresteds) {
				const member = await getGuildMemberById(uninterested.userId);
				if (member) {
					await this.removeUserInterestedInEvent(member.user, guildScheduledEvent);
				} else {
					await uninterested.destroy();
				}
			}
		}
	}

	async addUserInterestedInEvent(user: GuildUser, guildScheduledEvent: GuildScheduledEvent) {
		const [eventInterest, created] = await EventInterest.findOrCreate({
			where: { userId: user.id, guildScheduledEventId: guildScheduledEvent.id },
			defaults: {
				userId: user.id,
				guildScheduledEventId: guildScheduledEvent.id
			}
		});
		if (!created) return;
		this.events.emit(
			CustomEvents.UserInterestedInEvent,
			new UserInterestedInEvent(guildScheduledEvent.id, guildScheduledEvent, user.id, user, eventInterest)
		);
	}

	async removeUserInterestedInEvent(user: GuildUser, guildScheduledEvent: GuildScheduledEvent) {
		const eventInterest = await EventInterest.findOne({
			where: {
				userId: user.id,
				guildScheduledEventId: guildScheduledEvent.id
			}
		});
		if (!eventInterest) return;
		await eventInterest.destroy();
		this.events.emit(
			CustomEvents.UserDisinterestedInEvent,
			new UserDisinterestedInEvent(guildScheduledEvent.id, guildScheduledEvent, user.id, user, eventInterest)
		);
	}
}
