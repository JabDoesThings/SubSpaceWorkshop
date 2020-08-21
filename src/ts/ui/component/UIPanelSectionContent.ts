import { removeAllChildren } from '../UI';

/**
 * The <i>UIPanelSectionContent</i> class. TODO: Document.
 *
 * @author Jab
 */
export class UIPanelSectionContent {
  readonly element: HTMLDivElement;
  readonly contents: HTMLDivElement;

  constructor() {
    this.contents = document.createElement('div');
    this.contents.classList.add('contents');
    this.element = document.createElement('div');
    this.element.classList.add('content-frame');
    this.element.appendChild(this.contents);
  }

  setContents(contents: HTMLElement[]): void {
    removeAllChildren(this.contents);
    if (contents.length === 0) {
      return;
    }
    for (let index = 0; index < contents.length; index++) {
      this.contents.appendChild(contents[index]);
    }
  }
}

export default UIPanelSectionContent;
