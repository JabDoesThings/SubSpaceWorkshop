import Item from './Item';
import MapSprite from '../render/MapSprite';
import ItemSelector from './ItemSelector';

/**
 * The <i>SpriteItem</i> class. TODO: Document.
 *
 * @author Jab
 */
export default class SpriteItem extends Item {
  _sprite: PIXI.Sprite;
  sprite: MapSprite;
  lastOffset: number = -1;
  hoverAlphaMin: number = 0.25;
  hoverAlphaIncrement: number = 0.1;

  /**
   * @param {ItemSelector} selector
   * @param {string} type
   * @param {string} id
   * @param {MapSprite} sprite
   */
  constructor(selector: ItemSelector, type: string, id: string, sprite: MapSprite) {
    super(selector, type, id);
    this.sprite = sprite;
    this._sprite = new PIXI.Sprite();
    this._sprite.width = 0;
    this._sprite.height = 0;
    this.container.removeChildren();
    this.container.addChild(this._sprite);
    this.container.addChild(this.outline);
    this.container.sortableChildren = false;
    this.container.sortDirty = false;
    this.container.interactive = false;
    this.container.interactiveChildren = false;
  }

  /** @override */
  onUpdate(): void {
    if (this.selector.hovered && !this.isPrimary() && !this.isSecondary() && this.selector.hoveredItem !== this) {
      if (this._sprite.alpha > this.hoverAlphaMin) {
        this._sprite.alpha -= this.hoverAlphaIncrement;
        if (this._sprite.alpha < this.hoverAlphaMin) {
          this._sprite.alpha = this.hoverAlphaMin;
        }
      }
    } else {
      if (this.selector.hovered) {
        this._sprite.alpha = 1.0;
      } else {
        if (this._sprite.alpha < 1) {
          this._sprite.alpha += this.hoverAlphaIncrement;
          if (this._sprite.alpha < 1) {
            this._sprite.alpha = 1;
          }
        }
      }
    }
    if (this.isDirty() || this.lastOffset !== this.sprite.offset) {
      // Update the sprite's coordinates.
      this._sprite.x = this.x;
      this._sprite.y = this.y;
      this._sprite.width = this.w;
      this._sprite.height = this.h;
      // Update the texture.
      this.draw();
      // Reset the item's state.
      this.lastOffset = this.sprite.offset;
      this.setDirty(false);
    }
  }

  /** @override */
  draw(): void {
    const sequence = this.sprite.sequence;
    if (sequence == null) {
      return;
    }
    this.sprite.draw(this._sprite);
  }

  /** @override */
  getContainer(): PIXI.Container {
    return this.container;
  }

  /** @override */
  getSourceWidth(): number {
    return this.sprite.frameWidth;
  }

  /** @override */
  getSourceHeight(): number {
    return this.sprite.frameHeight;
  }

  /** @override */
  isDirty(): boolean {
    return this.dirty || this.sprite.isDirty();
  }

  /** @override */
  setDirty(flag: boolean): void {
    this.dirty = flag;
    if (!flag) {
      this.sprite.setDirty(false);
    }
  }
}
