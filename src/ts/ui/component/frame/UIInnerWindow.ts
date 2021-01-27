import MouseMoveEvent = JQuery.MouseMoveEvent;
import UIMenuBar from '../UIMenuBar';
import UIInnerWindowOptions from './UIInnerWindowOptions';
import { Anchor } from '../../UIProperties';
import WindowDimensions from './WindowDimensions';
import Dimensions from './Dimensions';

const $win = $(window);

/**
 * The <i>UIInnerWindow</i> class. TODO: Document.
 *
 * @author Jab
 */
abstract class UIInnerWindow {
  element: HTMLElement;
  content: HTMLElement;
  menuBar: UIMenuBar;
  isOpen: boolean;
  protected enabled: boolean = false;
  protected $element: JQuery;
  // private offset: number[] = [0, 0];
  private minimizeButton: HTMLElement;
  private resizeButton: HTMLElement;
  private closeButton: HTMLElement;
  protected resizePane: HTMLElement;
  protected options: UIInnerWindowOptions;
  private $parent: JQuery;
  private dimensions: Dimensions;
  isMaximized: boolean = false;
  private resizeButtonIcon: HTMLElement;

  protected constructor(element: HTMLElement, options: UIInnerWindowOptions = {
    canMinimize: false,
    canResize: false,
    canClose: true,
    dimensions: null,
    anchor: Anchor.CENTER
  }) {
    this.element = element;
    this.options = options;
    this.$element = $(element);
    this.element.style.display = 'none';
    this.content = <HTMLElement> this.element.getElementsByClassName('content').item(0);
    if (options.dimensions != null) {
      this.dimensions = {
        x: options.dimensions.dimensions.x,
        y: options.dimensions.dimensions.y,
        width: options.dimensions.dimensions.width,
        height: options.dimensions.dimensions.height,
      };
    } else {
      this.dimensions = {
        x: 0,
        y: 0,
        width: 800,
        height: 600
      };
    }

    const menuBarElementCheck = this.element.getElementsByClassName('menu-bar');
    if (menuBarElementCheck.length !== 0) {
      this.menuBar = new UIMenuBar(<HTMLElement> menuBarElementCheck.item(0));
    } else {
      this.menuBar = new UIMenuBar();
    }

    // Title buttons
    const titleBar = <HTMLElement> element.getElementsByClassName('window-title').item(0);
    let titleButtons = <HTMLElement> titleBar.getElementsByClassName('window-title-buttons').item(0);
    if (titleButtons == null) {
      this.minimizeButton = document.createElement('div');
      this.minimizeButton.classList.add('window-title-button', 'window-title-minimize-button');

      let i = document.createElement('i');
      i.classList.add('fas', 'fa-minus');
      this.minimizeButton.appendChild(i);

      this.resizeButton = document.createElement('div');
      this.resizeButton.classList.add('window-title-button', 'window-title-resize-button');

      i = document.createElement('i');
      i.classList.add('far', 'fa-window-maximize');
      this.resizeButton.appendChild(i);

      this.closeButton = document.createElement('div');
      this.closeButton.classList.add('window-title-button', 'window-title-close-button');

      i = document.createElement('i');
      i.classList.add('fas', 'fa-times');
      this.closeButton.appendChild(i);

      titleButtons = document.createElement('div');
      titleButtons.classList.add('window-title-buttons');
      titleButtons.appendChild(this.minimizeButton);
      titleButtons.appendChild(this.resizeButton);
      titleButtons.appendChild(this.closeButton);

      titleBar.appendChild(titleButtons);
    } else {
      this.minimizeButton = <HTMLElement> titleButtons.getElementsByClassName('window-title-minimize-button').item(0);
      this.resizeButton = <HTMLElement> titleButtons.getElementsByClassName('window-title-resize-button').item(0);
      this.closeButton = <HTMLElement> titleButtons.getElementsByClassName('window-title-close-button').item(0);
    }

    this.resizeButtonIcon = <HTMLElement> this.resizeButton.children.item(0);

    $(this.closeButton).on('click', () => {
      if (this.enabled && this.canClose()) {
        this.close(true);
      }
    });

    $(this.resizeButton).on('click', () => {
      if (this.enabled && this.canResize()) {
        if (this.isMaximized) {
          this.restore();
        } else {
          this.maximize();
        }
      }
    });
    if (options.canMinimize) {
      this.minimizeButton.style.display = 'inline-block';
    } else {
      this.minimizeButton.style.display = 'none';
    }
    if (options.canResize) {
      this.resizeButton.style.display = 'inline-block';
    } else {
      this.resizeButton.style.display = 'none';
    }
    if (options.canClose) {
      this.closeButton.style.display = 'inline-block';
    } else {
      this.closeButton.style.display = 'none';
    }

    // Resize pane
    const resizePaneCheck = element.getElementsByClassName('resize-pane');
    if (resizePaneCheck.length !== 0) {
      this.resizePane = <HTMLElement> resizePaneCheck.item(0);
    } else {
      this.resizePane = document.createElement('div');
      this.resizePane.classList.add('resize-pane');
      this.element.appendChild(this.resizePane);
    }
    this.resizePane.style.display = options.canResize ? 'inline-block' : 'none';

    let cursor: string = 'default';
    let resizeType: 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'none' = 'none';

    const updateResizeType = (offsetX: number, offsetY: number) => {
      const width = $resizePane.width();
      const height = $resizePane.height();
      resizeType = 'none';
      if (offsetX < 8) {
        if (offsetY < 8) {
          resizeType = 'nw';
        } else if (offsetY > height - 9) {
          resizeType = 'sw';
        } else {
          resizeType = 'w';
        }
      } else if (offsetX > width - 9) {
        if (offsetY < 8) {
          resizeType = 'ne';
        } else if (offsetY > height - 9) {
          resizeType = 'se';
        } else {
          resizeType = 'e';
        }
      } else if (offsetY < 8) {
        if (offsetX < 8) {
          resizeType = 'nw';
        } else if (offsetX > width - 9) {
          resizeType = 'ne';
        } else {
          resizeType = 'n';
        }
      } else if (offsetY > height - 9) {
        if (offsetX < 8) {
          resizeType = 'sw';
        } else if (offsetX > width - 9) {
          resizeType = 'se';
        } else {
          resizeType = 's';
        }
      }

      switch (resizeType) {
        case 'w':
          cursor = 'w-resize';
          break;
        case 'nw':
          cursor = 'nw-resize';
          break;
        case 'sw':
          cursor = 'sw-resize';
          break;
        case 'n':
          cursor = 'n-resize';
          break;
        case 'ne':
          cursor = 'ne-resize';
          break;
        case 's':
          cursor = 'n-resize';
          break;
        case 'se':
          cursor = 'se-resize';
          break;
        case 'e':
          cursor = 'w-resize';
          break;
        default:
          cursor = null;
          break;
      }

      this.resizePane.style.cursor = cursor;
    };

    let resizing: boolean = false;
    const last: { x: number, y: number } = {x: 0, y: 0};
    const current: { x: number, y: number } = {x: 0, y: 0};
    const delta: { x: number, y: number } = {x: 0, y: 0};
    let down: boolean = false;

    const $resizePane = $(this.resizePane);
    $resizePane.on('pointerenter', (event) => {
      if (!resizing) {
        updateResizeType(event.offsetX, event.offsetY);
      }
    });
    $resizePane.on('pointerleave', (event) => {
      if (!resizing) {
        updateResizeType(event.offsetX, event.offsetY);
      }
    });

    $resizePane.on('pointermove', (event) => {
      if (!resizing) {
        updateResizeType(event.offsetX, event.offsetY);
      }
    });
    $resizePane.on('pointerdown', (event) => {
      down = true;
      updateResizeType(event.offsetX, event.offsetY);
      if (resizeType !== 'none') {
        resizing = true;
        this.resizePane.style.zIndex = `20`;
      }
    });
    $resizePane.on('pointerup', (event) => {
      if (resizing) {
        resizing = false;
      }
      this.resizePane.style.zIndex = `-1`;
    });

    $win.on('pointerup', (event) => {
      down = false;
      resizing = false;
    });
    $win.on('pointermove', (event) => {
      current.x = event.clientX;
      current.y = event.clientY;
      delta.x = current.x - last.x;
      delta.y = current.y - last.y;
      last.x = current.x;
      last.y = current.y;

      if (!resizing) {
        return;
      }

      if (delta.x !== 0 || delta.y !== 0) {
        let x = 0;
        let y = 0;
        let w = 0;
        let h = 0;

        if (this.options.anchor === Anchor.CENTER) {
          if (resizeType === 'nw') {
            h = -delta.y * 2;
            w = -delta.x * 2;
          } else if (resizeType === 'n') {
            h = -delta.y * 2;
          } else if (resizeType === 'ne') {
            w = delta.x * 2;
            h = -delta.y * 2;
          } else if (resizeType === 'e') {
            w = delta.x * 2;
          } else if (resizeType === 'se') {
            w = delta.x * 2;
            h = delta.y * 2;
          } else if (resizeType === 's') {
            h = delta.y * 2;
          } else if (resizeType === 'sw') {
            h = delta.y * 2;
          } else if (resizeType === 'w') {
            w = -delta.x * 2;
          }
        }

        this.resizeMove(x, y, w, h);
      }
    });
    this.css();
  }

