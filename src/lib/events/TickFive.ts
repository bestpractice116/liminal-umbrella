import { Guild } from "discord.js";

export class TickFive {
    constructor(
        public firedAt: number,
        public guild: Guild,
    ) {}
  }