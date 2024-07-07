import { methods, Route, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';

export class DiscordRedirectRoute extends Route {
	public constructor(context: Route.LoaderContext, options: Route.Options) {
		super(context, {
			...options,
			route: 'oauth/discordredirect'
		});
	}

	public [methods.GET](request: ApiRequest, response: ApiResponse) {
		const redirect_uri = request.query.redirect_uri as string;
		if (!redirect_uri) {
			return response.badRequest();
		}
		const oauthURL = new URL('https://discord.com/oauth2/authorize');
		oauthURL.search = new URLSearchParams([
			['redirect_uri', redirect_uri],
			['response_type', 'code'],
			['scope', ['identify'].join(' ')],
			['client_id', process.env.DISCORD_APPLICATION_ID]
		]).toString();
		response.statusCode = 302;
		response.setHeader('Location', oauthURL.toString());
		response.end('');
	}
}
