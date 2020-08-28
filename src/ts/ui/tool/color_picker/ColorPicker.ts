import UIPopup from '../../component/frame/UIPopup';
import ColorPickerEvent from './ColorPickerEvent';
import { clamp } from '../../../util/MathUtil';
import { HSL2RGB, RGB2HSL } from '../../../util/ColorUtils';
import ColorPickerAction from './ColorPickerAction';
import PaletteColor from '../../util/PaletteColor';
import MouseDownEvent = JQuery.MouseDownEvent;

const html = '<div id="color-picker" class="ui-popup medium bottom">\n' +
  '    <div class="ui-popup-content">\n' +
  '        <div draggable="false" class="ui-color-picker" style="display: block;">\n' +
  '            <div class="ui-color-picker-wheel" draggable="false"\n' +
  '                 style="background-color: rgb(255, 0, 0);">\n' +
  '                <div class="cursor-position" draggable="false" style="left: 0; top: 0;">\n' +
  '                    <div class="cursor" draggable="false"></div>\n' +
  '                </div>\n' +
  '            </div>\n' +
  '            <div class="ui-color-picker-slider" draggable="false">\n' +
  '                <div class="ui-color-picker-slide" draggable="false" style="left: 0;"></div>\n' +
  '            </div>\n' +
  '        </div>\n' +
  '    </div>\n' +
  '</div>';

/**
 * The <i>ColorPicker</i> class. TODO: Document.
 *
 * @author Jab
 */
export default class ColorPicker extends UIPopup<ColorPickerEvent> {
  color: PaletteColor;
  private wheel: HTMLElement;
  private hue: HTMLElement;
  private hueSlide: HTMLElement;
  private cursorPosition: HTMLElement;
  private cursor: HTMLElement;
  private $wheel: JQuery;
  private $hue: JQuery;
  private $hueSlide: JQuery;
  private $cursorPosition: JQuery;
  private $cursor: JQuery;
  private cursorDown: boolean;
  private hueDown: boolean;
  private cursorHueUpTime: number;

  private _onComplete: (color: PaletteColor) => void;

  constructor() {
    document.body.innerHTML += html;
    const element = document.getElementById('color-picker');
    super('color-picker', 'medium', element);
    this.cursorHueUpTime = 0;
  }

  pick(position: { top: number; left: number } | HTMLElement | null = null,
       preferredSide: "top" | "bottom" | "left" | "right" | "none" | null = null,
       fadeTimeMs: number = 0,
       color: PaletteColor, onComplete: (color: PaletteColor) => void
  ): void {
    this.color = color;
    this.updateElements();
    this.open(position, preferredSide, fadeTimeMs);
    this._onComplete = onComplete;
  }

  /** @override */
  open(
    position: { top: number; left: number } | HTMLElement | null = null,
    preferredSide: "top" | "bottom" | "left" | "right" | "none" | null = null,
    fadeTimeMs: number = 0
  ) {
    super.open(position, preferredSide, fadeTimeMs);
    this.dispatch(<ColorPickerEvent> {
      forced: true,
      eventType: 'ColorPickerEvent',
      action: ColorPickerAction.OPEN,
      data: null,
      popup: this
    });
  }

  /** @override */
  close(fadeTimeMs: number = 0) {
    super.close(fadeTimeMs);

    if (this._onComplete) {
      this._onComplete(this.color);
      this._onComplete = null;
    }

    this.dispatch(<ColorPickerEvent> {
      forced: true,
      eventType: 'ColorPickerEvent',
      action: ColorPickerAction.OPEN,
      data: null,
      popup: this
    });
  }

  private updateElements() {
    let hsl = RGB2HSL(this.color);
    this.wheel.style.backgroundColor = `hsl(${hsl.h * 360.0},100%,50%)`;
    let lerpFactor = hsl.h;
    let w2 = -this.$hueSlide.width() / 2.0;
    this.hueSlide.style.left = `${w2 + (lerpFactor * 127)}px`;
    this.cursorPosition.style.left = `${hsl.s * 127}px`;
    this.cursorPosition.style.top = `${127 - (hsl.l * 127)}px`;
  }

