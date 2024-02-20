import axios from 'axios';
import { getDiscordSecrets } from './DiscordSecrets';
import {IDiscordResponseData} from '../../types';

export async function sendResponse(response: IDiscordResponseData,
  interactionToken: string): Promise<boolean> {
  const discordSecret = await getDiscordSecrets();
  const authConfig = {
    headers: {
      'Authorization': `Bot ${discordSecret?.authToken}`
    }
  };

  try {
    let url = `https://discord.com/api/v8/webhooks/${discordSecret?.applicationId}/${interactionToken}`;
    return (await axios.post(url, response, authConfig)).status == 200;
  } catch (exception) {
    console.log(`There was an error posting a response: ${exception}`);
    return false;
  }
}

