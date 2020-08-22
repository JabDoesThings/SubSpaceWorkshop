import Renderer from './Renderer';
import MapMouseEventType from '../MapMouseEventType';
import MapMouseEvent from '../MapMouseEvent';

/**
 * The <i>RenderEvents</i> class. TODO: Document.
 *
 * @author Jab
 */
class RenderEvents {
  readonly mouseListeners: ((event: MapMouseEvent) => void)[] = [];
  readonly renderer: Renderer;

  /**
   * @param renderer
   */
  constructor(renderer: Renderer) {
    this.renderer = renderer;
    this.renderer.app.stage.interactive = true;

    let down = false;
    let downButton = -999999;

    window.addEventListener('pointerup', (e) => {
      down = false;
      downButton = -999999;
      this.dispatch({data: null, type: MapMouseEventType.UP, button: e.button, e: e});
    });

    this.renderer.app.view.addEventListener('pointerleave', (e) => {
      const sx = e.offsetX;
      const sy = e.offsetY;
      const sw = this.renderer.app.screen.width;
      const sh = this.renderer.app.screen.height;
      const mapSpace = this.renderer.camera.toMapSpace(sx, sy, sw, sh);

      this.dispatch({
        data: mapSpace,
        type: MapMouseEventType.EXIT,
        button: downButton,
        e: null,
      });
    });

    this.renderer.app.view.addEventListener('pointerenter', (e) => {
      const sx = e.offsetX;
      const sy = e.offsetY;
      const sw = this.renderer.app.screen.width;
      const sh = this.renderer.app.screen.height;
      const mapSpace = this.renderer.camera.toMapSpace(sx, sy, sw, sh);

      this.dispatch({
        data: mapSpace,
        type: MapMouseEventType.ENTER,
        button: downButton,
        e: null,
      });
    });

    this.renderer.app.view.addEventListener('pointerdown', (e) => {
      down = true;
      downButton = e.button;

      const sx = e.offsetX;
      const sy = e.offsetY;
      const sw = this.renderer.app.screen.width;
      const sh = this.renderer.app.screen.height;
      const mapSpace = this.renderer.camera.toMapSpace(sx, sy, sw, sh);

      this.dispatch({data: mapSpace, type: MapMouseEventType.DOWN, button: e.button, e: e});
    });

    this.renderer.app.view.addEventListener('pointerup', (e) => {
      down = false;
      downButton = -999999;

      const sx = e.offsetX;
      const sy = e.offsetY;
      const sw = this.renderer.app.screen.width;
      const sh = this.renderer.app.screen.height;
      const mapSpace = this.renderer.camera.toMapSpace(sx, sy, sw, sh);

      this.dispatch({data: mapSpace, type: MapMouseEventType.UP, button: e.button, e: e});
    });

    this.renderer.app.view.addEventListener('pointermove', (e) => {
      const sx = e.offsetX;
      const sy = e.offsetY;
      const sw = this.renderer.app.screen.width;
      const sh = this.renderer.app.screen.height;
      const mapSpace = this.renderer.camera.toMapSpace(sx, sy, sw, sh);

      this.dispatch({
        data: mapSpace,
        type: down ? MapMouseEventType.DRAG : MapMouseEventType.HOVER,
        button: downButton,
        e: e,
      });
    });

    this.renderer.app.view.addEventListener('wheel', (e: WheelEvent) => {
      const sx = e.offsetX;
      const sy = e.offsetY;
      const sw = this.renderer.app.screen.width;
      const sh = this.renderer.app.screen.height;
      const mapSpace = this.renderer.camera.toMapSpace(sx, sy, sw, sh);
      const type = e.deltaY < 0 ? MapMouseEventType.WHEEL_UP : MapMouseEventType.WHEEL_DOWN;
      this.dispatch({data: mapSpace, type: type, button: 1, e: e});
      return false;
    }, false);
  }

  dispatch(event: MapMouseEvent): void {
    if (this.mouseListeners.length != 0) {
      for (let index = 0; index < this.mouseListeners.length; index++) {
        this.mouseListeners[index](event);
      }
    }
  }

  addMouseListener(listener: (event: MapMouseEvent) => void): void {
    // Make sure that the renderer doesn't have the listener.
    if (this.hasMouseListener(listener)) {
      throw new Error('The mouse listener is already registered.');
    }
    this.mouseListeners.push(listener);
  }

  removeMouseListener(listener: (event: MapMouseEvent) => void): void {
    // Make sure that the renderer has the listener.
    if (!this.hasMouseListener(listener)) {
      throw new Error('The mouse listener is not registered.');
    }

    // If the listener is the last entry, simply pop it from the array.
    if (this.mouseListeners[this.mouseListeners.length - 1] === listener) {
      this.mouseListeners.pop();
      return;
    }

    const toAdd: ((event: MapMouseEvent) => void)[] = [];

    // Go through each entry until the one to remove is found.
    while (true) {
      const next = this.mouseListeners.pop();
      if (next === listener) {
        break;
      }

      toAdd.push(next);
    }

    // Add them back in reverse order to preserve the original sequence.
    for (let index = toAdd.length - 1; index >= 0; index--) {
      this.mouseListeners.push(toAdd[index]);
    }
  }

  hasMouseListener(listener: (event: MapMouseEvent) => void) {
    for (let index = 0; index < this.mouseListeners.length; index++) {
      const next = this.mouseListeners[index];
      if (next === listener) {
        return true;
      }
    }
    return false;
  }
}

export default RenderEvents;
