import MouseMoveEvent = JQuery.MouseMoveEvent;
import UIMenuBar from './UIMenuBar';

const $win = $(window);

/**
 * The <i>UIInnerWindow</i> class. TODO: Document.
 *
 * @author Jab
 */
abstract class UIInnerWindow {
  element: HTMLElement;
  content: HTMLElement;
  private offset: number[] = [0, 0];
  protected enabled: boolean = false;
  protected $element: JQuery;

  menuBar: UIMenuBar;

  protected constructor(element: HTMLElement) {
    this.element = element;
    this.$element = $(element);
    this.element.style.display = 'none';
    this.content = <HTMLElement> this.element.getElementsByClassName('content').item(0);

    const menuBarElementCheck = this.element.getElementsByClassName('menu-bar');
    if(menuBarElementCheck.length !== 0) {
      this.menuBar = new UIMenuBar(<HTMLElement> menuBarElementCheck.item(0));
    } else {
      this.menuBar = new UIMenuBar();
    }
  }

  init() {
    this._initHandleMove();
    this.onInit();
  }

  private _initHandleMove(): void {
    const $parent = $(this.element.parentElement);
    const $title = $(this.element.getElementsByClassName('window-title').item(0));
    let mDown: number[];
    let mCurrent: number[];
    let ox = 0;
    let oy = 0;
    let down: boolean = false;
    let moved: boolean = false;

    console.log($parent.width());
    console.log($parent.height());

    $title.on('mousedown', (e) => {
      e.stopPropagation();
      if (!this.enabled) {
        return;
      }
      mDown = mCurrent;
      down = true;
    });

    $win.on('mouseup', () => {
      if (!this.enabled) {
        return;
      }
      mDown = null;
      down = false;
      if (moved) {
        this.offset[0] = ox;
        this.offset[1] = oy;
        ox = 0;
        oy = 0;
        moved = false;
      }
    });

    $win.on('mousemove', (event: MouseMoveEvent) => {
      if (!this.enabled) {
        return;
      }
      mCurrent = [event.clientX, event.clientY];
      if (!down) {
        return;
      }
      moved = true;
      if (!mDown) {
        mDown = mCurrent;
      }

      // Calculate the offset.
      ox = this.offset[0] - (mDown[0] - mCurrent[0]);
      oy = this.offset[1] - (mDown[1] - mCurrent[1]);

      // Clamp the offset to the boundaries of the parent container of the inner window.
      const pw = $parent.width();
      const ph = $parent.height();
      const pw2 = pw / 2;
      const ph2 = ph / 2;
      const iww2 = Math.floor(this.$element.outerWidth(false) / 2);
      const iwh2 = Math.floor(this.$element.outerHeight(false) / 2);
      const xMaxLimit = pw2 - iww2;
      const xMinLimit = -pw2 + iww2;
      const yMaxLimit = ph2 - iwh2;
      const yMinLimit = -ph2 + iwh2;
      if (ox < xMinLimit) {
        ox = xMinLimit;
      } else if (ox > xMaxLimit) {
        ox = xMaxLimit;
      }
      if (oy < yMinLimit) {
        oy = yMinLimit;
      } else if (oy > yMaxLimit) {
        oy = yMaxLimit;
      }

      this.element.style.top = `calc(50% + ${oy}px)`;
      this.element.style.left = `calc(50% + ${ox}px)`;
    });
  }

  open() {
    if (this.enabled) {
      return;
    }
    this.element.style.display = 'block';
    // this.handlers.forEach(handler => {
    //   handler.on();
    // });
    this.enabled = true;
    this.onOpen();
  }

  close() {
    if (!this.enabled) {
      return;
    }
    this.element.style.display = 'none';
    // this.handlers.forEach(handler => {
    //   handler.off();
    // });
    this.enabled = false;
    this.onClose();
  }

  abstract onInit(): void;

  abstract onOpen(): void;

  abstract onClose(): void;
}

export default UIInnerWindow;
