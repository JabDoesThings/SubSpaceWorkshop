import { CustomEvent, CustomEventListener } from './ui/CustomEventListener';
import { CompiledLVZScreenObject, loadTexture, LVZPackage, LVZResource, readLVZ } from '../io/LVZ';
import { Project } from './Project';
import { ProjectAtlas, TextureAtlas } from './render/ProjectAtlas';
import { MapSprite } from './render/MapSprite';
import { MapArea } from '../util/map/MapArea';
import { CoordinateType } from '../util/map/CoordinateType';
import Texture = PIXI.Texture;

/**
 * The <i>LVZManager</i> class. TODO: Document.
 *
 * @author Jab
 */
export class LVZManager extends CustomEventListener<LVZEvent> {
  packages: LVZPackage[] = [];
  project: Project;
  lvzDirtyRange: { x1: number, y1: number, x2: number, y2: number } = {x1: 0, x2: 0, y1: 16384, y2: 16384};
  resourceDirty: boolean = false;
  loaded: boolean = false;
  dirty: boolean = true;

  /**
   * @param {Project} project
   */
  constructor(project: Project) {
    super();
    this.project = project;
  }

  /**
   * Loads LVZ file paths.
   *
   * @param {string[]} paths The paths to LVZ files to load.
   * @param {boolean} override
   */
  load(paths: string[], override: boolean = false): void {
    if ((!override && this.loaded) || paths.length === 0) {
      return;
    }
    for (let index = 0; index < paths.length; index++) {
      let next = readLVZ(paths[index]).inflate();
      this.packages.push(next);
    }
    if (this.packages.length === 0) {
      return;
    }
    this.applyToAtlas(this.project.atlas);
    this.loaded = true;
    this.dirty = true;
  }

  unload(): void {
    this.packages = [];
    this.setDirtyArea(new MapArea(CoordinateType.PIXEL, 0, 0, 16384, 16384));
    this.loaded = false;
    this.dirty = true;
  }

  onPostUpdate(): void {
    if (this.dirty) {
      this.dirty = false;
      this.lvzDirtyRange.x1 = 999999;
      this.lvzDirtyRange.y1 = 999999;
      this.lvzDirtyRange.x2 = -999999;
      this.lvzDirtyRange.y2 = -999999;
    }
    if (this.resourceDirty) {
      this.resourceDirty = false;
    }
  }

  isDirty(x1: number = 0, y1: number = 0, x2: number = 16384, y2: number = 16384): boolean {
    const bx1 = this.lvzDirtyRange.x1;
    const by1 = this.lvzDirtyRange.y1;
    const bx2 = this.lvzDirtyRange.x2;
    const by2 = this.lvzDirtyRange.y2;
    return !(bx2 < x1 || bx1 > x2) && !(by2 < y1 || by1 > y2);
  }

  setDirtyPoint(x: number, y: number): void {
    this.dirty = true;
    if (this.lvzDirtyRange.x1 > x) {
      this.lvzDirtyRange.x1 = x;
    }
    if (this.lvzDirtyRange.y1 > y) {
      this.lvzDirtyRange.y1 = y;
    }
    if (this.lvzDirtyRange.x2 < x) {
      this.lvzDirtyRange.x2 = x;
    }
    if (this.lvzDirtyRange.y2 < y) {
      this.lvzDirtyRange.y2 = y;
    }
  }

  setDirtyArea(area: MapArea): void {
    if (area == null) {
      throw new Error('The MapArea given is null.');
    }
    if (area.type === CoordinateType.TILE) {
      area = area.asType(CoordinateType.PIXEL);
    }
    this.dirty = true;
    this.lvzDirtyRange.x1 = area.x1;
    this.lvzDirtyRange.y1 = area.y1;
    this.lvzDirtyRange.x2 = area.x2;
    this.lvzDirtyRange.y2 = area.y2;
  }

  getScreenObjects(): CompiledLVZScreenObject[] {
    const objects: CompiledLVZScreenObject[] = [];
    for (let index = 0; index < this.packages.length; index++) {
      const nextPkg = this.packages[index];
      if (nextPkg.screenObjects.length === 0) {
        continue;
      }
      for (let sIndex = 0; sIndex < nextPkg.screenObjects.length; sIndex++) {
        objects.push(nextPkg.screenObjects[sIndex]);
      }
    }
    return objects;
  }

