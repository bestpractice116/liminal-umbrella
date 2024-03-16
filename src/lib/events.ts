import { UserJoined, UserLeft } from './events/index.js';

export type emitterSpec = {
  userJoined: UserJoined
  userLeft: UserLeft
};

