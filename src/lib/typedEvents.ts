import EventEmitter from 'node:events';

type EventMap = Record<string, any>;
type EventKey<T extends EventMap> = string & keyof T;
type EventReceiver<T> = (params: T) => void;

export interface Emitter<T extends EventMap> {
  on<K extends EventKey<T>>
    (eventName: K, fn: EventReceiver<T[K]>): EventEmitter;
  off<K extends EventKey<T>>
    (eventName: K, fn: EventReceiver<T[K]>): EventEmitter;
  emit<K extends EventKey<T>>
    (eventName: K, params: T[K]): boolean;
  once<K extends EventKey<T>>
    (eventName: K, fn: EventReceiver<T[K]>): EventEmitter;
  addListener<K extends EventKey<T>>
    (eventName: K, fn: EventReceiver<T[K]>): EventEmitter;
  prependListener<K extends EventKey<T>>
    (eventName: K, fn: EventReceiver<T[K]>): EventEmitter;
  prependOnceListener<K extends EventKey<T>>
    (eventName: K, fn: EventReceiver<T[K]>): EventEmitter;
  removeListener<K extends EventKey<T>>
    (eventName: K, fn: EventReceiver<T[K]>): EventEmitter;
  removeAllListeners<K extends EventKey<T>>
    (eventName: K): EventEmitter;
  setMaxListeners(arg0: number): EventEmitter;
  getMaxListeners(): number;
  listenerCount(eventName: string | symbol, listener?: Function | undefined): number;
  eventNames(): (string | symbol)[];
  listeners<K extends EventKey<T>>
    (eventName: K): Function[];
  rawListeners<K extends EventKey<T>>
    (eventName: K): Function[];
}

export class TypedEvent extends EventEmitter {};

export function createEmitter<T extends EventMap>(): Emitter<T> {
    return new TypedEvent();
}
