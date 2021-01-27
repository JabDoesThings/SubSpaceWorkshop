import { Texture } from "pixi.js";
import { CustomEventListener } from '../../ui/UI';
import Dirtable from '../../util/Dirtable';
import MapSprite from './MapSprite';
import TextureAtlasEvent from './TextureAtlasEvent';
import TextureAtlasAction from './ProjectAtlasAction';

/**
 * The <i>TextureAtlas</i> class. TODO: Document.
 *
 * @author Jab
 */
export default class TextureAtlas extends CustomEventListener<TextureAtlasEvent> implements Dirtable {
  readonly id: string;
  sprites: { [id: string]: MapSprite } = {};
  texture: Texture;
  dirty: boolean = true;

  /**
   * @param {string} id
   * @param {Texture} texture
   */
  constructor(id: string, texture: Texture) {
    super();
    this.id = id.toLowerCase();
    this.setTexture(texture);
  }

  clone(): TextureAtlas {
    const textureAtlas = new TextureAtlas(this.id, this.texture);
    for (let id in this.sprites) {
      textureAtlas.sprites[id] = this.sprites[id].clone();
    }
    return textureAtlas;
  }

  preUpdate(): void {
    for (let id in this.sprites) {
      this.sprites[id].preUpdate();
    }
  }

  update(): void {
    for (let id in this.sprites) {
      this.sprites[id].update();
    }
  }

  postUpdate(): void {
    for (let id in this.sprites) {
      this.sprites[id].postUpdate();
    }
    this.setDirty(false);
  }

  addSprite(id: string, sprite: MapSprite): void {
    if (sprite == null) {
      throw new Error(`The sprite given is null: ${id}`);
    }

    id = id.toLowerCase();
    sprite.id = id;
    this.sprites[id] = sprite;

    const sprites: { [id: string]: MapSprite } = {};
    sprites[id] = sprite;

    this.dispatch({
      eventType: 'TextureAtlasEvent',
      textureAtlas: this,
      action: TextureAtlasAction.SET_SPRITES,
      sprites: sprites,
      forced: true
    });

    this.applySprite(sprite);
  }

  private applySprite(sprite: MapSprite) {
    if (sprite.dynamic) {
      if (this.texture != null) {
        sprite.frameWidth = this.texture.width / sprite.framesX;
        sprite.frameHeight = this.texture.height / sprite.framesY;
      } else {
        sprite.frameWidth = -1;
        sprite.frameHeight = -1;
      }
    }
    sprite.reset();
    sprite.setTexture(this.texture);
    sprite.setDirty(true);
  }

  removeSprite(id: string): void {

    const sprite = this.sprites[id.toLowerCase()];
    this.sprites[id.toLowerCase()] = null;

    const sprites: { [id: string]: MapSprite } = {};
    sprites[id] = sprite;

    this.dispatch({
      eventType: 'TextureAtlasEvent',
      textureAtlas: this,
      action: TextureAtlasAction.REMOVE_SPRITES,
      sprites: sprites,
      forced: true
    });

    this.setDirty(true);
  }

  /**
   * @param {Texture} texture
   */
  setTexture(texture: Texture): void {
    this.texture = texture;

    const apply = (): void => {
      for (let id in this.sprites) {
        if (!this.sprites[id]) {
          console.warn(`The sprite ID ${id} is null.`);
          continue;
        }
        const sprite = this.sprites[id];
        this.applySprite(sprite);
      }

      this.dispatch({
        eventType: 'TextureAtlasEvent',
        textureAtlas: this,
        action: TextureAtlasAction.UPDATE,
        sprites: this.sprites,
        forced: true
      });
      this.setDirty(true);
    };

    if (this.texture != null) {
      if (this.texture.valid) {
        apply();
      } else {
        this.texture.addListener('update', () => {
          apply();
        });
      }
    } else {
      apply();
    }
  }

  clear(): boolean {
    for (let id in this.sprites) {
      this.sprites[id].setTexture(null);
    }

    this.dispatch({
      eventType: 'TextureAtlasEvent',
      textureAtlas: this,
      action: TextureAtlasAction.CLEAR_SPRITES,
      sprites: this.sprites,
      forced: true
    });

    this.sprites = {};
    this.setDirty(true);
    return false;
  }

  getSpriteById(id: string): MapSprite {
    return this.sprites[id.toLowerCase()];
  }

  /** @override */
  isDirty(): boolean {
    if (!this.dirty) {
      for (let id in this.sprites) {
        const next = this.sprites[id];
        if (next.isDirty()) {
          return true;
        }
      }
    }
    return this.dirty;
  }

  /** @override */
  setDirty(flag: boolean): void {
    this.dirty = flag;
  }
}
