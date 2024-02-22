import {Context, Callback} from 'aws-lambda';
import {verifyEvent} from './DiscordBotFunction';
import {IDiscordEventRequest, IDiscordResponseData, Embed} from '../types';
import { getDiscordSecrets } from '../utils/DiscordSecrets';
import axios from 'axios';

/**
 * The actual handler for the lambda.
 * @param {IDiscordEventRequest} event The incoming event to handle.
 * @param {Context} context The context to handle.
 * @param {Callback} callback The callback to run for this.
 * @return {string} A simple status code of what was run.
 */
export async function handler(event: IDiscordEventRequest, context: Context,
    callback: Callback): Promise<string> {
  console.log(`Running Discord command handler... ${JSON.stringify(event)}`);

  if (await verifyEvent(event)) {
    const response = await handleCommand(event);
    if (event.jsonBody.token && await sendResponse(response, event.jsonBody.token)) {
      console.log('Responded successfully!');
    } else {
      console.log('Failed to send response!');
    }
  } else {
    console.log('Invalid request!');
  }
  return '200';
}

export async function sendResponse(response: IDiscordResponseData,
  interactionToken: string): Promise<boolean> {
  const discordSecret = await getDiscordSecrets();
  const authConfig = {
    headers: {
      'Authorization': `Bot ${discordSecret?.authToken}`
    }
  };

  try {
    const url = `https://discord.com/api/v8/webhooks/${discordSecret?.applicationId}/${interactionToken}`;
    console.log(`URL #{url}`);
    return (await axios.post(url, response, authConfig)).status == 200;
  } catch (exception) {
    console.log(`There was an error posting a response: ${exception}`);
    return false;
  }
}


/**
 * Handles an incoming command for a user.
 * @param {IDiscordEventRequest} event The incoming event with the command to handle.
 * @return {IDiscordResponseData} Returns a response that can be outputted to the user.
 */
export async function handleCommand(event: IDiscordEventRequest): Promise<IDiscordResponseData> {
  return generateStandardResponse('MOO');
}

/**
 * A helper for generating a standard response for Discord.
 * @param {string} content The string content to return.
 * @param {Embed[]} embeds A list of embeds to return.
 * @return {IDiscordResponseData} The fully-formed response.
 */
function generateStandardResponse(content: string, embeds: Embed[] = []): IDiscordResponseData {
  return {
    tts: false,
    content,
    embeds,
    allowedMentions: [],
  };
}

