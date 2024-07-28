import {
	UserJoined,
	UserLeft,
	BotStarted,
	TickFive,
	TickOneTwenty,
	MessageAdded,
	MessageDeleted,
	MessageUpdated,
	ActivityCacheClear,
	BotMessageCacheClear,
	UserInterestedInGame,
	UserDisinterestedInGame,
	UserChangedNickname
} from './events/index.js';

export type emitterSpec = {
	userJoined: UserJoined;
	userLeft: UserLeft;
	botStarted: BotStarted;
	tickFive: TickFive;
	tickOneTwenty: TickOneTwenty;
	messageAdded: MessageAdded;
	messageDeleted: MessageDeleted;
	messageUpdated: MessageUpdated;
	activityCacheClear: ActivityCacheClear;
	botMessageCacheClear: BotMessageCacheClear;
	userInterestedInGame: UserInterestedInGame;
	userDisinterestedInGame: UserDisinterestedInGame;
	userChangedNickname: UserChangedNickname;
};

export const CustomEvents = {
	UserJoined: 'userJoined' as const,
	UserLeft: 'userLeft' as const,
	BotStarted: 'botStarted' as const,
	TickFive: 'tickFive' as const,
	TickOneTwenty: 'tickOneTwenty' as const,
	MessageAdded: 'messageAdded' as const,
	MessageDeleted: 'messageDeleted' as const,
	MessageUpdated: 'messageUpdated' as const,
	ActivityCacheClear: 'activityCacheClear' as const,
	BotMessageCacheClear: 'botMessageCacheClear' as const,
	UserInterestedInGame: 'userInterestedInGame' as const,
	UserDisinterestedInGame: 'userDisinterestedInGame' as const,
	UserChangedNickname: 'userChangedNickname' as const
};
