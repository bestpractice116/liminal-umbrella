import { methods, Route, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';

import type { LoginData } from '@sapphire/plugin-api';

async function exchangeCodeForAccessToken() {
  const codeSearchParam = new URL(window.location.href).searchParams.get('code');

  // Call the backend to exchange the code for an access token.
  const response = await fetch(`/oauth/callback`, {
    method: 'POST',
    body: JSON.stringify({
      code: codeSearchParam
    })
  });

  const data = (await response.json()) as Promise<LoginData>;

  // Now store data somewhere so you can access it later.
  localStorage.setItem('discord-data', JSON.stringify(data));

  // Lastly, send the user back to the home page or similar:
  window.location.replace('/');
}

export class UserRoute extends Route {
  public constructor(context: Route.LoaderContext, options: Route.Options) {
    super(context, {
      ...options,
      route: 'oauth/authorize'
    });
  }

  public [methods.GET](_request: ApiRequest, response: ApiResponse) {
    response.json({ message: 'Hello World' });
  }

  public [methods.POST](_request: ApiRequest, response: ApiResponse) {
    response.json({ message: 'Hello World' });
  }
}