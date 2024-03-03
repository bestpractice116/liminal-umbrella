import { Listener, container } from '@sapphire/framework';
import type { Client } from 'discord.js';

export class FooListener extends Listener {
  public constructor(context: Listener.LoaderContext, options: Listener.Options) {
    super(context, {
      ...options,
      emitter: container.events,
      event: 'GUILD_MEMBER_ADD'
    });
  }
  run (_: Client) {
  }
}