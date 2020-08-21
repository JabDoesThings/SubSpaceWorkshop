import { CustomEventListener, CustomEvent } from '../../ui/UI';
import { Texture } from "pixi.js";
import { MapSprite } from './MapSprite';
import { Dirtable } from '../../util/Dirtable';
import { Project } from '../Project';

/**
 * The <i>ProjectAtlas</i> class. TODO: Document.
 *
 * @author Jab
 */
export class ProjectAtlas extends CustomEventListener<CustomEvent> implements Dirtable {

  private readonly textures: { [id: string]: TextureAtlas };
  private readonly tListener: (event: TextureAtlasEvent) => void | boolean;
  private dirty: boolean;
  private project: Project;

  constructor(project: Project) {
    super();
    this.project = project;
    this.textures = {};
    this.tListener = (event => this.dispatch(event));
    this.dirty = true;
  }

  clone(project?: Project): ProjectAtlas {
    if(project == null) {
      project = this.project;
    }
    const projectAtlas = new ProjectAtlas(project);
    for (let id in this.textures) {
      projectAtlas.textures[id] = this.textures[id].clone();
      projectAtlas.textures[id].addEventListener(projectAtlas.tListener);
    }
    projectAtlas.setDirty(true);
    return projectAtlas;
  }

  preUpdate(): void {
    for (let id in this.textures) {
      this.textures[id].preUpdate();
    }
  }

  /** Updates all sprites registered in the atlas. */
  update(): void {
    for (let id in this.textures) {
      this.textures[id].update();
    }
  }

  postUpdate(): void {
    for (let id in this.textures) {
      this.textures[id].postUpdate();
    }
  }

  /**
   * Removes a texture and all sprites assigned to the texture.
   *
   * @param {string} textureId The ID to assign the texture.<p>
   * <b>NOTE</b>: The ID will be lower-cased.
   */
  removeTexture(textureId: string): boolean {
    const texture = this.textures[textureId.toLowerCase()];
    if (texture == null) {
      return false;
    }

    texture.removeEventListener(this.tListener);
    this.textures[textureId.toLowerCase()] = null;
    this.setDirty(true);

    const textures: { [id: string]: TextureAtlas } = {};
    textures[textureId] = texture;
    this.dispatch(<ProjectAtlasEvent> {
      eventType: 'ProjectAtlasEvent',
      projectAtlas: this,
      action: AtlasAction.REMOVE_TEXTURES,
      textures: textures,
      forced: true
    });
    return false;
  }

  /**
   * Clears all textures and sprites assigned to the texture in the atlas.
   *
   * @return {boolean}
   */
  clear(): boolean {
    for (let textureId in this.textures) {
      this.textures[textureId] = null;
    }

    this.setDirty(true);
    this.dispatch(<ProjectAtlasEvent> {
      eventType: 'ProjectAtlasEvent',
      projectAtlas: this,
      action: AtlasAction.REMOVE_TEXTURES,
      textures: this.textures,
      forced: true
    });

    return false;
  }

  /**
   * @param {string} textureId The ID of the texture. <p>
   * <b>NOTE</b>: The ID will be lower-cased.
   *
   * @return Returns the texture assigned to the id.
   */
  getTextureAtlas(textureId: string): TextureAtlas {
    return this.textures[textureId.toLowerCase()];
  }

  /**
   * Assigns a texture to the ID given.
   *
   * @param {TextureAtlas} texture
   */
  setTextureAtlas(texture: TextureAtlas): boolean {
    if (texture == null) {
      throw new Error('The TextureAtlas given is null or undefined.');
    }

    this.removeTexture(texture.id);
    this.textures[texture.id] = texture;
    texture.addEventListener(this.tListener);
    this.dirty = true;

    const textures: { [id: string]: TextureAtlas } = {};
    textures[texture.id] = texture;
    this.dispatch(<ProjectAtlasEvent> {
      eventType: 'ProjectAtlasEvent',
      projectAtlas: this,
      action: AtlasAction.SET_TEXTURES,
      textures: textures,
      forced: true
    });

    return false;
  }

  getTextureAtlases(): { [id: string]: TextureAtlas } {
    return this.textures;
  }

  /** @override */
  isDirty(): boolean {
    if (!this.dirty) {
      for (let id in this.textures) {
        const next = this.textures[id];
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

  getSpriteById(id: string): MapSprite {
    id = id.toLowerCase();
    for (let textureId in this.textures) {
      const nextTexture = this.textures[textureId];
      const sprite = nextTexture.getSpriteById(id);
      if (sprite != null) {
        return sprite;
      }
    }
    return null;
  }
}

/**
 * The <i>TextureAtlas</i> class. TODO: Document.
 *
 * @author Jab
 */
export class TextureAtlas extends CustomEventListener<TextureAtlasEvent> implements Dirtable {

  readonly id: string;

  sprites: { [id: string]: MapSprite };
  texture: Texture;
  dirty: boolean;

  /**
   * @constructor
   *
   * @param {string} id
   * @param {Texture} texture
   */
  constructor(id: string, texture: Texture) {
    super();
    this.id = id.toLowerCase();
    this.sprites = {};
    this.setTexture(texture);
    this.dirty = true;
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

export interface ProjectAtlasEvent extends CustomEvent {
  projectAtlas: ProjectAtlas;
  action: AtlasAction;
  textures: { [id: string]: TextureAtlas };
}

export interface TextureAtlasEvent extends CustomEvent {
  textureAtlas: TextureAtlas;
  action: TextureAtlasAction;
  sprites: { [id: string]: MapSprite };
}

export enum TextureAtlasAction {
  UPDATE = 'update',
  REMOVE = 'remove',
  SET_SPRITES = 'set-sprites',
  REMOVE_SPRITES = 'remove-sprites',
  CLEAR_SPRITES = 'clear-sprites',
}

export enum AtlasAction {
  CLEAR = 'clear',
  SET_TEXTURES = 'set-textures',
  REMOVE_TEXTURES = 'remove-textures',
}
