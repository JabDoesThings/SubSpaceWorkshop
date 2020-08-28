import Brush from './Brush';
import Path from '../../../../util/Path';
import PaletteColor from '../../../util/PaletteColor';
import Palette from '../../../util/Palette';
import CircleBrushOptions from './CircleBrushOptions';

const arcLength = Math.PI * 2;

/**
 * The <i>CircleBrush</i> class. TODO: Document.
 *
 * @author Jab
 */
export default class CircleBrush extends Brush {
  // Pen pressure fields.
  hardnessPressure: boolean = true;
  penHardnessMin: number = 0;
  penHardnessMax: number = null;

  constructor() {
    super();
    this.options = <CircleBrushOptions> {
      size: 16,
      opacity: 0.25,
      hardness: 0.5,
      antialias: false,
      smoothPressure: true,
      smoothAverageCount: 32,
      outline: false,
      outlineColor: new PaletteColor(0, 0, 0, 0.2),
      outlineThickness: 1
    };
  }

  /** @override */
  renderMouse(canvas: HTMLCanvasElement, palette: Palette, colorType: PaletteColor | 'primary' | 'secondary'): void {
    let color;
    if (colorType instanceof PaletteColor) {
      color = colorType;
    } else if (colorType === 'primary') {
      color = palette.primary;
    } else if (colorType === 'secondary') {
      color = palette.secondary;
    }
    CircleBrush.render(canvas, color, <CircleBrushOptions> this.options);
  }

  /** @override */
  renderPen(canvas: HTMLCanvasElement, palette: Palette, colorType: PaletteColor | 'primary' | 'secondary', pressure: number): void {
    const brushOptions = <CircleBrushOptions> this.options;
    const options: CircleBrushOptions = {
      size: brushOptions.size,
      hardness: brushOptions.hardness,
      opacity: brushOptions.opacity,
      outline: brushOptions.outline,
      smoothAverageCount: brushOptions.smoothAverageCount,
      smoothPressure: brushOptions.smoothPressure,
      outlineThickness: brushOptions.outlineThickness,
      outlineColor: brushOptions.outlineColor
    };

    // Pen color.
    let color;
    if (colorType instanceof PaletteColor) {
      color = colorType;
    } else if (colorType === 'primary') {
      if (this.colorPressure) {
        color = palette.secondary.lerp(palette.primary, pressure * pressure * pressure * pressure);
      } else {
        color = palette.primary;
      }
    } else if (colorType === 'secondary') {
      if (this.colorPressure) {
        color = palette.primary.lerp(palette.secondary, pressure * pressure * pressure * pressure);
      } else {
        color = palette.secondary;
      }
    }

    // Pen size.
    if (this.sizePressure) {
      let penSizeMin = this.penSizeMin;
      if (!penSizeMin) {
        penSizeMin = options.size / 4;
        if (penSizeMin < 1) {
          penSizeMin = 1;
        }
      }
      let penSizeMax = this.penSizeMax;
      if (!penSizeMax) {
        penSizeMax = options.size;
      }
      options.size = Math.floor(Path.lerp(penSizeMin, penSizeMax, pressure));
    }

    // Pen opacity.
    if (this.opacityPressure) {
      let penOpacityMin = this.penOpacityMin;
      if (penOpacityMin == null) {
        penOpacityMin = 0;
      }
      let penOpacityMax = this.penOpacityMax;
      if (penOpacityMax == null) {
        penOpacityMax = options.opacity;
      }
      options.opacity = Path.lerp(penOpacityMin, penOpacityMax, pressure);
    }

    // Pen hardness.
    if (this.hardnessPressure) {
      let penHardnessMin = this.penHardnessMin;
      if (penHardnessMin == null) {
        penHardnessMin = 0;
      }
      let penHardnessMax = this.penHardnessMax;
      if (penHardnessMax == null) {
        penHardnessMax = options.hardness;
      }
      options.hardness = Path.lerp(penHardnessMin, penHardnessMax, pressure);
    }

    CircleBrush.render(canvas, color, options);
  }

  private static render(canvas: HTMLCanvasElement, color: PaletteColor, options: CircleBrushOptions): void {
    const width = options.size;
    const height = options.size;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);
    const radius = width / 2;

    if (options.hardness === 1) {
      ctx.fillStyle = color.color;
    } else {
      // Calculate gradient for hardness.
      const gradient = ctx.createRadialGradient(radius, radius, 0, radius, radius, radius);
      const colorStart = color.color;
      const colorStop = color.toString(0);
      gradient.addColorStop(options.hardness, colorStart);
      gradient.addColorStop(1, colorStop);
      ctx.fillStyle = gradient;
    }

    // ctx.globalAlpha = options.opacity;

    // Draw.
    ctx.beginPath();
    ctx.arc(radius, radius, radius, 0, arcLength);
    ctx.fill();

    if (options.outline) {
      ctx.lineWidth = options.outlineThickness;
      ctx.strokeStyle = options.outlineColor.color;
      ctx.beginPath();
      ctx.arc(radius, radius, radius, 0, arcLength);
      ctx.stroke();
      ctx.lineWidth = 1;
    }

    ctx.globalAlpha = 1;
  }
}
