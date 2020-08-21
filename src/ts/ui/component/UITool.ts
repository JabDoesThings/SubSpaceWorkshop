import UIIcon from './UIIcon';
import UIIconToolbar from './UIIconToolbar';
import UITooltip from './UITooltip';
import { CustomEventListener } from '../CustomEventListener';
import { UIToolEvent } from '../UIEvents';
import { ToolAction } from '../UIProperties';

/**
 * The <i>UITool</i> class. TODO: Document.
 *
 * @author Jab
 */
export class UITool extends CustomEventListener<UIToolEvent> {
  readonly element: HTMLDivElement;
  readonly id: string;
  toolbar: UIIconToolbar;
  staySelected: boolean;
  private readonly icon: UIIcon;
  private readonly tooltip: UITooltip;

  /**
   * @param {string} id
   * @param {UIIcon} icon
   * @param {UITooltip} tooltip
   * @param {boolean} staySelected
   */
  constructor(id: string, icon: UIIcon, tooltip: UITooltip, staySelected: boolean = true) {
    super();
    this.staySelected = staySelected;
    this.id = id;
    this.icon = icon;
    this.tooltip = tooltip;
    this.toolbar = null;
    this.element = document.createElement('div');
    this.element.classList.add('tool');
    this.element.appendChild(icon.element);
    this.element.appendChild(tooltip.element);
    this.element.addEventListener('click', () => {
      this.dispatch({
        eventType: 'UIToolEvent',
        tool: this,
        action: ToolAction.SELECT,
        forced: true
      });
    });
  }
}

export default UITool;
