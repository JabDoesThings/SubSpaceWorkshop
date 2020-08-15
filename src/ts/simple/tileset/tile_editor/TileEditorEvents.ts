import TileEditor from './TileEditor';
import TriggeredEvent = JQuery.TriggeredEvent;
import TouchStartEvent = JQuery.TouchStartEvent;
import TouchMoveEvent = JQuery.TouchMoveEvent;
import TouchEndEvent = JQuery.TouchEndEvent;
import MouseDownEvent = JQuery.MouseDownEvent;

/**
 * The <i>RenderEvents</i> class. TODO: Document.
 *
 * @author Jab
 */
export class TileEditorEvents {

  readonly mouseListeners: ((event: TileEditorEvent) => void)[];

  pressureDeadZone: number[] = [0.05, 1];

  /**
   * @constructor
   *
   * @param {TileEditor} tileEditor
   */
  constructor(tileEditor: TileEditor) {
    const paneContainer = tileEditor.paneContainer;
    const canvas = tileEditor.canvas;
    const $canvas = $(canvas);
    const $paneContainer = $(paneContainer);
    this.mouseListeners = [];

    let penDown = false;
    let down = false;
    let downButton = -999999;

    const pointerup = (e: PointerEvent) => {
      e.stopPropagation();
      if (down) {
        down = false;
        downButton = -999999;

        const type = penDown || e.pointerType === 'pen' ? TileEditorEventType.PEN_UP : TileEditorEventType.UP;
        penDown = false;

        this.dispatch({data: {x: -999999, y: -999999, pressure: e.pressure}, type, button: e.button, e: e});
      }
    };

    const pointerEnter = (e: any) => {
      e.stopPropagation();
      this.dispatch({
        data: {x: e.offsetX, y: e.offsetY, pressure: e.originalEvent.pressure},
        type: TileEditorEventType.ENTER,
        button: downButton,
        e: null,
      });
    };

    const pointerLeave = (e: TriggeredEvent<HTMLElement, undefined>) => {
      e.stopPropagation();
      this.dispatch({
        data: {x: e.offsetX, y: e.offsetY, pressure: 0},
        type: TileEditorEventType.EXIT,
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

      let type = TileEditorEventType.DOWN;
      const origEvent = e.originalEvent;
      let pressure = origEvent.pressure;
      if (origEvent.pointerType === 'pen') {
        pressure = clampPressure(pressure);
        // if (pressure < this.pressureDeadZone[0]) {
        //   pressure = 0;
        //   type = TileEditorEventType.PEN_HOVER;
        // } else {
        type = TileEditorEventType.PEN_DOWN;
        // }
      }

      down = true;
      downButton = e.button;
      this.dispatch({
        data: {x: e.offsetX, y: e.offsetY, pressure},
        type,
        button: e.button,
        e: e
      });
    };

    const pointerUp = (e: any) => {
      if (down) {
        return;
      }

      e.stopPropagation();

      const origEvent = e.originalEvent;
      let type = TileEditorEventType.UP;
      let pressure = origEvent.pressure;
      if (penDown && origEvent.pointerType === 'pen') {
        type = TileEditorEventType.PEN_UP;
        pressure = clampPressure(pressure);
      }

      down = false;
      penDown = false;
      downButton = -999999;

      this.dispatch({
        data: {x: e.offsetX, y: e.offsetY, pressure},
        type,
        button: e.button,
        e: e
      });
    };

    const pointermove = (e: any) => {
      e.stopPropagation();

      let type = down ? TileEditorEventType.DRAG : TileEditorEventType.HOVER;
      const origEvent = e.originalEvent;
      let pressure = origEvent.pressure;
      if (penDown || origEvent.pointerType === 'pen') {
        pressure = clampPressure(pressure);
        if (penDown && pressure === 0) {
          down = false;
          penDown = false;
          this.dispatch({
            data: {x: e.offsetX, y: e.offsetY, pressure},
            type: TileEditorEventType.PEN_UP,
            button: e.button,
            e: e
          });
          return;
        }

        type = down ? TileEditorEventType.PEN_DRAG : TileEditorEventType.PEN_HOVER;
        this.dispatch({
          data: {x: e.offsetX, y: e.offsetY, pressure},
          type,
          button: downButton,
          e: e,
        });
        return;
      }

      this.dispatch({
        data: {x: e.offsetX, y: e.offsetY, pressure},
        type,
        button: downButton,
        e: e,
      });
    };

    const wheel = (e: any) => {
      e.stopPropagation();
      if (e.target !== canvas && e.target !== tileEditor.paneContainer) {
        return;
      }
      const type = e.deltaY < 0 ? TileEditorEventType.WHEEL_UP : TileEditorEventType.WHEEL_DOWN;
      this.dispatch({
        data: {
          x: e.offsetX,
          y: e.offsetY,
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
    $canvas.on('pointermove', pointermove);
    $canvas.on('mousewheel', wheel);
    $canvas.on('pointerleave', pointerLeave);
    $canvas.on('pointerenter', pointerEnter);
    $canvas.on('pointerdown', pointerDown);
    $canvas.on('pointerup', pointerUp);

    $paneContainer.on('pointerdown', pointerDown);
    $paneContainer.on('pointermove', pointermove);
    $paneContainer.on('pointerup', pointerUp);
    $paneContainer.on('mousewheel', wheel);
  }

  dispatch(event: TileEditorEvent): void {
    if (this.mouseListeners.length != 0) {
      for (let index = 0; index < this.mouseListeners.length; index++) {
        this.mouseListeners[index](event);
      }
    }
  }

  addMouseListener(listener: (event: TileEditorEvent) => void): void {
    // Make sure that the renderer doesn't have the listener.
    if (this.hasMouseListener(listener)) {
      throw new Error('The mouse listener is already registered.');
    }
    this.mouseListeners.push(listener);
  }

  removeMouseListener(listener: (event: TileEditorEvent) => void): void {
    // Make sure that the renderer has the listener.
    if (!this.hasMouseListener(listener)) {
      throw new Error('The mouse listener is not registered.');
    }
    // If the listener is the last entry, simply pop it from the array.
    if (this.mouseListeners[this.mouseListeners.length - 1] === listener) {
      this.mouseListeners.pop();
      return;
    }
    const toAdd: ((event: TileEditorEvent) => void)[] = [];
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

  hasMouseListener(listener: (event: TileEditorEvent) => void) {
    for (let index = 0; index < this.mouseListeners.length; index++) {
      const next = this.mouseListeners[index];
      if (next === listener) {
        return true;
      }
    }
    return false;
  }
}

/**
 * The <i>TileEditorEventType</i> enum. TODO: Document.
 *
 * @author Jab
 */
export enum TileEditorEventType {
  DOWN = 'down',
  UP = 'up',
  DRAG = 'drag',
  PEN_DOWN = 'pen_down',
  PEN_UP = 'pen_up',
  PEN_DRAG = 'pen_drag',
  PEN_HOVER = 'pen_hover',
  HOVER = 'hover',
  ENTER = 'enter',
  EXIT = 'exit',
  WHEEL_UP = 'wheel_up',
  WHEEL_DOWN = 'wheel_down'
}

/**
 * The <i>TileEditorEvent</i> interface. TODO: Document.
 *
 * @author Jab
 */
export interface TileEditorEvent {
  type: TileEditorEventType;
  data: { x: number, y: number, pressure: number };
  button: number;
  e: any;
}
