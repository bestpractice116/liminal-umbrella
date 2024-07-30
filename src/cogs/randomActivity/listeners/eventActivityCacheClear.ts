import { Listener, container } from '@sapphire/framework';
import { ActivityCacheClear } from '../../../lib/events/index.js';
import { clearActivityCache } from '../activity.js';
import { CustomEvents } from '../../../lib/events.js';

export class randomActivityActivityCacheClearListener extends Listener {
	public constructor(context: Listener.LoaderContext, options: Listener.Options) {
		super(context, {
			...options,
			name: 'randomActivityCacheClearFive',
			emitter: container.events,
			event: CustomEvents.ActivityCacheClear
		});
	}
	run(_: ActivityCacheClear) {
		clearActivityCache();
	}
}
