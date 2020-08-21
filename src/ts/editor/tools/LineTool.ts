import { Project } from '../Project';
import { MapMouseEvent } from '../../common/Renderer';
import { Selection } from '../../ui/component/Selection';
import { Edit } from '../edits/Edit';
import { EditTiles } from '../edits/EditTiles';
import { DrawTool } from './DrawTool';
import { TileData } from '../../util/map/TileData';
import { Layer } from '../layers/Layer';
import { TILE_DIMENSIONS } from '../../io/LVL';

/**
 * The <i>LineTool</i> class. TODO: Document.
 *
 * @author Jab
 */
export class LineTool extends DrawTool {

  /** @constructor */
  constructor() {
    super(true);
  }

  /** @override */
  protected drawTile(project: Project, selection: Selection, event: MapMouseEvent, useActiveLayer: boolean): Edit[] {
    let layer: Layer;
    if (useActiveLayer) {
      layer = project.layers.getActive();
    } else {
      layer = project.layers.drawTileLayer;
    }
    if (layer == null) {
      return;
    }

    let tiles: { x: number, y: number }[];
    if (this.down != null) {
      tiles = TileData.tracePixels(
        this.down.x,
        this.down.y,
        event.data.x,
        event.data.y
      );
    } else {
      const x = event.data.x;
      const y = event.data.y;
      // Make sure the tile coordinates are valid.
      if (x < 0 || x > 1023 || y < 0 || y > 1023) {
        return;
      }
      tiles = [{x: x, y: y}];
    }
    if (tiles.length === 0) {
      return;
    }
    const apply: { x: number, y: number, from: number, to: number }[] = [];
    const to = typeof selection.id === 'string' ? parseInt(selection.id) : selection.id;
    const slots: boolean[][] = [];

    const isSlotTaken = (x1: number, y1: number, id: number): boolean => {
      const dimensions = TILE_DIMENSIONS[id];
      const x2 = x1 + dimensions[0] - 1;
      const y2 = y1 + dimensions[1] - 1;
      for (let y = y1; y <= y2; y++) {
        for (let x = x1; x <= x2; x++) {
          if (slots[x] != null && slots[x][y]) {
            return true;
          }
        }
      }
    };

    const setSlots = (x1: number, y1: number, id: number): void => {
      const dimensions = TILE_DIMENSIONS[id];
      const x2 = x1 + dimensions[0] - 1;
      const y2 = y1 + dimensions[1] - 1;
      for (let y = y1; y <= y2; y++) {
        for (let x = x1; x <= x2; x++) {
          let xa = slots[x];
          if (xa == null) {
            xa = slots[x] = [];
          }
          xa[y] = true;
        }
      }
    };

    for (let index = 0; index < tiles.length; index++) {
      const tile = tiles[index];
      const x = tile.x;
      const y = tile.y;
      if (x < 0 || x > 1023 || y < 0 || y > 1023) {
        continue;
      }
      if (isSlotTaken(x, y, to)) {
        continue;
      }

      setSlots(x, y, to);
      const from = this.tileCache.getTile(layer.tiles, x, y);
      apply.push({x: x, y: y, from: from, to: to});
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
