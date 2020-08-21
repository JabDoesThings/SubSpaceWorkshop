import { CustomEvent } from './UIEvents';

/**
 * The <i>UIEventListener</i> abstract class. TODO: Document.
 *
 * @author Jab
 */
export abstract class CustomEventListener<E extends CustomEvent> {
  private listeners: ((event: E) => void | boolean)[] = [];
  private dispatching: boolean = false;

  /**
   * Dispatches a event.
   *
   * @param {E} event The event to pass.
   * @param {boolean} ignoreCancelled If true, the event will not check for cancellation.
   *
   * @return {boolean} Returns true if the event is cancelled.
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
   * @param {(event: E)=>void|boolean} callback
   */
  addEventListener(callback: (event: E) => void | boolean): void {
    this.listeners.push(callback);
  }

  /**
   * Removes a callback to be invoked when an event is dispatched.
   *
   * @param {(event: E)=>void|boolean} callback
   */
  removeEventListener(callback: (event: E) => (void | boolean)) {
    const newArray: ((event: E) => void | boolean)[] = [];
    for (let index = 0; index < this.listeners.length; index++) {
      const next = this.listeners[index];
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

export default CustomEventListener;