  init() {
    this._initHandleMove();
    this.onInit();
  }

  private _initHandleMove(): void {
    this.$parent = $(this.element.parentElement);
    const $title = $(this.element.getElementsByClassName('window-title').item(0));
    let current: number[];
    let last: number[];
    // let ox = 0;
    // let oy = 0;
    let down: boolean = false;
    let moved: boolean = false;

    $title.on('mousedown', (e) => {
      e.stopPropagation();
      if (!this.enabled) {
        return;
      }
      last = current;
      down = true;
    });

    $win.on('mouseup', () => {
      if (!this.enabled) {
        return;
      }
      last = null;
      down = false;
      moved = false;
    });

    $win.on('mousemove', (event: MouseMoveEvent) => {
      if (!this.enabled) {
        return;
      }
      current = [event.clientX, event.clientY];
      if (!down) {
        return;
      }

      moved = true;
      if (last == null) {
        last = current;
        return;
      }

      const delta = {x: current[0] - last[0], y: current[1] - last[1]};

      // Calculate the offset.
      this.dimensions.x += delta.x;
      this.dimensions.y += delta.y;
      last[0] = current[0];
      last[1] = current[1];
      this.restrain();
    });
  }

  open() {
    if (this.enabled) {
      return;
    }
    this.element.style.display = 'block';
    this.enabled = true;
    this.onOpen();
  }

