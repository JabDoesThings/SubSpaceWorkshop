import SectionElement from './SectionElement';
import SliderEvent from './SliderEvent';
import SliderAction from './SliderAction';

function clamp(value: number, min: number = 0, max: number = 1): number {
  if (value < min) {
    value = min;
  } else if (value > max) {
    value = max;
  }
  return value;
}

export default class Slider extends SectionElement {
  private _value: number = 50;
  private _valueLast: number = 50;
  private _min: number = 0;
  private _max: number = 100;
  floatValue: number = 0.5;
  private slider: HTMLInputElement;
  private textInput: HTMLInputElement;

  /**
   * @param {string} id
   * @param {string} title
   * @param {number} min
   * @param {number} max
   * @param {number} value
   */
  constructor(id: string, title: string, min: number = 0, max: number = 100, value: number = 50) {
    super(id);

    this.createElement(title, min, max, value);
    this._min = min;
    this._max = max;
    this._value = value;
    this._valueLast = value;
    this.floatValue = (this._value - this._min) / (this._max - this._min);
  }

  private checkChangedValue(): void {
    if (this._valueLast !== this._value) {
      const value = this._value;
      const valueLast = this._valueLast;
      this.floatValue = (this._value - this._min) / (this._max - this._min);
      this.dispatch(<SliderEvent> {
        forced: false,
        eventType: 'SliderEvent',
        element: this,
        action: SliderAction.VALUE_CHANGE,
        data: {
          value: value,
          valueLast: valueLast
        }
      });
      this._valueLast = this._value;
    }
  }

  private fromSlider(): void {
    this.textInput.value = `${this._value}`;
    this.checkChangedValue();
  }

  private fromTextInput(): void {
    const input = <HTMLInputElement> this.slider;
    input.min = `${this._min}`;
    input.max = `${this._max}`;
    input.value = `${this._value}`;
  }

  get min(): number {
    return this._min;
  }

  set min(value: number) {
    this._min = value;
    this.fromTextInput();
  }

  get max(): number {
    return this._max;
  }

  set max(value: number) {
    this._max = value;
    this.fromTextInput();
  }

  get value(): number {
    return this._value;
  }

  set value(value: number) {
    this._value = value;
    this.checkChangedValue();
  }

  private createElement(title: string, min: number, max: number, value: number): void {
    this.slider = document.createElement('input');
    this.slider.type = 'range';
    this.slider.min = `${min}`;
    this.slider.max = `${max}`;
    this.slider.value = `${value}`;
    this.slider.classList.add('ui-float-bar', 'ui-slider');

    const titleElement = document.createElement('label');
    titleElement.classList.add('ui-section-element-title');
    titleElement.innerText = title;

    this.textInput = document.createElement('input');
    this.textInput.classList.add('ui-section-element-value-input');
    this.textInput.value = `${value}`;

    this.element = document.createElement('div');
    this.element.classList.add('ui-section-element');
    this.element.appendChild(titleElement);
    this.element.appendChild(this.slider);
    this.element.appendChild(this.textInput);

    // Text-Input listener.
    ['input', 'keydown', 'keyup', 'mousedown', 'mouseup', 'select', 'contextmenu', 'drop'].forEach((event) => {
      this.textInput.addEventListener(event, () => {
        let nValue = parseInt(this.textInput.value);
        if (isNaN(nValue) || this.textInput.value === '') {
          this.textInput.value = `${this._min}`;
          return;
        }
        if (nValue < this._min) {
          nValue = this._min;
        } else if (nValue > this._max) {
          nValue = this._max;
        }
        this.textInput.value = `${nValue}`;
        this.value = nValue;
        this.fromTextInput();
      });
    });

    // Slider listener.
    ["input", "keydown", "keyup", "mousedown", "mouseup", "select", "contextmenu", "drop"].forEach((event: string) => {
      this.slider.addEventListener(event, () => {
        this.value = parseInt(this.slider.value);
        this.fromSlider();
      });
    });
  }

  triggerValueEvent(): void {
    this.dispatch(<SliderEvent> {
      forced: true,
      eventType: 'SliderEvent',
      element: this,
      action: SliderAction.VALUE_CHANGE,
      data: {
        value: this.value,
        valueLast: this._valueLast
      }
    });
  }
}
