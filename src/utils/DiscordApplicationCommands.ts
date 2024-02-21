import axios from 'axios';
import {
  ApplicationCommand,
  PartialApplicationCommand,
  IDiscordSecrets
} from "../types";

const DISCORD_ENDPOINT = "https://discord.com/api/v10/";

const makeEndpoint = (endpoint : string) => `${DISCORD_ENDPOINT}${endpoint}`;

export async function getApplicationCommands(auth: IDiscordSecrets, guildId?: string) {
    const res = await axios.get(makeEndpoint(
        guildId
          ? `applications/${auth.applicationId}/guilds/${guildId}/commands`
          : `applications/${auth.applicationId}/commands`
      ),
      {
        headers: {"Authorization": `Bot ${auth.botToken}`},
      }
    );
    return res.data as ApplicationCommand[];
  };

  export async function createApplicationCommand(
    auth: IDiscordSecrets,
    command: PartialApplicationCommand,
    guildId?: string,
    commandId?: string
  ) {
    const suffix = commandId ? `/${commandId}` : "";
    const method = commandId ? "PATCH" : "POST";
    const res = await axios.request({
      url: makeEndpoint(
        guildId
          ? `applications/${auth.applicationId}/guilds/${guildId}/commands${suffix}`
          : `applications/${auth.applicationId}/commands${suffix}`
      ),
      method,
      data: command,
      headers: {"Authorization": `Bot ${auth.botToken}`}
    });
    return res.data as ApplicationCommand;
  }

  export async function editApplicationCommand(
    auth: IDiscordSecrets,
    commandId: string,
    command: PartialApplicationCommand,
    guildId?: string
  ) {
    return await createApplicationCommand(auth, command, guildId, commandId);
  }

  export async function deleteApplicationCommand(auth: IDiscordSecrets, commandId: string, guildId?: string) {
    const res = await axios.delete(
      makeEndpoint(
        guildId
          ? `applications/${auth.applicationId}/guilds/${guildId}/commands/${commandId}`
          : `applications/${auth.applicationId}/commands/${commandId}`
      ),
      {
        headers: {"Authorization": `Bot ${auth.botToken}`}
      }
    );
    return res.status == 204;
  };
