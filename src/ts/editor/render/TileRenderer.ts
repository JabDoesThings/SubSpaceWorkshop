import { TileData } from '../../util/map/TileData';
import { Renderer } from '../../common/Renderer';
import { Project } from '../Project';
import { MapRenderer } from './MapRenderer';
import { UpdatedObject } from '../../util/UpdatedObject';
import { MapArea } from '../../util/map/MapArea';
import { CoordinateType } from '../../util/map/CoordinateType';

/**
 * The <i>TileRenderer</i> class. TODO: Document.
 *
 * @author Jab
 */
export class TileRenderer {

  readonly renderer: MapRenderer;
  readonly project: Project;
  readonly data: TileData;
  readonly container: PIXI.Container;
  readonly chunks: TileChunk[][];

  /**
   * @constructor
   *
   * @param {Project} project
   * @param {TileData} data
   */
  constructor(project: Project, data: TileData) {
    this.project = project;
    this.renderer = project.renderer;
    this.data = data;
    this.container = new PIXI.Container();
    this.container.filters = [Renderer.chromaFilter];
    this.container.filterArea = this.renderer.app.screen;
    this.chunks = [];
    for (let x = 0; x < 16; x++) {
      this.chunks[x] = [];
      for (let y = 0; y < 16; y++) {
        const chunk = new TileChunk(project, this.data, x, y);
        chunk.init();
        this.chunks[x][y] = chunk;
        this.container.addChild(chunk.tileMap);
        this.container.addChild(chunk.tileMapAnim);
      }
    }
  }

  update(delta: number): void {
    // ### DEBUG CODE ###
    //
    // let dirtyAreas = this.data.dirtyAreas;
    // if(dirtyAreas.length > 0) {
    //     let text = 'DIRTY AREAS: [\n';
    //     for(let index = 0; index < dirtyAreas.length; index++) {
    //         let next = dirtyAreas[index];
    //         text += '\n\t{x1: ' + next.x1 + ", y1: " + next.y1 + ", x2: " + next.x2 + ", y2: " + next.y2 + "},";
    //     }
    //     text += '\n]';
    //     console.log(text);
    // }
    //
    // ### DEBUG CODE ###
    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 16; y++) {
        this.chunks[x][y].update(delta);
      }
    }
  }

  draw(): void {
    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 16; y++) {
        this.chunks[x][y].draw();
      }
    }
  }

  onActivate(renderer: MapRenderer): void {
    renderer.mapLayers.layers[2].addChild(this.container);
  }
}

/**
 * The <i>TileChunk</i> class. TODO: Document.
 *
 * @author Jab
 */
export class TileChunk extends UpdatedObject {

  public static readonly LENGTH = 64;
  tileMap: any;
  tileMapAnim: any;
  private readonly project: Project;
  private readonly bounds: MapArea;
  private readonly tiles: TileData;
  private readonly x: number;
  private readonly y: number;
  private tilesAnim: TileEntry[];

  /**
   * @constructor
   *
   * @param {Project} project
   * @param {TileData} tiles
   * @param {number} x
   * @param {number} y
   */
  constructor(project: Project, tiles: TileData, x: number, y: number) {
    super();
    this.project = project;
    this.tiles = tiles;
    this.x = x;
    this.y = y;
    this.setRequireDirtyToUpdate(false);
    this.bounds = new MapArea(
      CoordinateType.TILE,
      x * 64,
      y * 64,
      ((x + 1) * 64) - 1,
      ((y + 1) * 64) - 1
    );
  }

  init(): void {
    if (this.tileMap != null) {
      this.tileMap.clear();
      this.tileMap = null;
    }
    if (this.tileMapAnim != null) {
      this.tileMapAnim.clear();
      this.tileMapAnim = null;
    }

    this.tilesAnim = [];
    const atlas = this.project.atlas;

    // @ts-ignore
    this.tileMap = new PIXI.tilemap.CompositeRectTileLayer(0, [
      atlas.getTextureAtlas('tiles').texture,
      atlas.getTextureAtlas('tile191').texture,
      atlas.getTextureAtlas('tile').texture,
      atlas.getTextureAtlas('tilenoradar').texture,
      atlas.getTextureAtlas('tilenobrick').texture,
      atlas.getTextureAtlas('tilenoweapon').texture,
      atlas.getTextureAtlas('tilenothor').texture
    ]);

    // @ts-ignore
    this.tileMapAnim = new PIXI.tilemap.CompositeRectTileLayer(0, [
      atlas.getTextureAtlas('tiles').texture,
      atlas.getTextureAtlas('over1').texture,
      atlas.getTextureAtlas('over2').texture,
      atlas.getTextureAtlas('over3').texture,
      atlas.getTextureAtlas('over4').texture,
      atlas.getTextureAtlas('over5').texture,
      atlas.getTextureAtlas('flag').texture,
      atlas.getTextureAtlas('goal').texture,
      atlas.getTextureAtlas('prizes').texture,
      atlas.getTextureAtlas('wall').texture,
    ]);

    this.setDirty(true);
  }

