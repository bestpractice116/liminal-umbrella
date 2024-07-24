import { Route, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';
import { GameSessionUserSignup, GameSession, User } from '../lib/database/model.js';
import { GameSessionUserSignupSchema, type GameSessionUserSignupCreate } from 'common/schema';
import { type SchemaBundle } from 'common/schema';
import { CR, MutationOperation } from '../lib/api/CRUD.js';
import { AuthenticatedWithRole } from '../lib/api/decorators.js';
import { isAdmin } from '../lib/api/auth.js';

export class ApiGameSessionUserSignupsList extends CR {
	public constructor(context: Route.LoaderContext, options: Route.Options) {
		super(context, {
			...options,
			route: 'api/gamesessionusersignups'
		});
	}

	getModel() {
		return GameSessionUserSignup;
	}
	getSchema(): SchemaBundle {
		return GameSessionUserSignupSchema;
	}

	// There is no list all game signups endpoint
	override async auth_GET(_request: ApiRequest, response: ApiResponse) {
		return response.notFound();
	}

	@AuthenticatedWithRole('Dungeon Master', true)
	override async auth_CREATE(_request: ApiRequest, _response: ApiResponse) {}

	override async CREATE_coerce(request: ApiRequest, response: ApiResponse, data: GameSessionUserSignupCreate) {
		// Check we are about to create a session signup to a known session.
		// This should be caught at the database level with the foreign key, but this returns a 404 rather than a 5xx
		// and we need the GameSession object to check permissions anyway.
		const session = await GameSession.findOne({ where: { key: data.gameSessionKey } });
		if (!session) {
			return response.notFound();
		}
		if (!isAdmin(request)) {
			// If user is not an admin, check they own the session before allowing adding a user
			if (session.owner != request.auth!.id) {
				return response.notFound('Game session does not exist, or is not owned by current user');
			}
		}
		// Also check for valid / known user. This is needed as the DB constraint will not check for bots/left users,
		// so we could end up signing up bots or users who don't exist any more to sessions
		// This also returns 404 rather than 5xx so is nicer.
		const user = await User.findOne({
			where: {
				left: false,
				bot: false,
				key: data.userKey
			}
		});
		if (!user) {
			return response.notFound('Tried to sign up unknown user for game session');
		}
		const currentUsers = await session.getSignedupUsers();
		if (!!currentUsers.find((currentUser) => currentUser.key == user.key)) {
			return response.badRequest('This player is already signed up to this game');
		}
		if (session.maxplayers <= currentUsers.length) {
			return response.badRequest('Game already has maximum number of players, cannot add more');
		}
		return data;
	}

	@AuthenticatedWithRole('Dungeon Master', true)
	override async auth_DELETE(_request: ApiRequest, _response: ApiResponse) {}

	public override async DELETE_disallowed(item: GameSessionUserSignup, request: ApiRequest): Promise<string | undefined> {
		if (!isAdmin(request)) return;
		const session = await item.getSignedupGameSession();
		if (!session) return; // Should not be possible, but if the game session had gone away, allow deleting the link!
		if (session.owner != request.auth!.id) {
			return 'You cannot delete signups for a game which you do not own';
		}
		return;
	}

	override async onMutation(item: GameSessionUserSignup, op: MutationOperation) {
		const session = await item.getSignedupGameSession();
		if (op == MutationOperation.DELETE) {
			await session?.removeMemberFromGameThread(item.userKey);
		}
		if (op == MutationOperation.CREATE) {
			await session?.addMemberToGameThread(item.userKey);
		}
		await session?.updateGameListing();
	}
}