  close(buttonPressed: boolean) {
    if (!this.enabled || !this.options.canClose) {
      return;
    }
    this.onClose(buttonPressed);
    this.element.style.display = 'none';
    this.enabled = false;
  }

  setCanMinimize(flag: boolean): void {
    if (this.options.canMinimize === flag) {
      return;
    }
    this.options.canMinimize = flag;
    if (flag) {
      this.minimizeButton.style.display = 'inline-block';
    } else {
      this.minimizeButton.style.display = 'none';
    }
  }

  setCanResize(flag: boolean): void {
    if (this.options.canResize === flag) {
      return;
    }
    this.options.canResize = flag;
    if (flag) {
      this.resizeButton.style.display = 'inline-block';
    } else {
      this.resizeButton.style.display = 'none';
    }
  }

  setCanClose(flag: boolean): void {
    if (this.options.canClose === flag) {
      return;
    }
    this.options.canClose = flag;
    if (flag) {
      this.closeButton.style.display = 'inline-block';
    } else {
      this.closeButton.style.display = 'none';
    }
  }

  private resizeMove(x: number, y: number, width: number, height: number): void {
    this.dimensions.x += x;
    this.dimensions.y += y;
    this.dimensions.width += width;
    this.dimensions.height += height;
    this.restrain();
  }

