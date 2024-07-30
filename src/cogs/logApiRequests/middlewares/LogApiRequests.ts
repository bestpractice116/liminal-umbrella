import { Middleware } from '@sapphire/plugin-api';
import { ApiRequest, ApiResponse } from '@sapphire/plugin-api';
import { getChannelAndSend } from '../../verboseLog/utils.js';

export class LogApiRequests extends Middleware {
	public override run(request: ApiRequest, response: ApiResponse) {
		if (request.url == '/health' || request.url == '/metrics') return;
		const user = request.auth ? request.auth.nickname : 'ANON';
		getChannelAndSend(`API request - ${user}: ${request.method} ${request.url} - ${response.statusCode}`);
	}
}
