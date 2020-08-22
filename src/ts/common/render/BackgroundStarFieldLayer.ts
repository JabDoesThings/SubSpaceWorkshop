import * as PIXI from "pixi.js";
import MapRenderer from '../../editor/render/MapRenderer';
import Background from './Background';

/**
 * The <i>BackgroundStarFieldLayer</i> class. TODO: Document.
 *
 * @author Jab
 */
class BackgroundStarFieldLayer extends PIXI.Container {
  _color: number;
  _scale: number;
  private background: Background;

  /**
   * @param {Background} background
   * @param {number} color
   * @param {number} scale
   */
  constructor(background: Background, color: number, scale: number) {
    super();
    this.background = background;
    this._color = color;
    this._scale = scale;
    this.filters = [MapRenderer.chromaFilter];
    this.filterArea = this.background.view.app.screen;
  }

  plotAndDraw() {
    const points = [];
    const outerRange = 1024;
    const minX = -outerRange * 4;
    const minY = -outerRange * 4;
    const maxX = 32768 / this._scale;
    const maxY = 32768 / this._scale;
    const dx = maxX - minX;
    const dy = maxY - minY;

    for (let index = 0; index < 32768; index++) {
      const x = Math.floor(minX + (Math.random() * dx));
      const y = Math.floor(minY + (Math.random() * dy));
      points.push([x, y]);
    }

    this.removeChildren();
    const g = new PIXI.Graphics();
    g.beginFill(this._color);
    for (let index = 0; index < points.length; index++) {
      const next = points[index];
      // Draw each pixel for the star.
      g.drawRect(next[0], next[1], 1, 1);
    }
    g.endFill();
    this.addChild(g);
  }
}

export default BackgroundStarFieldLayer;
