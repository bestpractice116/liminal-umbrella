import { Middleware } from '@sapphire/plugin-api';
import { ApiRequest, ApiResponse } from '@sapphire/plugin-api';
import { getChannelAndSend } from '../../verboseLog/utils.js';

export class LogApiRequests extends Middleware {
	public override run(request: ApiRequest, _response: ApiResponse) {
		const user = request.auth ? request.auth.nickname : 'ANON';
		getChannelAndSend(`API request - ${user}: ${request.method} ${request.url}`);
	}
}