  private restrain(): void {
    const width = this.$parent.width();
    const height = this.$parent.height();
    this.options.dimensions.check(this.dimensions, {width, height});

    // Clamp the offset to the boundaries of the parent container of the inner window.
    // const pw = this.$parent.width();
    // const ph = this.$parent.height();
    // const pw2 = pw / 2;
    // const ph2 = ph / 2;
    // const iww2 = Math.floor(this.$element.outerWidth(false) / 2);
    // const iwh2 = Math.floor(this.$element.outerHeight(false) / 2);
    // const xMaxLimit = pw2 - iww2;
    // const xMinLimit = -pw2 + iww2;
    // const yMaxLimit = ph2 - iwh2;
    // const yMinLimit = -ph2 + iwh2;
    // if (this.dims.x < xMinLimit) {
    //   this.dims.x = xMinLimit;
    // } else if (this.dims.x > xMaxLimit) {
    //   this.dims.x = xMaxLimit;
    // }
    // if (this.dims.y < yMinLimit) {
    //   this.dims.y = yMinLimit;
    // } else if (this.dims.y > yMaxLimit) {
    //   this.dims.y = yMaxLimit;
    // }
    this.css();
  }

  maximize() {
    if (!this.canResize()) {
      throw new Error('The window cannot maximize.');
    }
    if (this.isMaximized) {
      throw new Error('The window is already maximized.');
    }
    this.isMaximized = true;

    this.element.style.transition = 'x 100ms, y 100ms, width 100ms, height 100ms';
    setTimeout(() => {
      this.element.style.transition = null;
    }, 100);
    this.element.classList.add('maximized');
    this.resizeButtonIcon.classList.remove('fa-window-maximize');
    this.resizeButtonIcon.classList.add('fa-window-restore');

    this.css();
    this.onMaximize(this.$parent.innerWidth(), this.$parent.innerHeight());
  }

  restore() {
    if (!this.isMaximized) {
      throw new Error('The window is not maximized.');
    }
    this.isMaximized = false;

    this.element.style.transition = 'x 100ms, y 100ms, width 100ms, height 100ms';
    setTimeout(() => {
      this.element.style.transition = null;
    }, 100);
    this.element.classList.remove('maximized');
    this.resizeButtonIcon.classList.remove('fa-window-restore');
    this.resizeButtonIcon.classList.add('fa-window-maximize');

    this.css();
    this.onRestore(this.dimensions.width, this.dimensions.height);
  }

  onMaximize(width: number, height: number): void {
  }

  onRestore(width: number, height: number): void {
  }

  private css(): void {
    if (this.isMaximized) {
      this.element.style.top = null;
      this.element.style.left = null;
      this.element.style.width = null;
      this.element.style.height = null;
    } else {
      if (this.options.anchor === Anchor.CENTER) {
        this.element.style.top = `calc(50% + ${this.dimensions.y}px)`;
        this.element.style.left = `calc(50% + ${this.dimensions.x}px)`;
      }
      this.element.style.width = `calc(${this.dimensions.width}px)`;
      this.element.style.height = `calc(${this.dimensions.height}px)`;
    }
  }

  canClose(): boolean {
    return this.options.canClose;
  }

  canResize(): boolean {
    return this.options.canResize;
  }

  canMinimize(): boolean {
    return this.options.canMinimize;
  }

  abstract onInit(): void;

  abstract onOpen(): void;

  abstract onClose(buttonPressed: boolean): void;
}

export default UIInnerWindow;

