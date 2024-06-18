import { Listener, container } from '@sapphire/framework';
import { ActivityCacheClear } from '../../../lib/events/index.js';
import { clearActivityCache } from '../activity.js';

export class randomActivityActivityCacheClearListener extends Listener {
  public constructor(context: Listener.LoaderContext, options: Listener.Options) {
    super(context, {
      ...options,
      name: 'randomActivityCacheClearFive',
      emitter: container.events,
      event: 'activityCacheClear'
    });
  }
  run (_: ActivityCacheClear) {
    clearActivityCache();
  }
}
