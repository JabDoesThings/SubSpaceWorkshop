import Validatable from '../../util/Validatable';
import Rectangle = PIXI.Rectangle;
import uuid = require('uuid');

/**
 * The <i>MapSprite</i> class. TODO: Document.
 *
 * @author Jab
 */
export default class MapSprite implements Validatable {
  sequence: PIXI.Texture[];
  texture: PIXI.Texture;
  current: number[];
  id: string;
  frameWidth: number;
  frameHeight: number;
  framesX: number;
  framesY: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  frameX: number;
  frameY: number;
  frameTime: number;
  offset: number;
  dynamic: boolean;
  private dirty: boolean;
  private last: number;

  /**
   * @param {number} frameWidth
   * @param {number} frameHeight
   * @param {number} framesX
   * @param {number} framesY
   * @param {number} frameTime
   * @param {number} startX
   * @param {number} startY
   * @param {number} endX
   * @param {number} endY
   */
  constructor(frameWidth: number = -1, frameHeight: number = -1, framesX: number = 1, framesY: number = 1, frameTime: number = 1, startX: number = null, startY: number = null, endX: number = null, endY: number = null) {
    this.id = uuid.v4();
    if (frameWidth == null) {
      throw new Error('The value of "frameWidth" cannot be undefined.');
    } else if (frameHeight == null) {
      throw new Error('The value of "frameHeight" cannot be undefined.');
    }
    if (framesX == null) {
      throw new Error('The value of "framesX" cannot be undefined.');
    } else if (framesX < 1) {
      throw new Error('The value of "framesX" cannot be less than 1.');
    }
    if (framesY == null) {
      throw new Error('The value of "framesY" cannot be undefined.');
    } else if (framesY < 1) {
      throw new Error('The value of "framesY" cannot be less than 1.');
    }
    if (frameTime == null) {
      throw new Error('The value of "frameTime" cannot be undefined.');
    }

    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.framesX = framesX;
    this.framesY = framesY;
    this.frameTime = frameTime;

    if (startX != null) {
      this.startX = startX;
    } else {
      this.startX = 0;
    }
    if (startY != null) {
      this.startY = startY;
    } else {
      this.startY = 0;
    }
    if (endX != null) {
      this.endX = endX;
    } else {
      this.endX = framesX - 1;
    }
    if (endY != null) {
      this.endY = endY;
    } else {
      this.endY = framesY - 1;
    }

    this.frameX = this.startX;
    this.frameY = this.startY;
    this.current = [0, 0, 0, 0];
    this.offset = 0;
    this.validate();
    this.reset();
    this.dynamic = frameWidth === -1 && frameHeight === -1;
    this.dirty = true;
  }

  clone(): MapSprite {
    const mapSprite = new MapSprite(this.frameWidth, this.frameHeight);
    mapSprite.id = this.id;
    mapSprite.frameX = this.frameX;
    mapSprite.frameY = this.frameY;
    mapSprite.framesX = this.framesX;
    mapSprite.framesY = this.framesY;
    mapSprite.startX = this.startX;
    mapSprite.startY = this.startY;
    mapSprite.endX = this.endX;
    mapSprite.endY = this.endY;
    mapSprite.frameTime = this.frameTime;
    mapSprite.texture = this.texture;
    mapSprite.current = this.current;
    mapSprite.offset = this.offset;
    mapSprite.sequence = [];
    for (let index = 0; index < this.sequence.length; index++) {
      mapSprite.sequence.push(this.sequence[index]);
    }
    mapSprite.reset();
    return mapSprite;
  }

