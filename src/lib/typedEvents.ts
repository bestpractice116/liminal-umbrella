/* eslint-disable @typescript-eslint/no-unsafe-function-type */
/* eslint-disable @typescript-eslint/no-unnecessary-type-parameters */
import EventEmitter from 'node:events';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EventMap = Record<string, any>;
type EventKey<T extends EventMap> = string & keyof T;
type EventReceiver<T> = (params: T) => void;

export interface Emitter<T extends EventMap> {
    on<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): EventEmitter;
    off<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): EventEmitter;
    emit<K extends EventKey<T>>(eventName: K, params: T[K]): boolean;
    once<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): EventEmitter;
    addListener<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): EventEmitter;
    prependListener<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): EventEmitter;
    prependOnceListener<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): EventEmitter;
    removeListener<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): EventEmitter;
    removeAllListeners<K extends EventKey<T>>(eventName: K): EventEmitter;
    setMaxListeners(arg0: number): EventEmitter;
    getMaxListeners(): number;
    listenerCount(eventName: string | symbol, listener?: Function): number;
    eventNames(): (string | symbol)[];
    listeners<K extends EventKey<T>>(eventName: K): Function[];
    rawListeners<K extends EventKey<T>>(eventName: K): Function[];
}

export class TypedEvent extends EventEmitter {}

export function createEmitter<T extends EventMap>(): Emitter<T> {
    return new TypedEvent();
}
