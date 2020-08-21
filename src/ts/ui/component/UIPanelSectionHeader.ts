import { UIPanelSection } from './UIPanelSection';

/**
 * The <i>UIPanelSectionHeader</i> class. TODO: Document.
 *
 * @author Jab
 */
export class UIPanelSectionHeader {
  readonly element: HTMLDivElement;
  readonly arrowLabel: HTMLLabelElement;
  private readonly arrow: HTMLDivElement;
  private readonly title: HTMLDivElement;
  private readonly titleLabel: HTMLLabelElement;
  private readonly section: UIPanelSection;

  /**
   * @param {UIPanelSection} section
   * @param {string} title
   */
  constructor(section: UIPanelSection, title: string = null) {
    this.section = section;
    this.arrow = document.createElement('div');
    this.arrow.classList.add('arrow');
    this.arrowLabel = document.createElement('label');
    this.arrowLabel.innerHTML = '►';
    this.arrow.appendChild(this.arrowLabel);

    this.titleLabel = document.createElement('label');
    this.setTitle(title);

    this.title = document.createElement('div');
    this.title.classList.add('title');
    this.title.appendChild(this.titleLabel);

    this.element = document.createElement('div');
    this.element.classList.add('header');
    this.element.appendChild(this.arrow);
    this.element.appendChild(this.title);

    this.arrow.addEventListener('click', () => {
      if (section.isOpen()) {
        section.close();
      } else {
        section.open();
      }
    });

    this.title.addEventListener('click', () => {
      if (section.isOpen()) {
        section.close();
      } else {
        section.open();
      }
    });
  }

  setTitle(title: string) {
    this.titleLabel.innerHTML = title == null ? '' : title;
  }
}

export default UIPanelSectionHeader;
