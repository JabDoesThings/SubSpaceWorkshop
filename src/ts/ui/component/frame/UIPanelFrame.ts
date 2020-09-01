import UIPanel from '../UIPanel';
import { PanelOrientation, TabOrientation, TabPanelAction } from '../../UIProperties';
import { UIPanelEvent } from '../../UI';
import CustomEventListener from '../../CustomEventListener';
import CustomEvent from '../../CustomEvent';

const $window = $(window);

/**
 * The <i>UIPanelFrame</i> class. TODO: Document.
 *
 * @author Jab
 */
export default class UIPanelFrame<E extends CustomEvent> extends CustomEventListener<E> {
  readonly element: HTMLElement;
  readonly container: HTMLElement;
  readonly content: HTMLElement;
  readonly contentBoxShadow: HTMLElement;
  readonly panelLeft: UIPanel;
  readonly panelRight: UIPanel;
  private readonly $element: JQuery;
  private readonly $container: JQuery;

  /**
   * @param {boolean} left Set to true to create a left panel for the frame.
   * @param {boolean} right Set to true to create a righ panel for the frame.
   */
  constructor(left: boolean = true, right: boolean = true) {
    super();
    this.element = document.createElement('div');
    this.element.classList.add('ui-panel-frame');
    this.container = document.createElement('div');
    this.container.classList.add('ui-panel-frame-container');
    this.content = document.createElement('div');
    this.content.classList.add('ui-panel-frame-content');
    this.contentBoxShadow = document.createElement('div');
    this.contentBoxShadow.classList.add('ui-panel-frame-box-shadow');
    this.content.appendChild(this.contentBoxShadow);

    if (left) {
      this.panelLeft = new UIPanel(null, null, PanelOrientation.LEFT, TabOrientation.LEFT);
      this.container.appendChild(this.panelLeft.element);
      this.panelLeft.addEventListener((event: UIPanelEvent) => {
        if (event.action === TabPanelAction.OPEN) {
          this.setTransition(200);
          this.updateFrame();
        } else if (event.action === TabPanelAction.CLOSE) {
          this.setTransition(200);
          this.updateFrame();
        }
      });
    }
    if (right) {
      this.panelRight = new UIPanel(null, null, PanelOrientation.RIGHT, TabOrientation.RIGHT);
      this.container.appendChild(this.panelRight.element);
      this.panelRight.addEventListener((event: UIPanelEvent) => {
        if (event.action === TabPanelAction.OPEN) {
          this.setTransition(200);
          this.updateFrame();
        } else if (event.action === TabPanelAction.CLOSE) {
          this.setTransition(200);
          this.updateFrame();
        }
      });
    }

    this.container.appendChild(this.content);
    this.element.appendChild(this.container);
    this.$element = $(this.element);
    this.$container = $(this.container);

    $window.on('resize', () => {
      this.setTransition(0);
      this.updateFrame();
    });
  }

  setTransition(speed: number) {
    if (speed === 0) {
      this.content.style.transition = `unset`;
    } else {
      this.content.style.transition = `left ${speed}ms, width ${speed}ms`;
    }
  }

  private lastWidth: number = -1;

  /** Updates the frame, checking states for panels to adjust the content accordingly. */
  updateFrame(width?: number, height?: number) {
    let _left = 0;
    let _width = width != null ? width : this.$container.width();
    // if (_width === this.lastWidth) {
    //   return;
    // }
    this.lastWidth = _width;
    if (this.panelLeft != null && this.panelLeft.isOpen()) {
      _left += this.panelLeft.width;
      _width -= this.panelLeft.width;
    }
    if (this.panelRight != null && this.panelRight.isOpen()) {
      _width -= this.panelRight.width;
    }
    this.content.style.width = `${_width}px`;
    this.content.style.left = `${_left}px`;
  }
}
