import { PlannedGame } from '../lib/database/model.js';
import { GameSchema } from 'common/schema';
import { AuthenticatedWithRole } from '../lib/api/decorators.js';
import { isAdmin } from '../lib/api/auth.js';
import { methods, Route, type ApiRequest, type ApiResponse, HttpCodes } from '@sapphire/plugin-api';
import { Sequential } from '../lib/utils.js';

export class ApiGamePost extends Route {
	public constructor(context: Route.LoaderContext, options: Route.Options) {
		super(context, {
			...options,
			route: 'api/gamepost'
		});
	}

	async getRetrieveWhere(request: ApiRequest) {
		if (isAdmin(request)) {
			return {};
		}
		return { owner: request.auth!.id };
	}

	@AuthenticatedWithRole('Dungeon Master', true)
	@Sequential
	public async [methods.POST](request: ApiRequest, response: ApiResponse) {
		console.log('In GAMEPOST');
		const findSchema = GameSchema.find;
		if (!findSchema) {
			return response.notFound();
		}
		const { success, error, data } = findSchema.safeParse(request.body);
		if (!success) {
			response.status(HttpCodes.BadRequest).json({ status: 'error', error: error.issues });
			return null;
		}
		const item = await PlannedGame.findOne({ where: { ...data, ...(await this.getRetrieveWhere(request)) } });
		if (!item) {
			response.status(HttpCodes.NotFound).json({ status: 'error', error: 'Item not found' });
			return null;
		}

		console.log(item);

		response.status(HttpCodes.Created).json({ status: 'ok', datum: { key: item.key } });
	}
}
