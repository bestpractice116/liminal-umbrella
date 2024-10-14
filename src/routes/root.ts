import { methods, Route, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';
import { readFile } from 'fs';

export function serveRoot(_request: ApiRequest, response: ApiResponse) {
    readFile('frontend/dist/index.html', function (error, content) {
        if (error) {
            response.writeHead(500);
            response.end(`Sorry, check with the site admin for error: ${error.code} ..\n`);
        }
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.end(content, 'utf-8');
    });
}

export class RootRoute extends Route {
    public constructor(context: Route.LoaderContext, options: Route.Options) {
        super(context, {
            ...options,
            route: ''
        });
    }

    public [methods.HEAD](request: ApiRequest, response: ApiResponse) {
        serveRoot(request, response);
    }
    public [methods.GET](request: ApiRequest, response: ApiResponse) {
        serveRoot(request, response);
    }
}
