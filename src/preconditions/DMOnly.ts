import { Precondition } from '@sapphire/framework';
import type { CommandInteraction, ContextMenuCommandInteraction, Message } from 'discord.js';

export class DMOnlyPrecondition extends Precondition {
  public override async messageRun(message: Message) {
    return !message.inGuild() ? this.ok() : this.error({ message: 'This command can only be used in DMs' });
  }

  public override async chatInputRun(interaction: CommandInteraction) {
    return !interaction.guild ? this.ok() : this.error({ message: 'This command can only be used in DMs' });
  }

  public override async contextMenuRun(interaction: ContextMenuCommandInteraction) {
    return !interaction.guild ? this.ok() : this.error({ message: 'This command can only be used in DMs' });
  }
}

declare module '@sapphire/framework' {
  interface Preconditions {
    DMOnly: never;
  }
}