import Dimensions from './Dimensions';

export default class WindowDimensions {
  dimensions: Dimensions;
  min: { width: number, height: number };
  max: { width: number, height: number };

  constructor(dimensions: Dimensions, min?: { width: number, height: number }, max?: { width: number, height: number }) {
    this.dimensions = {x: dimensions.x, y: dimensions.y, width: dimensions.width, height: dimensions.height};
    if (min != null) {
      this.min = {width: min.width, height: min.height};
    } else {
      this.min = {width: 256, height: 128};
    }
    if (max != null) {
      this.max = {width: max.width, height: max.height};
    }
  }

  check(dimensions: Dimensions, max?: { width: number, height: number }): void {
    const min = this.min;
    max = max != null ? max : this.max;

    if (min && dimensions.width < min.width) {
      dimensions.width = min.width;
    } else if (max && dimensions.width > max.width) {
      dimensions.width = max.width;
    }
    if (min && dimensions.height < min.height) {
      dimensions.height = min.height;
    } else if (max && dimensions.height > max.height) {
      dimensions.height = max.height;
    }
  }
}
