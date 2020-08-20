import { Project } from '../Project';
import { MapMouseEvent } from '../../common/Renderer';
import { Edit } from '../edits/Edit';
import { EditTiles } from '../edits/EditTiles';
import { DrawTool } from './DrawTool';
import { Selection } from '../ui/Selection';
import { TileData } from '../../util/map/TileData';

/**
 * The <i>EraserTool</i> class. TODO: Document.
 *
 * @author Jab
 */
export class EraserTool extends DrawTool {

  /** @constructor */
  constructor() {
    super();
  }

  /** @override */
  protected drawTile(project: Project, selection: Selection, event: MapMouseEvent, useActiveLayer: boolean): Edit[] {
    const layer = project.layers.getActive();
    if (layer == null) {
      return;
    }

    let tiles: { x: number, y: number }[];
    if (this.last != null) {
      tiles = TileData.traceTiles(
        event.data.tileX,
        event.data.tileY,
        this.last.tileX,
        this.last.tileY
      );
    } else {
      const x = event.data.tileX;
      const y = event.data.tileY;
      if (x < 0 || x > 1023 || y < 0 || y > 1023) {
        return;
      }
      tiles = [{x: x, y: y}];
    }
    if (tiles.length === 0) {
      return;
    }
    const apply: { x: number, y: number, from: number, to: number }[] = [];
    const to = 0;

    for (let index = 0; index < tiles.length; index++) {
      const tile = tiles[index];
      // Make sure not to repeat the same tile being changed.
      if (this.tileCache.isCached(tile.x, tile.y)) {
        continue;
      }
      apply.push({
        x: tile.x,
        y: tile.y,
        from: this.tileCache.getTile(layer.tiles, tile.x, tile.y),
        to: to
      });
    }
    if (apply.length !== 0) {
      return [new EditTiles(layer, apply)];
    }
  }

  /** @override */
  protected drawMapObject(project: Project, selection: Selection, event: MapMouseEvent): Edit[] {
    // TODO: Implement.
    return null;
  }

  /** @override */
  protected drawScreenObject(project: Project, selection: Selection, event: MapMouseEvent): Edit[] {
    // TODO: Implement.
    return null;
  }

  /** @override */
  protected drawRegion(project: Project, selection: Selection, event: MapMouseEvent): Edit[] {
    // TODO: Implement.
    return null;
  }
}
