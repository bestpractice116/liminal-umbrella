import {TypedEvent} from '../lib/typedEvents.js';
import {TickFive} from './events/index.js';

export default class Ticker {
    events: TypedEvent;

    timeout: NodeJS.Timeout | undefined;

    constructor(e: TypedEvent) {
        this.events = e;

        this.doTimeout = this.doTimeout.bind(this);
        this.fireTimeout = this.fireTimeout.bind(this);
    }

    start() {
        const date = new Date();
        const secs = date.getSeconds();
        let remaining = 0;
        if (secs > 0) {
            remaining = 60-secs;
        }
        this.timeout = setTimeout(this.doTimeout, remaining * 1000);
    }

    doTimeout() {
        const d = new Date();
        const mins = d.getMinutes();
        let doCb = false;
        if ((mins % 5) == 0) {
            doCb = true;
        }
        const secs = d.getSeconds();
        const remaining = 60-secs;
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(this.doTimeout, remaining * 1000);
        if (doCb) {
            this.fireTimeout(d.getTime());
        }
    }

    fireTimeout(d: number) {
        this.events.emit('tickFive', new TickFive(d));
    }
}