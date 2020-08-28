import UIPanel from '../UIPanel';
import { PanelOrientation, TabOrientation, TabPanelAction } from '../../UIProperties';
import { UIPanelEvent } from '../../UI';
import CustomEventListener from '../../CustomEventListener';
import CustomEvent from '../../CustomEvent';

import ImageEditorEvent from '../../tool/image_editor/ImageEditorEvent';

/**
 * The <i>UIPanelFrame</i> class. TODO: Document.
 *
 * @author Jab
 */
export default class UIPanelFrame<E extends CustomEvent> extends CustomEventListener<E> {
  readonly element: HTMLElement;
  readonly container: HTMLElement;
  readonly content: HTMLElement;
  readonly panelLeft: UIPanel;
  readonly panelRight: UIPanel;
  private readonly $element: JQuery;
  private readonly $container: JQuery;
  private leftOpen: boolean;
  protected rightOpen: boolean;

  constructor(left: boolean = true, right: boolean = true) {
    super();
    this.element = document.createElement('div');
    this.element.classList.add('ui-panel-frame');
    this.container = document.createElement('div');
    this.container.classList.add('ui-panel-frame-container');
    this.content = document.createElement('div');
    this.content.classList.add('ui-panel-frame-content');

    if (left) {
      this.panelLeft = new UIPanel(null, null, PanelOrientation.LEFT, TabOrientation.LEFT);
      this.container.appendChild(this.panelLeft.element);

      this.panelLeft.addEventListener((event: UIPanelEvent) => {
        console.log(event);
        if (event.action === TabPanelAction.OPEN || event.action === TabPanelAction.SELECT) {
          this.leftOpen = true;
          this.setTransition(200);
          this.update();
        } else if (event.action === TabPanelAction.CLOSE || event.action === TabPanelAction.DESELECT) {
          this.leftOpen = false;
          this.setTransition(200);
          this.update();
        }
      });
    }

    if (right) {
      this.panelRight = new UIPanel(null, null, PanelOrientation.RIGHT, TabOrientation.RIGHT);
      this.container.appendChild(this.panelRight.element);

      this.panelRight.addEventListener((event: UIPanelEvent) => {
        if (event.action === TabPanelAction.OPEN || event.action === TabPanelAction.SELECT) {
          this.rightOpen = true;
          this.setTransition(200);
          this.update();
        } else if (event.action === TabPanelAction.CLOSE || event.action === TabPanelAction.DESELECT) {
          this.rightOpen = false;
          this.setTransition(200);
          this.update();
        }
      });
    }

    this.container.appendChild(this.content);
    this.element.appendChild(this.container);
    this.$element = $(this.element);
    this.$container = $(this.container);
    this.leftOpen = false;
    this.rightOpen = false;

    const testBlock = document.createElement('div');
    testBlock.classList.add('test-block');
    this.content.appendChild(testBlock);

    $(window).on('resize', () => {
      this.setTransition(0);
      this.update();
    });
  }

  setTransition(speed: number) {
    if (speed === 0) {
      this.content.style.transition = `unset`;
    } else {
      this.content.style.transition = `left ${speed}ms, width ${speed}ms`;
    }
  }

  update() {
    let _left = 0;
    let _width = this.$container.width();
    if (this.panelLeft != null && this.leftOpen) {
      _left += this.panelLeft.width;
      _width -= this.panelLeft.width;
    }
    if (this.panelRight != null && this.rightOpen) {
      _width -= this.panelRight.width;
    }

    console.log(`result: left: ${_left}px, width: ${_width}px`);

    this.content.style.width = `${_width}px`;
    this.content.style.left = `${_left}px`;
  }
}
