import { Sequelize, importModels, DataTypes, TransactionType, Op } from '@sequelize/core';
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
	Message as DiscordMessage,
	NonThreadGuildBasedChannel,
	MessageCollector,
	ThreadChannel,
	PublicThreadChannel,
	GuildScheduledEvent,
	User as GuildUser
} from 'discord.js';
import { ChannelType, GuildBasedChannel, MessageType, GuildMember } from 'discord.js';
import { User, Role, Channel, Message, Watermark, EventInterest } from './database/model.js';
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

const __dirname = dirname(fileURLToPath(import.meta.url));

function assertIsDefined<T>(value: T): asserts value is NonNullable<T> {
	if (value === undefined || value === null) {
		throw new Error(`${value} is not defined`);
	}
}

export const DATABASE_FILENAME = process.env.DATABASE_NAME.startsWith('/')
	? process.env.DATABASE_NAME
	: path.join(__dirname, '..', '..', process.env.DATABASE_NAME);

export default class Database {
	db: Sequelize | undefined;

	events: TypedEvent;

	highwatermark: number;

	messageCollectors: Map<string, MessageCollector>;

	constructor(e: TypedEvent) {
		this.events = e;
		this.highwatermark = 0;
		this.messageCollectors = new Map();
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

	async greetingMessageAdd(messageId: string, userId: string): Promise<void> {
		await GreetingMessage.findOrCreate({
			where: { userId },
			defaults: { userId, messageId }
		});
	}

	async syncRoles(guild: Guild): Promise<void> {
		const roles = await guild.roles.fetch();
		const dbRoles = await Role.rolesMap();
		const missingRoles = [];
		for (const [key, _] of roles) {
			const dbRole = dbRoles.get(key);
			if (!dbRole) {
				missingRoles.push(key);
			}
			dbRoles.delete(key);
		}
		for (const missingId of missingRoles) {
			const role = roles.get(missingId)!;
			await Role.create({
				key: missingId,
				name: role.name,
				mentionable: role.mentionable,
				tags: JSON.stringify(role.tags || []) || '',
				position: role.position,
				rawPosition: role.rawPosition,
				hexColor: role.hexColor,
				unicodeEmoji: role.unicodeEmoji || '',
				permissions: JSON.stringify(role.permissions.serialize())
			});
		}
		for (const [key, _] of dbRoles) {
			const role = await Role.findByPk(key);
			await role?.destroy();
		}
	}

	async guildMemberAdd(guildMember: GuildMember) {
		const userData = {
			nickname: (guildMember.nickname || guildMember.user.globalName || guildMember.user.username)!,
			username: guildMember.user.username,
			name: (guildMember.user.globalName || guildMember.user.username)!,
			rulesaccepted: false, // FIXME
			left: false,
			bot: guildMember.user.bot,
			avatarURL: guildMember.user.avatarURL() || guildMember.user.defaultAvatarURL,
			joinedDiscordAt: guildMember.user.createdAt.valueOf()
		};
		container.logger.info(`ADD USER ${userData.nickname} id ${guildMember.id}`);
		let user = await User.findByPk(guildMember.id);
		let exMember = true;
		if (!user) {
			user = await User.create({
				key: guildMember.id,
				...userData
			});
			exMember = false;
		} else {
			user.set(userData);
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
				new UserJoined(
					guildMember.id,
					user.username,
					user.name,
					user.nickname,
					exMember,
					user.avatarURL,
					new Date(user.joinedDiscordAt),
					user,
					guildMember
				)
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
		member.left = true;
		await member.save();
		await member.setRoles([]);
		this.events.emit(
			'userLeft',
			new UserLeft(id, member.username, member.name, member.nickname, member.avatarURL, new Date(member.joinedDiscordAt), member)
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
			}
			dbchannels.delete(id);
		}
		for (const missingId of missingChannels) {
			const guildChannel = channels.get(missingId)!;
			await this.channelCreate(guildChannel);
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

	async indexMessage(msg: DiscordMessage) {
		if (!!!this.messageCollectors.get(msg.channel.id)) {
			container.logger.debug(`Got index request for message on channel we are not subscribed to: ${msg.channel.id}`);
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
			container.logger.debug(`Create message with author ${msg.author.id} in channel ${msg.channel.id} content ${msg.content}`);
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

	async fetchAndStoreMessages(channel: TextBasedChannel) {
		const fetchAmount = 100;
		const options: FetchMessagesOptions = {
			limit: fetchAmount
		};
		let msgCount = 0;
		while (true) {
			const messages = await channel.messages.fetch(options);
			await sleep(1000);

			if (messages.size > 0) {
				let earliestMessage;
				let earliestDate = Infinity;

				for (let pairs of messages) {
					let msg = pairs[1];

					if (msg.createdTimestamp < earliestDate) {
						earliestDate = msg.createdTimestamp;
						earliestMessage = msg;
					}

					await this.indexMessage(msg);
				}

				options.before = earliestMessage!.id;
			}

			msgCount += messages.size;

			if (messages.size < fetchAmount) {
				break;
			}
		}
	}

	createMessageListener(discordChannel: TextBasedChannel | ThreadChannel) {
		const collector = discordChannel.createMessageCollector();
		this.messageCollectors.set(discordChannel.id, collector);
		collector.on('collect', (message) => {
			this.indexMessage(message);
		});
		collector.on('end', () => {
			this.messageCollectors.delete(discordChannel.id);
			return Promise.resolve();
		});
	}

	async syncChannel(discordChannel: GuildBasedChannel) {
		// We only need to sync each channel once!
		if (!!this.messageCollectors.get(discordChannel.id)) {
			return;
		}
		if (discordChannel.type === ChannelType.GuildText) {
			this.createMessageListener(discordChannel);
			await this.fetchAndStoreMessages(discordChannel);
		}
		if (discordChannel.type === ChannelType.PublicThread) {
			const chan = discordChannel as PublicThreadChannel<true>;
			this.createMessageListener(chan);
		}
		if (discordChannel.type === ChannelType.GuildForum) {
			const activeThreads = await discordChannel.threads.fetchActive();
			const archivedThreads = await discordChannel.threads.fetchArchived({
				fetchAll: true,
				limit: 100
			});
			await sleep(1000);

			if (archivedThreads) {
				for (let pairs of archivedThreads.threads) {
					await this.fetchAndStoreMessages(pairs[1]);
				}
			}
			if (activeThreads) {
				for (let pairs of activeThreads.threads) {
					this.createMessageListener(pairs[1]);
					await this.fetchAndStoreMessages(pairs[1]);
				}
			}
		}
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
				const member = await container.guild?.members.fetch(uninterested.userId);
				if (member) {
					await this.removeUserInterestedInEvent(member.user, guildScheduledEvent);
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