  getResource(id: string): LVZResource {
    if (this.packages.length === 0) {
      return null;
    }
    id = id.toLowerCase();
    for (let index = 0; index < this.packages.length; index++) {
      const nextPackage = this.packages[index];
      if (nextPackage.resources.length === 0) {
        continue;
      }
      for (let resourceIndex = 0; resourceIndex < nextPackage.resources.length; resourceIndex++) {
        const nextResource = nextPackage.resources[resourceIndex];
        if (nextResource.getName().toLowerCase() === id) {
          return nextResource;
        }
      }
    }
    return null;
  }

  private applyToAtlas(atlas: ProjectAtlas) {
    try {
      for (let index = 0; index < this.packages.length; index++) {

        const next = this.packages[index];
        if (next.resources == null || next.resources.length === 0) {
          continue;
        }
        for (let rIndex = 0; rIndex < next.resources.length; rIndex++) {
          const nextResource = next.resources[rIndex];
          if (!nextResource.isImage() || nextResource.isEmpty()) {
            continue;
          }

          const split = nextResource.getName().toLowerCase().split('.');
          const id = split[0];

          let textureAtlas = atlas.getTextureAtlas(id);
          if (textureAtlas == null) {
            textureAtlas = new TextureAtlas(id, null);
            atlas.setTextureAtlas(textureAtlas);
          }

          loadTexture(nextResource, (texture: Texture) => {
            textureAtlas.setTexture(texture);
          });
        }
      }

      for (let index = 0; index < this.packages.length; index++) {
        const next = this.packages[index];
        if (next.images.length === 0) {
          continue;
        }

        for (let imageIndex = 0; imageIndex < next.images.length; imageIndex++) {
          const nextImage = next.images[imageIndex];
          const imageId = next.name + '>>>' + imageIndex;

          let id = nextImage.fileName.toLowerCase();
          if (id.indexOf('.') > -1) {
            let split = id.split('.');
            id = split[0];
          }

          const textureAtlas = atlas.getTextureAtlas(id);
          if (textureAtlas == null) {
            console.log(
              `The image[${imageIndex}] for the LVZ package '${next.name}${+'\' cannot load because the linked resource \''}${nextImage.fileName}'is not loaded.`
            );
            continue;
          }

          const xFrames = nextImage.xFrames;
          const yFrames = nextImage.yFrames;
          const time = nextImage.animationTime / 10;
          const sprite = new MapSprite(-1, -1, xFrames, yFrames, time);
          textureAtlas.addSprite(imageId, sprite);
        }
      }
    } catch (e) {
      console.error(e);
    }

    setTimeout(() => {
      console.log(atlas);
    }, 1000);
  }

  static readonly LVZ_EXEMPT_IMAGES = [
    'bg01', 'bg02', 'bg03', 'bg04', 'bg05', 'bg06', 'bg07', 'bg08', 'bg09', 'bg10', 'bg11', 'bg12', 'bg13', 'bg14',
    'star01', 'star02', 'star03', 'star04', 'star05', 'star06', 'star07',
    'hugefont', 'hugefontf', 'largefont', 'largefontf', 'tallfont', 'tallfontf', 'shrtfont', 'shrtfontf', 'specfont', 'engyfont',
    'junkjv', 'junklv', 'junknw', 'junksh', 'junksp', 'junkte', 'junkwb', 'junkwe',
    'jvroll', 'lvroll', 'nwroll', 'teroll', 'wbroll', 'weroll', 'shroll', 'sproll',
    'ships', 'ship1', 'ship2', 'ship3', 'ship4', 'ship5', 'ship6', 'ship7', 'ship8',
    'explode0', 'explode1', 'explode2',
    'over1', 'over2', 'over3', 'over4', 'over5',
    'turret', 'turret2',
    'icondoor', 'icons',
    'radarh', 'radarv',
    'king', 'kingex',
    'bombflsh',
    'bombs',
    'bullets',
    'chatbg',
    'colors',
    'damage',
    'disp',
    'dropflag',
    'empburst',
    'exhaust',
    'flag',
    'goal',
    'gradient',
    'hlthbar',
    'led',
    'menutext',
    'mines',
    'powerb',
    'prizes',
    'repel',
    'rocket',
    'shield',
    'shrapnel',
    'spark',
    'spectate',
    'ssshield',
    'super',
    'tiles',
    'trail',
    'wall',
    'warp',
    'warppnt'
  ];
}

export interface LVZEvent extends CustomEvent {
  packages: LVZPackage[];
  action: LVZAction;
}

export enum LVZAction {
  LOAD_PACKAGES = 'load-packages',
  LOADED_PACKAGES = 'loaded-packages',
  UNLOAD_PACKAGES = 'unload-packages',
  UNLOADED_PACKAGES = 'unloaded-packages',
}
