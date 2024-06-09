import { methods, Route, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';

export class RootRoute extends Route {
  public constructor(context: Route.LoaderContext, options: Route.Options) {
    super(context, {
      ...options,
      route: ''
    });
  }

  public [methods.GET](_request: ApiRequest, response: ApiResponse) {
    response.html(200, `
  <!doctype html>
  <html>
    <head>
      <script>
    function redirect() {
      const DiscordOauthURL = 'https://discord.com/oauth2/authorize';

      const oauthURL = new URL(DiscordOauthURL);
      oauthURL.search = new URLSearchParams([
        ['redirect_uri', 'http://127.0.0.1:8080/oauth/authorize'],
        ['response_type', 'code'],
        ['scope', ['identify'].join(' ')],
        ['client_id', '${process.env.DISCORD_APPLICATION_ID}']
      ]).toString();
      window.location.replace(oauthURL);
    }
  </script>
</head>
<body>
  <button onclick="redirect()">Login</button>
</body>

    `);
  }

}
