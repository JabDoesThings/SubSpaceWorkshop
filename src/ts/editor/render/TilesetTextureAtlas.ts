import TextureAtlas from './TextureAtlas';
import { Texture } from "pixi.js";
import MapSprite from './MapSprite';

/**
 * The <i>TilesetTextureAtlas</i> class handles {@link MapSprite map sprites} for tiles in SubSpace tile sets.
 *
 * @author Jab
 */
export default class TilesetTextureAtlas extends TextureAtlas {

  private readonly tiles: MapSprite[] = new Array(191);
  private readonly doors: MapSprite[] = [];

  /**
   * @param texture The texture of the tileset.
   */
  constructor(texture: Texture) {
    super('tiles', texture);

    // Regular tiles.
    let index = 1;
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 19; x++) {
        const nextTile = this.tiles[index] = new MapSprite(16, 16, 19, 10, 1, x, y, x, y);
        this.addSprite('' + index, nextTile);
        index++;
      }
    }

    // Door animations.
    this.createDoorTile(1, 9, 8, 12, 8, 80);
    this.createDoorTile(2, 13, 8, 16, 8, 80);
  }

  /** @override */
  clone(): TilesetTextureAtlas {
    return new TilesetTextureAtlas(this.texture);
    // Clone all door sprites.
    // for (let index in Object.keys(next.doors)) {
    //   console.log(`index: ${index} value: ${next.doors[index]}`);
    //   if (next.doors[index]) {
    //     next.removeSprite(next.doors[index].id);
    //   }
    // }
    // next.doors.length = 0;
    // for (let index in Object.keys(this.doors)) {
    //   console.log(`index: ${index} value: ${this.doors[index]}`);
    //   if (this.doors[index]) {
    //     next.doors[index] = this.doors[index].clone();
    //   }
    // }
    //
    // return next;
  }

  /**
   * Creates a door-animated {@link MapSprite}, storing it as an index.
   * @param index The index for the door.
   * @param startX The X coordinate of the first tile sprite.
   * @param startY The Y coordinate of the first tile sprite.
   * @param endX The X coordinate of the last tile sprite.
   * @param endY The Y coordinate of the last tile sprite.
   * @param frameTime The time (in ms), that the sprite plays one cycle.
   */
  createDoorTile(index: number, startX: number, startY: number, endX: number, endY: number, frameTime: number): void {

    const door = new MapSprite(16, 16, 19, 10, frameTime, startX, startY, endX, endY);
    this.addSprite(`door_${index}`, door);
    this.doors[index] = door;
  }

  /**
   * @param id The value of the tile as the ID of the tile.
   *
   * @return Returns the {@link MapSprite} of the tile. If the id is invalid, null is returned.
   */
  getTile(id: number): MapSprite {
    if (id < 1 || id > 190) {
      return null;
    }
    return this.tiles[id];
  }

  /**
   * @param index The index of the door tile.
   *
   * @return Returns the {@link MapSprite} of the door tile. If the id is invalid, null is returned.
   */
  getDoorTile(index: number): MapSprite {
    return this.doors[index];
  }
}
