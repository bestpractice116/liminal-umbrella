import {Context, Callback} from 'aws-lambda';
import {verifyEvent} from './DiscordBotFunction';
import {DiscordEventRequest, DiscordResponseData} from '../constructs/DiscordBotConstruct';
import {sendResponse} from './utils/Discord';
import {Embed} from 'slash-commands';

/**
 * The actual handler for the lambda.
 * @param {DiscordEventRequest} event The incoming event to handle.
 * @param {Context} context The context to handle.
 * @param {Callback} callback The callback to run for this.
 * @return {string} A simple status code of what was run.
 */
export async function handler(event: DiscordEventRequest, context: Context,
    callback: Callback): Promise<string> {
  console.log('Running Discord command handler...');

  if (await verifyEvent(event)) {
    const response = await handleCommand(event);
    console.log('Sending response...');
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

/**
 * Handles an incoming command for a user.
 * @param {DiscordEventRequest} event The incoming event with the command to handle.
 * @return {DiscordResponseData} Returns a response that can be outputted to the user.
 */
export async function handleCommand(event: DiscordEventRequest): Promise<DiscordResponseData> {
  return generateStandardResponse('MOO');
}

/**
 * A helper for generating a standard response for Discord.
 * @param {string} content The string content to return.
 * @param {Embed[]} embeds A list of embeds to return.
 * @return {DiscordResponseData} The fully-formed response.
 */
function generateStandardResponse(content: string, embeds: Embed[] = []): DiscordResponseData {
  return {
    tts: false,
    content,
    embeds,
    allowed_mentions: [],
  };
}