  /** @override */
  public onUpdate(delta: number): boolean {
    if (this.tileMap == null) {
      return;
    }

    const renderer = this.project.editor.renderer;
    const camera = renderer.camera;
    const tileset = this.project.tileset;

    if (camera.isDirty()) {
      const cameraPosition = camera.position;
      const scale = cameraPosition.scale;
      const invScale = 1 / scale;
      const screen = renderer.app.screen;
      const sw = screen.width * invScale;
      const sh = screen.height * invScale;
      const x = Math.floor((-1 + ((this.x * 64) - (cameraPosition.x * 16) + sw / 2)) - (this.x * 64));
      const y = 1 + Math.floor(((this.y * 64) - (cameraPosition.y * 16) + sh / 2) - (this.y * 64));
      this.tileMap.x = this.tileMapAnim.x = x * scale;
      this.tileMap.y = this.tileMapAnim.y = y * scale;
      this.tileMap.scale.x = this.tileMap.scale.y = cameraPosition.scale;
      this.tileMapAnim.scale.x = this.tileMapAnim.scale.y = cameraPosition.scale;
    }

    const x1 = this.bounds.x1;
    const y1 = this.bounds.y1;
    const x2 = this.bounds.x2;
    const y2 = this.bounds.y2;
    const atlas = this.project.atlas;
    if (tileset.isDirty() || atlas.isDirty() || this.tiles.containsDirtyArea(x1, y1, x2, y2)) {
      this.draw();
    }

    this.tileMapAnim.clear();

    for (let index = 0; index < this.tilesAnim.length; index++) {
      const next = this.tilesAnim[index];
      const texture = next.texture;
      const x = next.x;
      const y = next.y;
      const current = next.current;
      if (current != null) {
        this.tileMapAnim.addRect(texture, current[0], current[1], x, y, current[2], current[3]);
      } else {
        const tileCoordinates = tileset.getTileCoordinates(next.id);
        const tu = tileCoordinates[0];
        const tv = tileCoordinates[1];
        this.tileMapAnim.addRect(texture, tu, tv, x, y, 16, 16);
      }
    }

    this.setDirty(false);
  }

