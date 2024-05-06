import { Listener, container } from '@sapphire/framework';
import { TickFive } from '../../../lib/events/index.js';
import { pickActivity } from '../pick.js';

export class randomActivityTickFiveListener extends Listener {
  public constructor(context: Listener.LoaderContext, options: Listener.Options) {
    super(context, {
      ...options,
      name: 'randomActivityTTickFive',
      emitter: container.events,
      event: 'tickFive'
    });
  }
  run (_: TickFive) {
    // Fires every 5 minutes. We pick a random number between 0 (inclusive) and 1 (exclusive).
    // If that is < 0.02 (which should happen 2% of the time) then we change the activity.
    // On average this will mean we change every 4h 10m.

    /* The maths here...

      There is a 𝑝 chance that it is < 0.02 on the first try.
      Average number of tries for it to happen is m.

      Chance it won't happen on the first try is 1-p.

      With probability (1-p) the expected number of tries till first success is (1+m)
      With probability p the expected number of tries till first success is 1

      Therefore the average number of tries till success is:
      m = (1-p)*(1+m) + (p)*1
      m = p + (1-p)(m+1)
      m = p + 1(1-p) + m(1-p)
      m = 1 + m(1-p)
      m = 1 + m − mp
      0 = 1 −mp
      −mp = −1
      m = -1 / -p
      m = 1 / p

      m = 1 / 0.02
      m = 50

      50 x 5 minutes = 4h 10m
    */
    if (Math.random() < 0.02) {
      container.client.user?.setActivity(pickActivity());
    }
  }
}
