import { CustomEventListener, CustomEvent } from '../../ui/UI';
import MouseDownEvent = JQuery.MouseDownEvent;

export class IconToolbar extends CustomEventListener<IconToolbarEvent> {

  private element: HTMLElement;
  private readonly tools: { [id: string]: IconTool };
  private active: string;

  constructor(element: HTMLElement) {
    super();
    if (!element.classList.contains('ui-icon-toolbar')) {
      throw new Error(`Invalid element: ${element}`);
    }
    this.element = element;
    this.tools = {};
    this.read();
  }

  read() {
    for (let index = 0; index < this.element.children.length; index++) {
      const next = <HTMLElement> this.element.children.item(index);
      const iconTool = new IconTool(this, next);
      this.tools[iconTool.id] = iconTool;
    }
  }

  create(id: string, classes: string[], tooltip: string): IconTool {
    const element = document.createElement('div');
    const icon = document.createElement('i');
    const label = document.createElement('label');
    const labelContainer = document.createElement('div');
    labelContainer.classList.add('ui-tooltip');
    element.setAttribute('tool_id', id);
    element.classList.add('tool');
    classes.forEach(clazz => {
      icon.classList.add(clazz);
    });
    label.innerText = tooltip;

    labelContainer.appendChild(label);
    element.appendChild(icon);
    element.appendChild(labelContainer);
    this.element.appendChild(element);

    const tool = new IconTool(this, element);
    this.tools[tool.id] = tool;

    const event = <IconToolbarEvent> {
      eventType: 'IconToolbarEvent',
      forced: true,
      tool: tool,
      type: IconToolbarEventType.CREATE
    };
    this.dispatch(event);

    return tool;
  }

  setActive(id: string): void {
    this.active = id;
    const tool = this.tools[id];

    Object.keys(this.tools).forEach(_id => {
      const next = this.tools[_id];
      if (next === tool) {
        next.setUISelected(true);
      } else {
        next.setUISelected(false);
      }
    });

    const event = <IconToolbarEvent> {
      eventType: 'IconToolbarEvent',
      forced: true,
      tool: tool,
      type: IconToolbarEventType.SET_ACTIVE
    };
    this.dispatch(event);
  }
}

export interface IconToolbarEvent extends CustomEvent {
  eventType: string;
  forced: boolean;
  tool: IconTool;
  type: IconToolbarEventType;
}

export enum IconToolbarEventType {
  CREATE = 'create',
  SET_ACTIVE = 'set_active'
}

export class IconTool {

  private readonly toolbar: IconToolbar;
  private readonly element: HTMLElement;
  readonly id: string;

  constructor(toolbar: IconToolbar, element: HTMLElement) {
    this.toolbar = toolbar;
    this.element = element;
    if (!this.element.hasAttribute('tool_id')) {
      throw new Error(`The tool doesn't have a 'tool_id': ${element}`);
    }
    this.id = element.getAttribute('tool_id');

    const $element = $(element);

    $element.on('mousedown', (event: MouseDownEvent) => {
      event.stopPropagation();
      if (this.isActive()) {
        return;
      }
      toolbar.setActive(this.id);
    });
  }

  setUISelected(flag: boolean) {
    if (flag) {
      this.element.classList.add('selected');
    } else {
      this.element.classList.remove('selected');
    }
  }

  isActive(): boolean {
    return this.element.classList.contains('selected');
  }
}
