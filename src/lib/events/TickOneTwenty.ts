import { Guild } from "discord.js";

export class TickOneTwenty {
    constructor(
        public firedAt: number,
        public guild: Guild,
    ) {}
  }