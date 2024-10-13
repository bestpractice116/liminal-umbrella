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
    UserInterestedInEvent,
    UserDisinterestedInEvent,
    UserChangedNickname,
    UserWinnow,
    DirectMessage
} from './events/index.js';

export interface emitterSpec {
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
    userInterestedInEvent: UserInterestedInEvent;
    userDisinterestedInGame: UserDisinterestedInEvent;
    userChangedNickname: UserChangedNickname;
    userWinnow: UserWinnow;
    directMessage: DirectMessage;
}

export const CUSTOM_EVENTS = {
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
    UserInterestedInEvent: 'userInterestedInEvent' as const,
    UserDisinterestedInEvent: 'userDisinterestedInEvent' as const,
    UserChangedNickname: 'userChangedNickname' as const,
    UserWinnow: 'userWinnow' as const,
    DirectMessage: 'directMessage' as const,
};
