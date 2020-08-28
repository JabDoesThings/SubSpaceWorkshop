import ImageEditorInputEvent from './ImageEditorInputEvent';
import TileEditor from '../../../editor/tileset/TileEditor';
import ImageEditor from './ImageEditor';
import ImageEditorEventType from './ImageEditorEventType';
import TriggeredEvent = JQuery.TriggeredEvent;

/**
 * The <i>ImageEditorEvents</i> class. TODO: Document.
 *
 * @author Jab
 */
export default class ImageEditorEvents {
  readonly mouseListeners: ((event: ImageEditorInputEvent) => void)[];
  pressureDeadZone: number[] = [0.05, 1];

  /** @param {TileEditor} imageEditor */
  constructor(imageEditor: ImageEditor) {
    const paneContainer = imageEditor.content;
    const canvas = imageEditor.projectedDrawCanvas;
    const $paneContainer = $(paneContainer);
    // const $canvas = $(canvas);
    this.mouseListeners = [];

    let penDown = false;
    let down = false;
    let downButton = -999999;

    const pointerup = (e: PointerEvent) => {
      e.stopPropagation();
      if (down) {
        down = false;
        downButton = -999999;

        const type = penDown || e.pointerType === 'pen' ? ImageEditorEventType.PEN_UP : ImageEditorEventType.UP;
        penDown = false;

        this.dispatch({
          forced: true,
          eventType: 'ImageEditorInputEvent',
          data: {x: -999999, y: -999999, pressure: e.pressure},
          type,
          button: e.button,
          e
        });
      }
    };

    const pointerEnter = (e: any) => {
      e.stopPropagation();
      let coords = {x: e.offsetX, y: e.offsetY};
      if (e.target === paneContainer) {
        coords = imageEditor.camera.canvasToPaneCoordinates(coords.x, coords.y);
      }
      this.dispatch({
        forced: true,
        eventType: 'ImageEditorInputEvent',
        data: {x: coords.x, y: coords.y, pressure: e.originalEvent.pressure},
        type: ImageEditorEventType.ENTER,
        button: downButton,
        e: null,
      });
    };

    const pointerLeave = (e: TriggeredEvent<HTMLElement, undefined>) => {
      e.stopPropagation();
      let coords = {x: e.offsetX, y: e.offsetY};
      if (e.target === paneContainer) {
        coords = imageEditor.camera.canvasToPaneCoordinates(coords.x, coords.y);
      }
      this.dispatch({
        forced: true,
        eventType: 'ImageEditorInputEvent',
        data: {x: coords.x, y: coords.y, pressure: 0},
        type: ImageEditorEventType.EXIT,
        button: downButton,
        e: null,
      });
    };

    const clampPressure = (pressure: number): number => {
      if (pressure < this.pressureDeadZone[0]) {
        return 0;
      } else if (pressure > this.pressureDeadZone[1]) {
        return 1;
      }
      return (pressure - this.pressureDeadZone[0]) / (this.pressureDeadZone[1] - this.pressureDeadZone[0]);
    };

    const pointerDown = (e: any) => {
      if (e.target !== canvas && e.target !== paneContainer) {
        return;
      }

      e.stopPropagation();

      let coords = {x: e.offsetX, y: e.offsetY};
      if (e.target === paneContainer) {
        coords = imageEditor.camera.canvasToPaneCoordinates(coords.x, coords.y);
      }

      // console.log(`from: {x: ${e.offsetX}, y: ${e.offsetY}} to: {x: ${coords.x}, y: ${coords.y}}`);

      let type = ImageEditorEventType.DOWN;
      const origEvent = e.originalEvent;
      let pressure = origEvent.pressure;
      if (origEvent.pointerType === 'pen') {
        pressure = clampPressure(pressure);
        // if (pressure < this.pressureDeadZone[0]) {
        //   pressure = 0;
        //   type = TileEditorEventType.PEN_HOVER;
        // } else {
        type = ImageEditorEventType.PEN_DOWN;
        // }
      }

      down = true;
      downButton = e.button;
      this.dispatch({
        forced: true,
        eventType: 'ImageEditorInputEvent',
        data: {x: coords.x, y: coords.y, pressure},
        type,
        button: e.button,
        e: e
      });
    };

    const pointerUp = (e: any) => {
      if (!down) {
        return;
      }

      e.stopPropagation();

      let coords = {x: e.offsetX, y: e.offsetY};
      if (e.target === paneContainer) {
        coords = imageEditor.camera.canvasToPaneCoordinates(coords.x, coords.y);
      }

      const origEvent = e.originalEvent;
      let type = ImageEditorEventType.UP;
      let pressure = origEvent.pressure;
      if (penDown && origEvent.pointerType === 'pen') {
        type = ImageEditorEventType.PEN_UP;
        pressure = clampPressure(pressure);
      }

      down = false;
      penDown = false;
      downButton = -999999;

      this.dispatch({
        forced: true,
        eventType: 'ImageEditorInputEvent',
        data: {x: coords.x, y: coords.y, pressure},
        type,
        button: e.button,
        e: e
      });
    };

    const pointermove = (e: any) => {
      if (e.target !== canvas && e.target !== paneContainer) {
        return;
      }

      e.stopPropagation();

      let coords = {x: e.offsetX, y: e.offsetY};
      if (e.target === paneContainer) {
        coords = imageEditor.camera.canvasToPaneCoordinates(coords.x, coords.y);
      }
      // console.log(`from: {x: ${e.offsetX}, y: ${e.offsetY}} to: {x: ${coords.x}, y: ${coords.y}}`);


      let type = down ? ImageEditorEventType.DRAG : ImageEditorEventType.HOVER;
      const origEvent = e.originalEvent;
      let pressure = origEvent.pressure;
      if (penDown || origEvent.pointerType === 'pen') {
        pressure = clampPressure(pressure);
        if (penDown && pressure === 0) {
          down = false;
          penDown = false;
          this.dispatch({
            forced: true,
            eventType: 'ImageEditorInputEvent',
            data: {x: coords.x, y: coords.y, pressure},
            type: ImageEditorEventType.PEN_UP,
            button: e.button,
            e: e
          });
          return;
        }

        type = down ? ImageEditorEventType.PEN_DRAG : ImageEditorEventType.PEN_HOVER;
        this.dispatch({
          forced: true,
          eventType: 'ImageEditorInputEvent',
          data: {x: coords.x, y: coords.y, pressure},
          type,
          button: downButton,
          e: e,
        });
        return;
      }

      this.dispatch({
        forced: true,
        eventType: 'ImageEditorInputEvent',
        data: {x: coords.x, y: coords.y, pressure},
        type,
        button: downButton,
        e: e,
      });
    };

    const wheel = (e: any) => {
      e.stopPropagation();
      if (e.target !== canvas && e.target !== paneContainer) {
        return;
      }

      let coords = {x: e.offsetX, y: e.offsetY};
      if (e.target === paneContainer) {
        coords = imageEditor.camera.canvasToPaneCoordinates(coords.x, coords.y);
      }

      const type = e.deltaY < 0 ? ImageEditorEventType.WHEEL_UP : ImageEditorEventType.WHEEL_DOWN;
      this.dispatch({
        forced: true,
        eventType: 'ImageEditorInputEvent',
        data: {
          x: coords.x,
          y: coords.y,
          pressure: 0
        },
        type: type,
        button: 1,
        e: e
      });
      return false;
    };

    // const touchstart = (e: TouchStartEvent) => {
    //   console.log(e);
    // };
    // const touchmove = (e: TouchMoveEvent) => {
    //   console.log(e);
    // };
    // const touchend = (e: TouchEndEvent) => {
    //   console.log(e);
    // };
    //
    // $canvas.on('touchstart', touchstart);
    // $canvas.on('touchmove', touchmove);
    // $canvas.on('touchend', touchend);

    window.addEventListener('pointerup', pointerup);
    // $canvas.on('pointermove', pointermove);
    // $canvas.on('mousewheel', wheel);
    // $canvas.on('pointerleave', pointerLeave);
    // $canvas.on('pointerenter', pointerEnter);
    // $canvas.on('pointerdown', pointerDown);
    // $canvas.on('pointerup', pointerUp);
    // $paneContainer.on('pointerdown', pointerDown);
    // $paneContainer.on('pointermove', pointermove);
    // $paneContainer.on('pointerup', pointerUp);
    // $paneContainer.on('mousewheel', wheel);

    $paneContainer.on('pointermove', pointermove);
    $paneContainer.on('mousewheel', wheel);
    $paneContainer.on('pointerleave', pointerLeave);
    $paneContainer.on('pointerenter', pointerEnter);
    $paneContainer.on('pointerdown', pointerDown);
    $paneContainer.on('pointerup', pointerUp);
  }

