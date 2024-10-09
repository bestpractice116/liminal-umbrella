import { Middleware } from '@sapphire/plugin-api';
import { ApiRequest, ApiResponse } from '@sapphire/plugin-api';

export class SlowResponseForDebug extends Middleware {
    public constructor(context: Middleware.LoaderContext, options: Middleware.Options = {} as Middleware.Options) {
        super(context, options);
        this.enabled = (process.env.NODE_ENV == 'development' && !!process.env.RPGBOT_SLOW_RESPONSE) || false;
    }

    public override async run(request: ApiRequest, _response: ApiResponse) {
        const logger = this.container.logger;
        await new Promise<void>((resolve, _reject) => {
            logger.debug(`Slow: ${request.method} ${request.url}`);
            setTimeout(() => {
                resolve();
            }, 10000);
        });
    }
}
