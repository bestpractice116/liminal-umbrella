import { Listener, container } from '@sapphire/framework';
import { ActivityCacheClear } from '../../../lib/events/index.js';
import { clearActivityCache } from '../activity.js';
import { CUSTOM_EVENTS } from '../../../lib/events.js';

export class randomActivityActivityCacheClearListener extends Listener {
	public constructor(context: Listener.LoaderContext, options: Listener.Options) {
		super(context, {
			...options,
			name: 'randomActivityCacheClearFive',
			emitter: container.events,
			event: CUSTOM_EVENTS.ActivityCacheClear
		});
	}
	run(_: ActivityCacheClear) {
		clearActivityCache();
	}
}
