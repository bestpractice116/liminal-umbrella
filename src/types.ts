/**
 * The available secrets for our Discord server.
 */
export interface IDiscordSecrets {
  /** The bot application's public key */
  publicKey: string;
  /** The bot application's ID */
  applicationId: string;
  /** The bot application's authorization
   * token (also known as the client secret) */
  authToken: string;
  /** The bot's token (specific to the bot within the application) */
  botToken: string;
}

/**
 * A server role assigned to a user.
 */
export interface IDiscordRole {
  id: string;
  name: string;
  color: number;
  hoist: boolean;
  mentionable: boolean;
}

/**
 * A Discord member and their properties.
 */
export interface IDiscordMember {
  deaf: boolean;
  roles: string[];
  user: IDiscordUser;
}

/**
 * The user information for a Discord member.
 */
export interface IDiscordUser {
  id: number;
  username: string;
  discriminator: string;
}

/**
 * The incoming request, created via API Gateway request templates.
 */
export interface IDiscordEventRequest {
  timestamp: string;
  signature: string;
  jsonBody: IDiscordJsonBody;
}

/**
 * The actual Discord request data.
 */
export interface IDiscordJsonBody {
  id?: string,
  token?: string,
  data?: IDiscordRequestData;
  member?: IDiscordMember;
  type: number;
  version: number;
}

/**
 * The data in the Discord request. Should be handled for actually parsing commands.
 */
export interface IDiscordRequestData {
  id: string;
  name: string;
  type: number;
  options?: IDiscordRequestDataOption[];
  guildId?: string;
  targetId?: string;
}

/**
 * The name and value for a given command option if available.
 */
export interface IDiscordRequestDataOption {
  name: string;
  type: number;
  value?: string | number | boolean;
  options?: IDiscordRequestDataOption[];
}

/**
 * The information for the endpoint to use when sending a response.
 */
export interface IDiscordEndpointInfo {
  /** The API version to use for the endpoint (10 is the default when not specified) */
  apiVersion?: string;
  /** The bot token to use when accessing this endpoint */
  botToken: string;
  /** The application ID for this bot */
  applicationId: string;
}

/**
 * The actual response data that will be used in the resulting Discord message.
 */
export interface IDiscordResponseData {
  tts: boolean;
  content: string;
  embeds: any[];
  allowedMentions: string[];
}

export type ApplicationCommandOptionChoice = {
  name: string;
  value: string | number;
};

export type ApplicationCommandOption = {
  type: ApplicationCommandOptionType;
  name: string;
  description: string;
  default?: boolean;
  required?: boolean;
  choices?: ApplicationCommandOptionChoice[];
  options?: ApplicationCommandOption[];
};

export type ApplicationCommandOptionValue = string | number | boolean;

export enum ApplicationCommandOptionType {
  SUB_COMMAND = 1,
  SUB_COMMAND_GROUP = 2,
  STRING = 3,
  INTEGER = 4,
  BOOLEAN = 5,
  USER = 6,
  CHANNEL = 7,
  ROLE = 8,
}

export type ApplicationCommand = {
  id: string;
  application_id: string;
  name: string;
  description: string;
  options: ApplicationCommandOption[];
};

export type PartialApplicationCommand = {
  name: string;
  description: string;
  options?: ApplicationCommandOption[];
};

export type Embed = {
  title?: string;
  // type?: string; // deprecated
  description?: string;
  url?: string;
  timestamp?: Date;
  color?: number;
  footer?: EmbedFooter;
  image?: EmbedImage;
  thumbnail?: EmbedThumbnail;
  video?: EmbedVideo;
  provider?: EmbedProvider;
  author?: EmbedAuthor;
  fields?: EmbedField[];
};

export type EmbedThumbnail = {
  url?: string;
  proxyUrl?: string;
  height?: number;
  width?: number;
};

export type EmbedVideo = {
  url?: string;
  height?: number;
  width?: number;
};

export type EmbedImage = {
  url?: string;
  proxyUrl?: string;
  height?: number;
  width?: number;
};

export type EmbedProvider = {
  name?: string;
  url?: string;
};

export type EmbedAuthor = {
  name?: string;
  url?: string;
  iconUrl?: string;
  proxyIconUrl?: string;
};

export type EmbedFooter = {
  text?: string;
  iconUrl?: string;
  proxyIconUrl?: string;
};

export type EmbedField = {
  name: string;
  value: string;
  inline?: boolean;
};