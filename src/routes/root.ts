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
    const body = 'lol';
    response.html(200, `
  <!doctype html>
  <html>
    <head>
    </head>
<body>
  ${body}
</body>

    `);
  }

}
