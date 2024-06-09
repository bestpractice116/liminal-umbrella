import { methods, Route, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';

export class RootRoute extends Route {
  public constructor(context: Route.LoaderContext, options: Route.Options) {
    super(context, {
      ...options,
      route: ''
    });
  }

  public [methods.GET](request: ApiRequest, response: ApiResponse) {
    console.log(request.auth);
    response.html(200, `
  <!doctype html>
  <html>
    <head>
    <script src="/app"></script>
</head>
<body>
  <button onclick="doLogin()">Login</button>
</body>

    `);
  }

}
