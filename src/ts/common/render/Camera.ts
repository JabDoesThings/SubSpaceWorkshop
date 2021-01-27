import UpdatedObject from '../../util/UpdatedObject';
import Path from '../../util/Path';
import KeyListener from '../../util/KeyListener';
import * as PIXI from "pixi.js";
import PathCoordinates from '../../util/PathCoordinates';
import PathMode from '../../util/PathMode';
import { MAP_LENGTH } from '../../io/LVL';
import Renderer from './Renderer';
import MapSpace from '../MapSpace';
import ScreenSpace from '../ScreenSpace';

/**
 * The <i>Camera</i> class. TODO: Document.
 *
 * @author Jab
 */
class Camera extends UpdatedObject {
  path: Path;
  alt: KeyListener;
  bounds: PIXI.Rectangle;
  coordinateMin: number;
  coordinateMax: number;
  position: { x: number, y: number, scale: number };
  private readonly keys: { [key: string]: boolean } = {};
  private positionPrevious: { x: number, y: number, scale: number };
  private shift: boolean;
  private renderer: Renderer;

  /**
   * @param {Renderer} renderer
   */
  constructor(renderer: Renderer) {
    super();
    this.renderer = renderer;

    window.onkeyup = (e: KeyboardEvent) => {
      this.keys[e.key.toLowerCase()] = false;
    };
    window.onkeydown = (e: KeyboardEvent) => {
      this.keys[e.key.toLowerCase()] = true;
    };

    this.path = new Path();
    this.shift = false;

    this.setRequireDirtyToUpdate(false);

    this.coordinateMin = 0;
    this.coordinateMax = MAP_LENGTH;

    // Set the initial position to be the center of the map with the default scale.
    this.position = {
      x: this.coordinateMax / 2,
      y: this.coordinateMax / 2,
      scale: 0.25,
    };

    this.positionPrevious = {
      x: this.position.x,
      y: this.position.y,
      scale: this.position.scale,
    };

    this.bounds = new PIXI.Rectangle(0, 0, 0, 0);

    // Make sure anything dependent on the camera being dirty renders on the first render call.
    this.setDirty(true);
  }

  /** @override */
  onUpdate(delta: number): boolean {
    this.path.update();

    let speed = 1 / this.position.scale;
    if (this.isKeyDown('shift')) {
      speed *= 2;
    }

    const up = this.isKeyDown('arrowup') || this.isKeyDown('w');
    const down = this.isKeyDown('arrowdown') || this.isKeyDown('s');
    const left = this.isKeyDown('arrowleft') || this.isKeyDown('a');
    const right = this.isKeyDown('arrowright') || this.isKeyDown('d');

    if (up != down) {
      if (up) {
        this.position.y -= speed;
        this.path.cancel(this.position.x, this.position.y, false);
        this.setDirty(true);
      }

      if (down) {
        this.position.y += speed;
        this.path.cancel(this.position.x, this.position.y, false);
        this.setDirty(true);
      }

      if (this.position.y <= this.coordinateMin) {
        this.position.y = this.coordinateMin;
        this.path.cancel(this.position.x, this.position.y, false);
      } else if (this.position.y >= this.coordinateMax) {
        this.position.y = this.coordinateMax;
        this.path.cancel(this.position.x, this.position.y, false);
      }
    }

    if (left != right) {
      if (left) {
        this.position.x -= speed;
        this.path.cancel(this.position.x, this.position.y, false);
        this.setDirty(true);
      }

      if (right) {
        this.position.x += speed;
        this.path.cancel(this.position.x, this.position.y, false);
        this.setDirty(true);
      }

      if (this.position.x <= this.coordinateMin) {
        this.position.x = this.coordinateMin;
        this.path.cancel(this.position.x, this.position.y, false);
      } else if (this.position.x >= this.coordinateMax) {
        this.position.x = this.coordinateMax;
        this.path.cancel(this.position.x, this.position.y, false);
      }
    }

    if (this.positionPrevious.x !== this.position.x || this.positionPrevious.y !== this.position.y || this.positionPrevious.scale !== this.position.scale) {
      this.setDirty(true);
      this.positionPrevious.x = this.position.x;
      this.positionPrevious.y = this.position.y;
      this.positionPrevious.scale = this.position.scale;
    }

    if (this.isKeyDown('1')) {
      this.pathTo({x: 0, y: 0, scale: 1});
    }
    if (this.isKeyDown('2')) {
      this.pathTo({x: this.coordinateMax, y: 0, scale: 1});
    }
    if (this.isKeyDown('3')) {
      this.pathTo({x: 0, y: this.coordinateMax, scale: 1});
    }
    if (this.isKeyDown('4')) {
      this.pathTo({x: this.coordinateMax, y: this.coordinateMax, scale: 1});
    }
    if (this.isKeyDown('5')) {
      this.pathTo({x: this.coordinateMax / 2, y: this.coordinateMax / 2, scale: 1});
    }

    return true;
  }

  toMapSpace(sx: number, sy: number, sw: number, sh: number, scale: number = null): MapSpace {
    if (scale == null) {
      scale = this.position.scale;
    }

    const invScale = 1 / scale;
    const tileLength = 16 * scale;
    const cx = this.position.x * tileLength;
    const cy = this.position.y * tileLength;
    const mx = Math.floor((cx + (sx - (sw / 2.0))));
    const my = Math.floor((cy + (sy - (sh / 2.0))));
    const tx = Math.floor(mx / tileLength);
    const ty = Math.floor(my / tileLength);

    return {
      x: Math.floor(mx * invScale),
      y: Math.floor(my * invScale),
      tileX: tx,
      tileY: ty,
    };
  }

  toScreenSpace(x: number, y: number, sw: number, sh: number, scale: number = null): ScreenSpace {
    if (scale == null) {
      scale = this.position.scale;
    }

    const cx = this.position.x;
    const cy = this.position.y;
    const mx = Math.floor(x);
    const my = Math.floor(y);
    const ox = sw / 2.0;
    const oy = sh / 2.0;

    const sx = Math.floor((mx) * scale) + ox;
    const sy = Math.floor((my) * scale) + oy;

    return {
      x: sx,
      y: sy,
      tileX: -1,
      tileY: -1,
    };
  }

  pathTo(coordinates: PathCoordinates, ticks: number = 1, mode: PathMode = PathMode.LINEAR) {
    const callback = (x: number, y: number, scale: number, lerp: number): void => {
      if (x != null) {
        this.position.x = x;
      }
      if (y != null) {
        this.position.y = y;
      }
      if (scale != null) {
        this.position.scale = scale;
      }
      if (x != null || y != null || scale != null) {
        this.setDirty(true);
      }
      this.renderer.bloomFilter.enabled = lerp < 1;
      this.renderer.bloomFilter.bloomScale = (1 - lerp) / 4;
    };

    this.path.x = this.position.x;
    this.path.y = this.position.y;
    this.path.scale = this.position.scale;

    this.path.to(coordinates, [callback], ticks, mode);
  }

  isKeyDown(key: string) {
    return this.keys[key] === true;
  }
}

export default Camera;