  draw() {
    const project = this.project;
    if (project == null) {
      return;
    }

    const tiles = this.tiles.getTiles(false);
    const tileset = this.project.tileset;
    const atlas = project.atlas;
    if (atlas.isDirty()) {
      this.tileMap.initialize(0, [
        atlas.getTextureAtlas('tiles').texture,
        atlas.getTextureAtlas('tile191').texture,
        atlas.getTextureAtlas('tile').texture,
        atlas.getTextureAtlas('tilenoradar').texture,
        atlas.getTextureAtlas('tilenobrick').texture,
        atlas.getTextureAtlas('tilenoweapon').texture,
        atlas.getTextureAtlas('tilenothor').texture
      ]);
      this.tileMapAnim.initialize(0, [
        atlas.getTextureAtlas('tiles').texture,
        atlas.getTextureAtlas('over1').texture,
        atlas.getTextureAtlas('over2').texture,
        atlas.getTextureAtlas('over3').texture,
        atlas.getTextureAtlas('over4').texture,
        atlas.getTextureAtlas('over5').texture,
        atlas.getTextureAtlas('flag').texture,
        atlas.getTextureAtlas('goal').texture,
        atlas.getTextureAtlas('prizes').texture,
        atlas.getTextureAtlas('wall').texture,
      ]);
    }

    this.tileMap.clear();
    this.tilesAnim = [];

    // Go through each tile position on the raster and add tiles when present.
    for (let x = this.x * 64; x < (this.x + 1) * 64; x++) {
      for (let y = this.y * 64; y < (this.y + 1) * 64; y++) {

        // Grab the next tile.
        const tileId = tiles[x][y];

        if (tileId > 0 && tileId <= 190) {
          const tileCoordinates = tileset.getTileCoordinates(tileId);
          const tu = tileCoordinates[0];
          const tv = tileCoordinates[1];

          if (tileId >= 162 && tileId <= 165) {
            this.tilesAnim.push({
              id: tileId,
              x: x * 16,
              y: y * 16,
              texture: 0,
              current: atlas.getTextureAtlas('tiles').getSpriteById('door01').current
            });
          } else if (tileId >= 166 && tileId <= 169) {
            this.tilesAnim.push({
              id: tileId,
              x: x * 16,
              y: y * 16,
              texture: 0,
              current: atlas.getTextureAtlas('tiles').getSpriteById('door02').current
            });
          } else if (tileId == 170) {
            this.tilesAnim.push({
              id: tileId,
              x: x * 16,
              y: y * 16,
              texture: 6,
              current: atlas.getTextureAtlas('flag').getSpriteById('flagblue').current
            });
          } else if (tileId == 172) {
            this.tilesAnim.push({
              id: tileId,
              x: x * 16,
              y: y * 16,
              texture: 7,
              current: atlas.getTextureAtlas('goal').getSpriteById('goalblue').current
            });
          }
          // These tiles are see-through in-game, so set these in animation tilemap So that they are see-through.
          else if (tileId >= 173 && tileId <= 190) {
            this.tilesAnim.push({
              id: tileId,
              x: x * 16,
              y: y * 16,
              texture: 0,
              current: [tu, tv, 16, 16]
            });
          } else {

            // @ts-ignore
            this.tileMap.addRect(0, tu, tv, x * 16, y * 16, 16, 16);
          }

        } else if (tileId === 191) {
          // @ts-ignore
          this.tileMap.addRect(1, 0, 0, x * 16, y * 16, 16, 16);
        } else if ((tileId >= 192 && tileId <= 215) || (tileId >= 221 && tileId <= 240)) {
          // @ts-ignore
          this.tileMap.addRect(2, 0, 0, x * 16, y * 16, 16, 16);
        } else if (tileId >= 216 && tileId <= 220) {
          let current: number[] = null;
          let texture = 0;
          if (tileId == 216) {
            texture = 1;
            current = atlas.getTextureAtlas('over1').getSpriteById('over1').current;
          } else if (tileId == 217) {
            texture = 2;
            current = atlas.getTextureAtlas('over2').getSpriteById('over2').current;
          } else if (tileId == 218) {
            texture = 3;
            current = atlas.getTextureAtlas('over3').getSpriteById('over3').current;
          } else if (tileId == 219) {
            texture = 4;
            current = atlas.getTextureAtlas('over4').getSpriteById('over4').current;
          } else if (tileId == 220) {
            texture = 5;
            current = atlas.getTextureAtlas('over5').getSpriteById('over5').current;
          }
          this.tilesAnim.push({
            id: tileId,
            x: x * 16,
            y: y * 16,
            texture: texture,
            current: current
          });
        } else if ((tileId === 241)) {
          // @ts-ignore
          this.tileMap.addRect(5, 0, 0, x * 16, y * 16, 16, 16);
        } else if ((tileId === 242)) {
          // @ts-ignore
          this.tileMap.addRect(6, 0, 0, x * 16, y * 16, 16, 16);
        } else if ((tileId >= 243 && tileId <= 251)) {
          // @ts-ignore
          this.tileMap.addRect(3, 0, 0, x * 16, y * 16, 16, 16);
        } else if ((tileId === 252)) {
          this.tilesAnim.push({
            id: tileId,
            x: x * 16,
            y: y * 16,
            texture: 9,
            current: atlas.getTextureAtlas('wall').getSpriteById('wallblue').current
          });
        } else if ((tileId === 253)) {
          this.tilesAnim.push({
            id: tileId,
            x: x * 16,
            y: y * 16,
            texture: 9,
            current: atlas.getTextureAtlas('wall').getSpriteById('wallyellow').current
          });
        } else if ((tileId === 254)) {
          // @ts-ignore
          this.tileMap.addRect(4, 0, 0, x * 16, y * 16, 16, 16);
        } else if ((tileId === 255)) {
          this.tilesAnim.push({
            id: tileId,
            x: x * 16,
            y: y * 16,
            texture: 8,
            current: atlas.getTextureAtlas('prizes').getSpriteById('prizes').current
          });
        } else {
          const tileCoordinates = tileset.getTileCoordinates(tileId);
          if (tileCoordinates != null) {
            let tu = tileCoordinates[0];
            let tv = tileCoordinates[1];
            // @ts-ignore
            this.tileMap.addRect(1, tu, tv, x * 16, y * 16, 16, 16);
          }
        }
      }
    }
  }

  getBounds(): MapArea {
    return this.bounds;
  }
}

/**
 * The <i>TileEntry</i> interface. TODO: Document.
 *
 * @author Jab
 */
interface TileEntry {
  id: number;
  x: number;
  y: number;
  texture: number;
  current: number[];
}
