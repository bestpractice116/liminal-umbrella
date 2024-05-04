import { UserJoined, UserLeft, BotStarted, TickFive, MessageAdded, MessageDeleted, MessageUpdated } from './events/index.js';

export type emitterSpec = {
  userJoined: UserJoined
  userLeft: UserLeft
  botStarted: BotStarted
  tickFive: TickFive,
  messageAdded: MessageAdded,
  messageDeleted: MessageDeleted,
  messageUpdated: MessageUpdated,
};

