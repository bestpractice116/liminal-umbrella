import { Listener, container } from '@sapphire/framework';

export class FooListener extends Listener {
  public constructor(context: Listener.LoaderContext, options: Listener.Options) {
    console.log("CONSTRUCT FOO LISTENER");
    super(context, {
      ...options,
      emitter: container.events,
      event: 'foo'
    });
  }
  run (fooarg: string) {
    console.log("FOO EVENT arg " + fooarg);
  }
}