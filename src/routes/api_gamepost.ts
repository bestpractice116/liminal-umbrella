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

		return this.doGamePost(item, response);
	}

	async doGamePost(plannedgame: PlannedGame, response: ApiResponse) {
		try {
			const key = await plannedgame.postGame();
			response.status(HttpCodes.Created).json({ status: 'ok', datum: { key } });
		} catch (e) {
			response.status(HttpCodes.InternalServerError).json({ status: 'error', error: e });
		}
	}
}
