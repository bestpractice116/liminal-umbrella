import { User } from '../lib/database/model.js';
import { methods, Route, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';
import { AuthenticatedWithRole } from '../lib/api/decorators.js';
import { Sequential } from '../lib/utils.js';
import { zodParseOrError } from '../lib/api/CRUD.js';
import { Op } from '@sequelize/core';
import * as z from 'zod';

const autoCompleteSchema = z.object({
	searchText: z
		.string()
		.trim()
		.min(2, { message: 'Search string must be at least 2 characters long' })
		.toLowerCase()
		.regex(/^[^%]+$/, { message: 'Search string cannot contain "%"' })
});

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
	// FIXME - can we make this a standard CRUD method and just customise the where clause?
	public async [methods.GET](request: ApiRequest, response: ApiResponse) {
		const data = zodParseOrError(autoCompleteSchema, request.query, response);
		if (!data) return;
		const items = await User.findAll({
			where: {
				bot: false,
				left: false,
				[Op.or]: {
					nickname: { [Op.like]: `${data.searchText}%` },
					username: { [Op.like]: `${data.searchText}%` }
				}
			},
			order: ['nickname']
		});
		// FIXME - do this mapping with a schema / in a more standard way?
		const res = items.map((item: User) => {
			return {
				username: item.username,
				key: item.key,
				nickname: item.nickname,
				avatarURL: item.avatarURL
			};
		});
		response.json(res);
	}
}
