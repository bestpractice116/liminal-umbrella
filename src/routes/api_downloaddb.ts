import { methods, Route, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';
import { AuthenticatedAdmin } from '../lib/api/decorators.js';
import { Sequential } from '../lib/utils.js';
import { DATABASE_FILENAME } from '../lib/database.js';
import * as fs from 'fs';

export class ApiBotplayingList extends Route {
	public constructor(context: Route.LoaderContext, options: Route.Options) {
		super(context, {
			...options,
			route: 'api/downloaddb'
		});
	}

	// Get current list
	@AuthenticatedAdmin()
	@Sequential
	public async [methods.GET](_request: ApiRequest, response: ApiResponse) {
		const stream = fs.createReadStream(DATABASE_FILENAME);
		response.setHeader('Content-Type', 'application/octet-stream');
		response.setHeader('Content-Disposition', 'attachment; filename="database.sqlite"');
		await new Promise<void>((resolve, reject) => {
			stream.on('end', () => {
				response.end();
				resolve();
			});
			stream.on('error', (e) => {
				reject(e);
			});
			stream.on('readable', () => {
				let chunk;
				while (null !== (chunk = stream.read())) {
					response.write(chunk);
				}
			});
		});
	}
}
