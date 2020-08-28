import IconToolbar from './IconToolbar';
import MouseDownEvent = JQuery.MouseDownEvent;

/**
 * The <i>IconTool</i> class. TODO: Document.
 *
 * @author Jab
 */
export default class IconTool {
  readonly id: string;
  private readonly toolbar: IconToolbar;
  private readonly element: HTMLElement;

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
