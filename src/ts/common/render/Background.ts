import * as PIXI from 'pixi.js';
import SeededRandom from '../../util/SeededRandom';
import Project from '../../editor/Project';
import Renderer from './Renderer';
import BackgroundObjectLayer from './BackgroundObjectLayer';
import BackgroundStarFieldLayer from './BackgroundStarFieldLayer';

/**
 * The <i>Background</i> class. TODO: Document.
 *
 * @author Jab
 */
class Background extends PIXI.Container {
  view: Renderer;
  project: Project;
  g: PIXI.Graphics;
  texLayer: BackgroundObjectLayer;
  random: SeededRandom;
  private readonly layer1: BackgroundStarFieldLayer;
  private readonly layer2: BackgroundStarFieldLayer;
  private lw: number;
  private lh: number;
  private dirty: boolean = true;

  /**
   * @param {Project} project
   * @param {Renderer} view
   * @param {number} seed
   */
  constructor(project: Project, view: Renderer, seed: number) {
    super();

    this.project = project;
    this.view = view;
    this.random = new SeededRandom(seed);
    this.filters = [];
    this.filterArea = view.app.screen;

    this.g = new PIXI.Graphics();
    this.lw = -1;
    this.lh = -1;
    this.layer1 = new BackgroundStarFieldLayer(this, 0x606060, 8);
    this.layer2 = new BackgroundStarFieldLayer(this, 0xB8B8B8, 6);
    this.texLayer = new BackgroundObjectLayer(this);

    this.draw();
    this.addChild(this.layer1);
    this.addChild(this.layer2);
    this.addChild(this.texLayer);
  }

  /** Draws the background. */
  draw(): void {
    this.removeChildren();
    this.layer1.plotAndDraw();
    this.layer2.plotAndDraw();
    this.texLayer.draw();
    this.dirty = false;
  }

  /** Updates the background. */
  update(): void {
    if (this.dirty) {
      this.draw();
    }

    const camera = this.view.camera;
    const screen = this.view.app.screen;
    if (screen.width != this.lw || screen.height != this.lh) {
      this.g.clear();
      this.g.beginFill(0x000000);
      this.g.drawRect(0, 0, screen.width, screen.height);
      this.g.endFill();

      this.lw = screen.width;
      this.lh = screen.height;
    }

    const scale = camera.position.scale;

    let alpha = 1;
    if (scale >= 0.25 && scale <= 0.5) {
      alpha = (scale - 0.25) * 4;
      if (alpha > 1) {
        alpha = 1;
      } else if (alpha < 0) {
        alpha = 0;
      }
    } else if (scale < 0.25) {
      alpha = 0;
    }
    this.alpha = alpha;

    if (this.alpha == 0) {
      return;
    }

    if (camera.isDirty()) {
      this.texLayer.update();
      const cpos = camera.position;
      const scale = cpos.scale;
      const invScale = 1 / scale;
      const sw2 = invScale * (this.view.app.screen.width / 2.0);
      const sh2 = invScale * (this.view.app.screen.height / 2.0);
      const cx = (cpos.x * 16);
      const cy = (cpos.y * 16);

      this.layer1.x = (sw2 + (-(cx / this.layer1._scale))) * scale;
      this.layer1.y = (sh2 + (-(cy / this.layer1._scale))) * scale;
      this.layer1.scale.x = scale;
      this.layer1.scale.y = scale;

      this.layer2.x = (sw2 + (-(cx / this.layer2._scale))) * scale;
      this.layer2.y = (sh2 + (-(cy / this.layer2._scale))) * scale;
      this.layer2.scale.x = scale;
      this.layer2.scale.y = scale;
    }

    this.dirty = false;
  }

  /**
   * Sets the seed for the background to generate background objects & stars.
   *
   * @param {number} seed The seed to set.
   */
  setSeed(seed: number) {
    this.random = new SeededRandom(seed);
  }

  /** @override */
  isDirty(): boolean {
    return this.dirty;
  }

  /** @override */
  setDirty(flag: boolean): void {
    this.dirty = flag;
  }
}

export default Background;