  /** @override */
  validate(): void {
    // Make sure that the 'startX' field is valid.
    if (this.startX < 0) {
      throw new Error('The value "startX" is less than 0.');
    } else if (this.startX > this.framesX - 1) {
      throw new Error(
        `The value "startX" is greater than the last frameX offset. (${this.framesX - 1})`
      );
    }
    // Make sure that the 'startY' field is valid.
    if (this.startY < 0) {
      throw new Error('The value "startY" is less than 0.');
    } else if (this.startY > this.framesY - 1) {
      throw new Error(
        `The value "startY" is greater than the last frameY offset. (${this.framesX - 1})`
      );
    }
    // Make sure that the 'endX' field is valid.
    if (this.endX < 0) {
      throw new Error('The value "endX" is less than 0.');
    } else if (this.endX > this.framesX - 1) {
      throw new Error(
        `The value "endX" is greater than the last frameX offset. (${this.framesX - 1})`
      );
    }
    // Make sure tha the 'endY' field is valid.
    if (this.endY < 0) {
      throw new Error("the value 'endY' is less than 0.");
    } else if (this.endY > this.framesY - 1) {
      throw new Error(
        `The value "endY" is greater than the last frameY offset. ("${this.framesY - 1})`
      );
    }
  }

  reset(): void {
    this.offset = 0;
    this.frameX = this.startX;
    this.frameY = this.startY;
    this.updateCurrent();
    this.last = Date.now();
  }

  preUpdate(): void {
  }

  update(): void {
    const now = Date.now();
    let delta = now - this.last;
    while (delta > this.frameTime) {
      delta -= this.frameTime;
      this.next();
    }
    this.last = now - delta;
  }

  postUpdate(): void {
    this.setDirty(false);
  }

  next(): void {
    this.offset++;
    this.frameX++;
    if (this.frameX > this.endX) {
      this.frameY++;
      this.frameX = this.startX;
      if (this.frameY > this.endY) {
        this.frameY = this.startY;
        this.offset = 0;
      }
    }
    this.updateCurrent();
  }

  updateCurrent(): void {
    const fw = this.frameWidth;
    const fh = this.frameHeight;
    if (fw <= 0 || fh <= 0) {
      this.current[0] = 0;
      this.current[1] = 0;
      this.current[2] = 0;
      this.current[3] = 0;
      return;
    }
    this.current[0] = this.frameX * this.frameWidth;
    this.current[1] = this.frameY * this.frameHeight;
    this.current[2] = this.frameWidth;
    this.current[3] = this.frameHeight;
  }

  destroy() {
    if (this.texture != null) {
      this.texture.destroy(true);
      this.texture = null;
    }
  }

  setTexture(texture: PIXI.Texture = null): void {
    if (texture != null) {
      this.texture = texture;

      const apply = () => {
        if (this.frameWidth == -1) {
          this.frameWidth = Math.round(this.texture.width / this.framesX);
        } else if (this.frameHeight == -1) {
          this.frameHeight = Math.round(this.texture.height / this.framesY);
        }
        // Cleanup if present.
        if (this.sequence != null && this.sequence.length != 0) {
          for (let index = 0; index < this.sequence.length; index++) {
            this.sequence[index].destroy(false);
          }
        }
        // If the texture does not animate, set the only sequenced texture as the one assigned
        //   to the sprite.
        if (this.startX === this.endX && this.startY === this.endY) {
          this.sequence = [texture];
          this.reset();
          return;
        }

        this.sequence = [];
        const w = this.frameWidth;
        const h = this.frameHeight;
        const base = this.texture.baseTexture;
        for (let y = this.startY; y <= this.endY; y++) {
          for (let x = this.startX; x <= this.endX; x++) {
            const rect = new Rectangle(x * w, y * h, w, h);
            const tex = new PIXI.Texture(base, rect);
            this.sequence.push(tex);
          }
        }
      };
      apply();
    }
  }

  isAnimated(): boolean {
    return this.texture != null && this.sequence != null && (this.framesX != 1 || this.framesY != 1);
  }

  draw(sprite: PIXI.Sprite): void {
    if (sprite == null) {
      return;
    }
    if (this.isAnimated()) {
      if (this.sequence[this.offset] != null) {
        sprite.texture = this.sequence[this.offset];
        sprite.visible = true;
        sprite.cacheAsBitmap = false;
      } else {
        sprite.visible = false;
      }
    } else {
      if (this.texture != null) {
        sprite.texture = this.texture;
        sprite.visible = true;
        sprite.cacheAsBitmap = true;
      } else {
        sprite.visible = false;
      }
    }
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
