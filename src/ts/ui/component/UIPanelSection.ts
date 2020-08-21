import { UIPanelTab } from './UIPanelTab';
import UIPanelSectionHeader from './UIPanelSectionHeader';
import UIPanelSectionContent from './UIPanelSectionContent';

/**
 * The <i>UIPanelSection</i> class. TODO: Document.
 *
 * @author Jab
 */
export class UIPanelSection {
  readonly header: UIPanelSectionHeader;
  readonly content: UIPanelSectionContent;
  readonly element: HTMLDivElement;
  readonly id: string;
  panelTab: UIPanelTab;
  private opening: NodeJS.Timeout;
  private closing: NodeJS.Timeout;

  /**
   * @param {string} id
   * @param {string} title
   */
  constructor(id: string, title: string) {
    this.id = id;
    this.header = new UIPanelSectionHeader(this, title);
    this.content = new UIPanelSectionContent();
    this.element = document.createElement('div');
    this.element.classList.add('ui-panel-section');
    this.element.appendChild(this.header.element);
    this.element.appendChild(this.content.element);
    this.opening = null;
    this.closing = null;
  }

  open(delay: number = 0): void {
    const css = () => {
      if (!this.element.classList.contains('open')) {
        this.element.classList.add('open');
      }
      if (this.header.arrowLabel.innerHTML !== '▼') {
        this.header.arrowLabel.innerHTML = '▼';
      }
      this.content.element.style.maxHeight = (this.content.element.scrollHeight) + "px";
      this.opening = null;
    };
    if (delay !== 0) {
      if (delay < 0) {
        throw new Error(`Opening delay values cannot be negative. (${delay} given)`);
      }
      if (this.opening != null) {
        clearTimeout(this.opening);
      }
      this.opening = setTimeout(css, delay);
    } else {
      css();
    }
  }

  close(delay: number = 0): void {
    const css = () => {
      if (this.element.classList.contains('open')) {
        this.element.classList.remove('open');
      }
      if (this.content.element.style.maxHeight) {
        this.content.element.style.maxHeight = null;
      }
      if (this.header.arrowLabel.innerHTML !== '►') {
        this.header.arrowLabel.innerHTML = '►';
      }
      this.closing = null;
    };
    if (delay !== 0) {
      if (delay < 0) {
        throw new Error(`Closing delay values cannot be negative. (${delay} given)`);
      }
      if (this.closing != null) {
        clearTimeout(this.closing);
      }
      this.closing = setTimeout(css, delay);
    } else {
      css();
    }
  }

  setTitle(title: string): void {
    this.header.setTitle(title);
  }

  setContents(contents: HTMLElement[], open: boolean = false, openDelay: number = 0): void {
    this.content.setContents(contents);
    if (open) {
      this.open(openDelay);
    }
  }

  isOpen(): boolean {
    return this.element.classList.contains('open');
  }
}

export default UIPanelSection;