  private updateHueSlider(x: number) {
    let offsetX = x / 127;
    if (offsetX > 1) {
      offsetX = 1;
    } else if (offsetX < 0) {
      offsetX = 0;
    }
    const hsl = RGB2HSL(this.color);
    hsl.h = Math.floor(offsetX * 360.0) / 360.0;
    const rgb = HSL2RGB(hsl);
    this.color.set(rgb.r, rgb.g, rgb.b);
  }

  private updateWheelCursor(x: number, y: number) {
    const offsetX = clamp(x / 127);
    const offsetY = clamp((127 - y) / 127);
    const saturation = Math.floor(offsetX * 100.0) / 100.0;
    const luminosity = Math.floor(offsetY * 100.0) / 100.0;
    const hsl = RGB2HSL(this.color);
    hsl.s = saturation;
    hsl.l = luminosity;
    const rgb = HSL2RGB(hsl);
    this.color.set(rgb.r, rgb.g, rgb.b);
  }

  /** @override */
  protected registerOpenCloseEventListeners() {
    // Elements
    this.color = new PaletteColor(1, 1, 1);
    this.wheel = <HTMLElement> this.element.getElementsByClassName('ui-color-picker-wheel').item(0);
    this.hue = <HTMLElement> this.element.getElementsByClassName('ui-color-picker-slider').item(0);
    this.hueSlide = <HTMLElement> this.hue.getElementsByClassName('ui-color-picker-slide').item(0);
    this.cursorPosition = <HTMLElement> this.element.getElementsByClassName('cursor-position').item(0);
    this.cursor = <HTMLElement> this.cursorPosition.getElementsByClassName('cursor').item(0);
    this.$wheel = $(this.wheel);
    this.$hueSlide = $(this.hueSlide);
    this.$hue = $(this.hue);
    this.$cursorPosition = $(this.cursorPosition);
    this.$cursor = $(this.cursorPosition);

    this.$element.on('click', (event) => {
      event.stopPropagation();
    });

    this.$element.on('pointerdown', (event) => {
      event.stopPropagation();
    });

    const $wildcard = $('*');
    let $window = $(window);

    const ctx = this;
    $wildcard.on('pointerdown', function () {
      if (ctx.closeOnClickOutside && !ctx.element.contains(this)) {
        if (ctx.isOpen && new Date().getTime() - ctx.timeOpened > 300) {
          ctx.close(200);
        }
      }
    });

    // Event listeners
    this.cursorDown = false;
    this.hueDown = false;

    const hueSliderFunction = (pageX: number) => {
      let offset = this.$element.offset();
      let x = -4 + (pageX - offset.left);
      x = clamp(x, 0, 127);
      this.updateHueSlider(x);
    };

    const cursorFunction = (pageX: number, pageY: number) => {
      let offset = this.$element.offset();
      let x = -4 + (pageX - offset.left);
      let y = -4 + (pageY - offset.top);
      x = clamp(x, 0, 127);
      y = clamp(y, 0, 127);
      this.updateWheelCursor(x, y);
    };

    this.$wheel.on('mousedown', (event: JQuery.MouseDownEvent) => {
      this.cursorDown = true;
      this.cursor.classList.add('focus');
      cursorFunction(event.pageX, event.pageY);
      this.updateElements();
    });

    this.$hue.on('mousedown', (event: MouseDownEvent) => {
      this.hueDown = true;
      this.hueSlide.classList.add('focus');
      hueSliderFunction(event.pageX);
      this.updateElements();
    });

    $window.on('mousemove', (event: JQuery.MouseMoveEvent) => {
      if (this.cursorDown) {
        cursorFunction(event.pageX, event.pageY);
        this.updateElements();
      }
      if (this.hueDown) {
        hueSliderFunction(event.pageX);
        this.updateElements();
      }
    });

    $window.on('mouseup', () => {
      if (this.cursorDown) {
        this.cursor.classList.remove('focus');
        this.updateElements();
        this.cursorDown = false;
      }
      if (this.hueDown) {
        this.hueSlide.classList.remove('focus');
        this.updateElements();
        this.hueDown = false;
      }
    });
  }
}

export const colorPicker = new ColorPicker();
// @ts-ignore
window.colorPicker = colorPicker;
