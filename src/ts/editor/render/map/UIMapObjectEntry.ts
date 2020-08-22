import { CustomEventListener } from '../../../ui/UI';
import { CompiledLVZMapObject } from '../../../io/LVZ';
import UIMapObjectEvent from './UIMapObjectEvent';

/**
 * The <i>UIMapObjectEntry</i> class. TODO: Document.
 *
 * @author Jab
 */
export default class UIMapObjectEntry extends CustomEventListener<UIMapObjectEvent> {
  readonly object: CompiledLVZMapObject;
  readonly element: HTMLDivElement;
  private readonly nameElement: HTMLDivElement;
  private readonly nameLabelElement: HTMLLabelElement;
  private readonly imageElement: HTMLDivElement;
  private readonly coordinatesElement: HTMLDivElement;
  private readonly optionsElement: HTMLDivElement;

  /**
   * @param {CompiledLVZMapObject} object
   */
  constructor(object: CompiledLVZMapObject) {
    super();
    this.object = object;
    this.nameLabelElement = document.createElement('label');
    this.nameElement = document.createElement('div');
    this.nameElement.classList.add('name');
    this.nameElement.appendChild(this.nameLabelElement);
    this.imageElement = document.createElement('div');
    this.imageElement.classList.add('image');
    this.coordinatesElement = document.createElement('div');
    this.coordinatesElement.classList.add('coordinates');
    this.optionsElement = document.createElement('div');
    this.optionsElement.classList.add('options');
    this.element = document.createElement('div');
    this.element.classList.add('map-object-entry');
    this.element.appendChild(this.nameElement);
    this.element.appendChild(this.imageElement);
    this.element.appendChild(this.coordinatesElement);
    this.element.appendChild(this.optionsElement);
  }

  update(): void {
    this.nameLabelElement.innerText = `${this.object.id} (${this.object.pkg.name})`;
  }
}
