import { CustomEventListener } from '../CustomEventListener';
import { IconToolbarAction, ToolbarOrientation, ToolbarSize } from '../UIProperties';
import { CustomEvent, UIIconToolbarEvent, UIToolEvent } from '../UIEvents';
import UITool from './UITool';

/**
 * The <i>UIIconToolbar</i> class. TODO: Document.
 *
 * @author Jab
 */
class UIIconToolbar extends CustomEventListener<CustomEvent> {
  readonly element: HTMLDivElement;
  readonly tools: UITool[] = [];
  active: number;
  private readonly toolListener: (event: UIToolEvent) => void;

  /**
   * @param {ToolbarOrientation} orientation
   * @param {ToolbarSize} size
   */
  constructor(orientation: ToolbarOrientation = ToolbarOrientation.TOP, size: ToolbarSize = ToolbarSize.SMALL) {
    super();
    this.element = document.createElement('div');
    this.element.classList.add('ui-icon-toolbar');
    this.element.classList.add(orientation);
    this.element.classList.add(size);
    this.active = -1;
    this.toolListener = (event: UIToolEvent): void => {
      const tool = event.tool;
      if (tool.staySelected) {
        const index = this.getIndex(event.tool);
        if (index == -1) {
          return;
        }
        this.setActiveIndex(index);
      }
      this.dispatch(event);
    };
  }

  getIndex(tool: UITool): number {
    for (let index = 0; index < this.tools.length; index++) {
      const next = this.tools[index];
      if (next === tool) {
        return index;
      }
    }
    return -1;
  }

  add(tool: UITool): void {
    tool.toolbar = this;

    const classList = tool.element.classList;
    if (classList.contains('selected')) {
      classList.remove('selected');
    }
    tool.addEventListener(this.toolListener);
    this.element.appendChild(tool.element);
    this.tools.push(tool);
    this.dispatch(<UIIconToolbarEvent> {
      eventType: 'UIIconToolbarEvent',
      toolBar: this,
      tool: tool,
      action: IconToolbarAction.ADD_TOOL,
      forced: true
    });
  }

  remove(tool: UITool): void {
    tool.toolbar = null;
    this.element.removeChild(tool.element);

    const classList = tool.element.classList;
    if (classList.contains('selected')) {
      classList.remove('selected');
    }
    tool.removeEventListener(this.toolListener);

    const temp = [];
    for (let index = 0; index < this.tools.length; index++) {
      const next = this.tools[index];
      if (next === tool) {
        continue;
      }
      temp.push(tool);
    }

    this.tools.length = 0;
    for (let index = 0; index < temp.length; index++) {
      this.tools.push(temp[index]);
    }

    this.dispatch(<UIIconToolbarEvent> {
      eventType: 'UIIconToolbarEvent',
      toolBar: this,
      tool: tool,
      action: IconToolbarAction.REMOVE_TOOL,
      forced: true
    });
  }

  setActive(tool: UITool): void {
    this.setActiveIndex(this.getIndex(tool));
  }

  setActiveIndex(index: number): void {
    let tool = this.tools[this.active];
    if (tool != null) {
      let classList = tool.element.classList;
      if (classList.contains('selected')) {
        classList.remove('selected');
      }
    }
    this.active = index;
    tool = this.tools[this.active];

    if (tool != null) {
      let classList = tool.element.classList;
      if (!classList.contains('selected')) {
        classList.add('selected');
      }
    }

    this.dispatch(<UIIconToolbarEvent> {
      eventType: 'UIIconToolbarEvent',
      toolBar: this,
      tool: tool,
      action: IconToolbarAction.SET_ACTIVE,
      forced: true
    });
  }

  get(index: number): UITool {
    return this.tools[index];
  }
}

export default UIIconToolbar;
