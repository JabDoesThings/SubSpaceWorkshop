/**
 * The <i>UITooltip</i> class. TODO: Document.
 *
 * @author Jab
 */
export class UITooltip {
  readonly element: HTMLDivElement;
  readonly labelElement: HTMLLabelElement;

  /**
   * @param {string} text
   */
  constructor(text: string) {
    this.labelElement = document.createElement('label');
    this.labelElement.innerText = text;
    this.element = document.createElement('div');
    this.element.classList.add('ui-tooltip');
    this.element.appendChild(this.labelElement);
  }
}

export default UITooltip;
