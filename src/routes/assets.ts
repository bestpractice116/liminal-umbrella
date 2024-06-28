import { methods, Route, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';
import { readFile } from 'fs';
import { extname } from 'path';

const mimeTypes : {[key: string]: string} = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm',
  '.ico' : 'image/x-icon'
};

export class RootRoute extends Route {
  public constructor(context: Route.LoaderContext, options: Route.Options) {
    super(context, {
      ...options,
      route: 'assets/:asset'
    });
  }

  public [methods.GET](request: ApiRequest, response: ApiResponse) {
    const name = String(extname(request.params.asset)).toLowerCase();
    const contentType: string = mimeTypes[name] || 'application/octet-stream';
    readFile('frontend/dist/assets/' + request.params.asset, function(error, content) {
      if (error) {
        response.writeHead(500);
        response.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
      }
      response.writeHead(200, { 'Content-Type': contentType });
      response.end(content, 'utf-8');
    })
  }
}
