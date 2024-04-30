import { UserJoined, UserLeft, BotStarted, TickFive } from './events/index.js';

export type emitterSpec = {
  userJoined: UserJoined
  userLeft: UserLeft
  botStarted: BotStarted
  tickFive: TickFive
};

