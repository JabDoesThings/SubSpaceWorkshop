import { TextureAtlasEvent } from '../render/SessionAtlas';

/**
 * The <i>UIEventListener</i> abstract class. TODO: Document.
 *
 * @author Jab
 */
export abstract class CustomEventListener<E extends CustomEvent> {

    private listeners: ((event: E) => void | boolean)[];
    private dispatching: boolean;

    /**
     * Main constructor.
     */
    protected constructor() {
        this.listeners = [];
        this.dispatching = false;
    }

    /**
     * Dispatches a event.
     *
     * @param event The event to pass.
     * @param ignoreCancelled If true, the event will not check for cancellation.
     *
     * @return Returns true if the event is cancelled.
     */
    dispatch(event: E, ignoreCancelled: boolean = false): boolean {

        if (this.dispatching) {
            return false;
        }

        if (event.forced) {
            ignoreCancelled = true;
        }

        this.dispatching = true;

        for (let index = 0; index < this.listeners.length; index++) {
            if (ignoreCancelled) {
                this.listeners[index](event);
            } else if (this.listeners[index](event)) {
                this.dispatching = false;
                return true;
            }
        }

        this.dispatching = false;

        return false;
    }

    /**
     * Adds a callback to be invoked when an event is dispatched.
     *
     * @param callback
     */
    addEventListener(callback: (event: E) => void | boolean): void {
        this.listeners.push(callback);
    }

    removeEventListener(callback: (event: E) => (void | boolean)) {
        let newArray: ((event: E) => void | boolean)[] = [];

        for (let index = 0; index < this.listeners.length; index++) {
            let next = this.listeners[index];
            if (next === callback) {
                continue;
            }
            newArray.push(next);
        }

        this.listeners = newArray;
    }

    clearEventListeners(): void {
        this.listeners = [];
    }
}

/**
 * The <i>CustomEvent</i> interface. TODO: Document.
 *
 * @author Jab
 */
export interface CustomEvent {
    eventType: string,
    forced: boolean
}