  dispatch(event: ImageEditorInputEvent): void {
    if (this.mouseListeners.length != 0) {
      for (let index = 0; index < this.mouseListeners.length; index++) {
        this.mouseListeners[index](event);
      }
    }
  }

  addMouseListener(listener: (event: ImageEditorInputEvent) => void): void {
    // Make sure that the renderer doesn't have the listener.
    if (this.hasMouseListener(listener)) {
      throw new Error('The mouse listener is already registered.');
    }
    this.mouseListeners.push(listener);
  }

  removeMouseListener(listener: (event: ImageEditorInputEvent) => void): void {
    // Make sure that the renderer has the listener.
    if (!this.hasMouseListener(listener)) {
      throw new Error('The mouse listener is not registered.');
    }
    // If the listener is the last entry, simply pop it from the array.
    if (this.mouseListeners[this.mouseListeners.length - 1] === listener) {
      this.mouseListeners.pop();
      return;
    }
    const toAdd: ((event: ImageEditorInputEvent) => void)[] = [];
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

  hasMouseListener(listener: (event: ImageEditorInputEvent) => void) {
    for (let index = 0; index < this.mouseListeners.length; index++) {
      const next = this.mouseListeners[index];
      if (next === listener) {
        return true;
      }
    }
    return false;
  }
}
