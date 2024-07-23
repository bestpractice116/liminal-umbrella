import { User } from '../lib/database/model.js';
import { methods, Route, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';
import { AuthenticatedWithRole } from '../lib/api/decorators.js';
import { Sequential } from '../lib/utils.js';

export class ApiUsersAutoComplete extends Route {
	public constructor(context: Route.LoaderContext, options: Route.Options) {
		super(context, {
			...options,
			route: 'api/userautocomplete'
		});
	}

	getModel() {
		return User;
	}

	@Sequential
	@AuthenticatedWithRole('Dungeon Master', true)
	public async [methods.GET](_request: ApiRequest, response: ApiResponse) {
		const items = await User.findAll({
			where: { bot: false, left: false },
			order: ['nickname']
		});
		const res = items.map((item: User) => {
			return {
				key: item.key,
				nickname: item.nickname,
				avatarURL: item.avatarURL
			};
		});
		response.json(res);
	}
}
