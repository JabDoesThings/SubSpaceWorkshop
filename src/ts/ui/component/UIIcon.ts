/**
 * The <i>UIIcon</i> class. TODO: Document.
 *
 * @author Jab
 */
export class UIIcon {
  readonly element: HTMLElement;

  /**
   * @param {string[]} classes
   */
  constructor(classes: string[]) {
    this.element = document.createElement('i');
    for (let index = 0; index < classes.length; index++) {
      this.element.classList.add(classes[index]);
    }
  }
}

export default UIIcon;
