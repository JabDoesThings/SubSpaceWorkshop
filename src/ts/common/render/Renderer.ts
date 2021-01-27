import * as fs from 'fs';
import * as PIXI from 'pixi.js';
import PathMode from '../../util/PathMode';
import UpdatedObject from '../../util/UpdatedObject';
import RenderEvents from './RendererEvents';
import Camera from './Camera';
import { AdvancedBloomFilter } from '@pixi/filter-advanced-bloom';
import Filter = PIXI.Filter;

const Stats = require('stats.js');

/**
 * The <i>Renderer</i> class. TODO: Document.
 *
 * @author Jab
 */
abstract class Renderer extends UpdatedObject {
  static fragmentSrc = fs.readFileSync('assets/glsl/pixi_chroma.frag').toString();
  static chromaFilter = new Filter(undefined, Renderer.fragmentSrc, undefined);
  static fragmentSrcMask = fs.readFileSync('assets/glsl/pixi_chroma_mask.frag').toString();
  static chromaFilterMask = new Filter(undefined, Renderer.fragmentSrcMask, undefined);
  camera: Camera;
  app: PIXI.Application;
  stats: Stats;
  events: RenderEvents;
  bloomFilter: AdvancedBloomFilter;
  private readonly __toCanvasSprite: PIXI.Sprite = new PIXI.Sprite();

  protected constructor() {
    super();
    this.setRequireDirtyToUpdate(false);
    this.camera = new Camera(this);
  }

  /**
   * Initializes the renderer apart from the constructor so that the variable assignment is accessible during the
   * initialization process.
   *
   * @param {HTMLElement} container
   * @param {string} id
   * @param {boolean} stats
   */
  init(container: HTMLElement, id: string = 'viewport', stats: boolean): void {
    this.app = new PIXI.Application({
      width: 800,
      height: 600,
      backgroundColor: 0x000000,
      resolution: window.devicePixelRatio || 1,
      antialias: false,
      forceFXAA: false,
      clearBeforeRender: true,
    });

    const enableTicks = 90;
    // let enableLerp = 0;
    // this.app.stage.alpha = 0;
    this.camera.pathTo({x: 512, y: 512, scale: 1}, enableTicks, PathMode.EASE_OUT);

    const resize = () => {
      // Resize the renderer
      const width = container.clientWidth;
      const height = container.clientHeight;
      this.app.renderer.resize(width, height);
      this.setDirty(true);
      this.camera.setDirty(true);

      const $leftTabMenu = $('#editor-left-tab-menu');
      $leftTabMenu.css({top: (window.innerHeight - 49) + 'px'});
    };

    let lastWidth = -1;
    let lastHeight = -1;

    this.app.ticker.add((delta) => {
      if (this.stats != null) {
        this.stats.begin();
      }

      const width = container.clientWidth;
      const height = container.clientHeight;

      if (lastWidth != width || lastHeight != height) {
        resize();
        lastWidth = width;
        lastHeight = height;
      }

      this.updateCamera(delta);
      this.onPreUpdate(delta);
      this.update(delta);
      this.onPostUpdate(delta);

      this.camera.setDirty(false);

      if (this.stats != null) {
        this.stats.end();
      }
    });

    this.app.view.id = id;
    this.app.stage.interactive = true;

    if (stats) {
      this.initStats(container);
    }

    this.events = new RenderEvents(this);

    this.bloomFilter = new AdvancedBloomFilter({
      threshold: 0.1,
      bloomScale: 0.1,
      brightness: 1,
      blur: 1,
      quality: 5,
    });

    this.app.stage.filters = [this.bloomFilter];
    this.app.stage.filterArea = this.app.screen;
    this.bloomFilter.enabled = false;
    this.bloomFilter.bloomScale = 0;

    this.onInit();

    container.appendChild(this.app.view);

    resize();

    this.setDirty(true);
  }

  private initStats(container: HTMLElement): void {
    this.stats = new Stats();
    this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    this.stats.dom.style.position = 'absolute';
    this.stats.dom.style.top = '1px';
    this.stats.dom.style.left = 'unset';
    this.stats.dom.style.right = '1px';
    container.appendChild(this.stats.dom);
  }

  private updateCamera(delta: number): void {
    const sw = this.app.view.width;
    const sh = this.app.view.height;
    const cPos = this.camera.position;
    const cx = cPos.x * 16;
    const cy = cPos.y * 16;

    this.camera.bounds.x = cx - sw / 2.0;
    this.camera.bounds.y = cy - sh / 2.0;
    this.camera.bounds.width = sw;
    this.camera.bounds.height = sh;
    this.camera.update(delta);
  }

  protected abstract onInit(): void;

  protected abstract onPreUpdate(delta: number): void;

  protected abstract onPostUpdate(delta: number): void;

  /**
   * Converts a PIXI.Texture to a HTMLCanvasElement.
   *
   * @param texture The texture to convert.
   *
   * @return Returns the texture as a HTMLCanvasElement.
   *
   * @throws Error Thrown if the texture is null or undefined.
   */
  toCanvas(texture: PIXI.Texture): HTMLCanvasElement {
    if (texture == null) {
      throw new Error('The texture given is null or undefined.');
    }

    this.__toCanvasSprite.texture = texture;
    this.__toCanvasSprite.width = texture.width;
    this.__toCanvasSprite.height = texture.height;
    return this.app.renderer.extract.canvas(this.__toCanvasSprite);
  }
}

export default Renderer;

