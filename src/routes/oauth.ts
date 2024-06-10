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
   async function foo() {
    const codeSearchParam = new URL(window.location.href).searchParams.get('code');
  console.log('CODE FROM DISCORD AUTH', codeSearchParam);
  // Call the backend to exchange the code for an access token.
  const response = await fetch('/oauth/callback', {
    method: 'POST',
    body: JSON.stringify({
      code: codeSearchParam,
      clientId: '${process.env.DISCORD_APPLICATION_ID}',
      redirectUri: 'http://127.0.0.1:5173/oauth/authorize',
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  });

  const data = (await response.json());
  console.log(data);
  window.location.replace('/');
   }
  </script>
</head>
<body>
  <script>foo()</script>

</body>

    `);
  }

}
