import { TypedEvent } from '../lib/typedEvents.js';
import { TickFive, TickOneTwenty } from './events/index.js';
import { Guild } from 'discord.js';

export default class Ticker {
    events: TypedEvent;

    timeout: NodeJS.Timeout | undefined;

    guild: Guild | undefined;

    startTime: number;

    constructor(e: TypedEvent) {
        this.events = e;
        this.startTime = Date.now();

        this.doTimeout = this.doTimeout.bind(this);
        this.fireTickFiveTimeout = this.fireTickFiveTimeout.bind(this);
        this.fireTickOneTwentyTimeout = this.fireTickOneTwentyTimeout.bind(this);
    }

    start(guild: Guild) {
        const date = new Date();
        const secs = date.getSeconds();
        let remaining = 0;
        if (secs > 0) {
            remaining = 60 - secs;
        }
        this.timeout = setTimeout(this.doTimeout, remaining * 1000);
        this.guild = guild;
    }

    doTimeout() {
        const d = new Date();
        const mins = d.getMinutes();
        let doTickFiveCb = false;
        if (mins % 5 == 0) {
            doTickFiveCb = true;
        }
        let doTickOneTwentyTimeout = false;
        if (mins % 120 == 0) {
            doTickOneTwentyTimeout = true;
        }
        const secs = d.getSeconds();
        const remaining = 60 - secs;
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(this.doTimeout, remaining * 1000);
        if (doTickFiveCb) {
            this.fireTickFiveTimeout(d.getTime());
        }
        // Note we don't fire the tickOneTwentyTimeout if the bot has been running for less than 2 hours
        if (doTickOneTwentyTimeout && Date.now() - this.startTime > 1000 * 60 * 60 * 2) {
            this.fireTickOneTwentyTimeout(d.getTime());
        }
    }

    fireTickFiveTimeout(d: number) {
        this.events.emit('tickFive', new TickFive(d, this.guild!));
    }

    fireTickOneTwentyTimeout(d: number) {
        this.events.emit('tickOneTwenty', new TickOneTwenty(d, this.guild!));
    }
}
