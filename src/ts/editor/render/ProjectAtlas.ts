import { CustomEvent, CustomEventListener } from '../../ui/UI';
import MapSprite from './MapSprite';
import Dirtable from '../../util/Dirtable';
import Project from '../Project';
import TextureAtlas from './TextureAtlas';
import ProjectAtlasEvent from './ProjectAtlasEvent';
import TextureAtlasEvent from './TextureAtlasEvent';
import AtlasAction from './AtlasAction';

/**
 * The <i>ProjectAtlas</i> class. TODO: Document.
 *
 * @author Jab
 */
export default class ProjectAtlas extends CustomEventListener<CustomEvent> implements Dirtable {
  private readonly textures: { [id: string]: TextureAtlas } = {};
  private readonly tListener: (event: TextureAtlasEvent) => void | boolean;
  private readonly project: Project;
  private dirty: boolean = true;

  /**
   * @param project
   */
  constructor(project: Project) {
    super();
    this.project = project;
    this.tListener = (event => this.dispatch(event));
  }

  clone(project?: Project): ProjectAtlas {
    if (project == null) {
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
