import { Precondition, container } from '@sapphire/framework';
import type { CommandInteraction, ContextMenuCommandInteraction, Message } from 'discord.js';

export class AdminOnlyPrecondition extends Precondition {
  public override async messageRun(message: Message) {
    // for Message Commands
    return this.checkAdmin(message.author.id);
  }

  public override async chatInputRun(interaction: CommandInteraction) {
    // for Slash Commands
    return this.checkAdmin(interaction.user.id);
  }

  public override async contextMenuRun(interaction: ContextMenuCommandInteraction) {
    // for Context Menu Command
    return this.checkAdmin(interaction.user.id);
  }

  private async checkAdmin(userId: string) {
    const guildMember = await container.guild!.members.fetch(userId);
    return !!Array.from(guildMember.roles.cache).map(([_, role]) => role.name).find(name => name === 'Admin') ?
      this.ok() : this.error({ message: 'Only Admin users can use this command!' });
  }
}

declare module '@sapphire/framework' {
  interface Preconditions {
    AdminOnly: never;
  }
}