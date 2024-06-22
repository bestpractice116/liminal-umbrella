import { methods, Route, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';

//import type { LoginData } from '@sapphire/plugin-api';

/*async function exchangeCodeForAccessToken() {
  //const codeSearchParam = new URL(window.location.href).searchParams.get('code');

  // Call the backend to exchange the code for an access token.
  const response = await fetch(`/oauth/callback`, {
    method: 'POST',
    body: JSON.stringify({
      code: codeSearchParam
    })
  });

  //const data = (await response.json()) as Promise<LoginData>;

  // Now store data somewhere so you can access it later.
  //localStorage.setItem('discord-data', JSON.stringify(data));

  // Lastly, send the user back to the home page or similar:
  //window.location.replace('/');
}*/

export class OauthRoute extends Route {
  public constructor(context: Route.LoaderContext, options: Route.Options) {
    super(context, {
      ...options,
      route: 'oauth/authorize'
    });
  }

  public [methods.GET](_request: ApiRequest, response: ApiResponse) {
    response.html(200, `
<!doctype html>
<html>
  <head>
    <script>
      function doRedirect() {
        const u = new URL(window.location.href)
        const codeSearchParam = u.searchParams.get('code')
        const redirectUri = u.protocol + '//' + u.host + '/oauth/authorize';
        // Call the backend to exchange the code for an access token.
        fetch('/oauth/callback', {
          method: 'POST',
          body: JSON.stringify({
            code: codeSearchParam,
            clientId: '${process.env.DISCORD_APPLICATION_ID}',
            redirectUri,
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        }).then(() => {
          const beforeLoginUrl = sessionStorage.getItem('beforeLogin') || '/';
          sessionStorage.removeItem('beforeLogin');
          window.location.replace(beforeLoginUrl)
        })
      }
    </script>
  </head>
<body>
  <script>doRedirect()</script>
</body>
    `);
  }

}
