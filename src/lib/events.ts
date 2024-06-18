import { UserJoined, UserLeft, BotStarted, TickFive, TickOneTwenty, MessageAdded, MessageDeleted, MessageUpdated, ActivityCacheClear } from './events/index.js';

export type emitterSpec = {
  userJoined: UserJoined
  userLeft: UserLeft
  botStarted: BotStarted
  tickFive: TickFive,
  tickOneTwenty: TickOneTwenty,
  messageAdded: MessageAdded,
  messageDeleted: MessageDeleted,
  messageUpdated: MessageUpdated,
  activityCacheClear: ActivityCacheClear,
};

