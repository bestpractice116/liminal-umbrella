import { methods, Route, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';

export class OauthRoute extends Route {
	public constructor(context: Route.LoaderContext, options: Route.Options) {
		super(context, {
			...options,
			route: 'oauth/authorize'
		});
	}

	public [methods.GET](_request: ApiRequest, response: ApiResponse) {
		response.html(
			200,
			`
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
        }).then((response) => { response.text().then((body) => {
          if (response.ok) {
            const beforeLoginUrl = sessionStorage.getItem('beforeLogin') || '/';
            sessionStorage.removeItem('beforeLogin');
            window.location.replace(beforeLoginUrl)
            return
          }
          const error = 'response.status ' + response.status + ' content type ' + response.headers.get('content-type') + ' Body: ' + body
          const node = document.getElementById('error')
          node.appendChild(document.createTextNode(error))
          console.error(error)
        })})
      }
    </script>
  </head>
<body>
  <script>doRedirect()</script>
  <div id="error"></div>
</body>
    `
		);
	}
}
