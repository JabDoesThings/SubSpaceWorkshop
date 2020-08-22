import { TILE_DIMENSIONS } from '../../io/LVL';
import Project from '../Project';
import Selection from '../ui/Selection';
import Edit from '../edits/Edit';
import EditTiles from '../edits/EditTiles';
import DrawTool from './DrawTool';
import TileData from '../../util/map/TileData';
import Layer from '../layers/Layer';
import MapMouseEvent from '../../common/MapMouseEvent';

/**
 * The <i>BrushTool</i> class. TODO: Document.
 *
 * @author Jab
 */
export default class PencilTool extends DrawTool {
  slots: boolean[][] = [];
  apply: { x: number, y: number, from: number, to: number }[] = [];

  constructor() {
    super(true);
  }

  /** @override */
  protected onStop(project: Project, event: MapMouseEvent): Edit[] {
    const edits = super.onStop(project, event);
    this.slots = [];
    this.apply = [];
    return edits;
  }

  isSlotTaken(x1: number, y1: number, id: number): boolean {
    const dimensions = TILE_DIMENSIONS[id];
    const x2 = x1 + dimensions[0] - 1;
    const y2 = y1 + dimensions[1] - 1;
    for (let y = y1; y <= y2; y++) {
      for (let x = x1; x <= x2; x++) {
        if (this.slots[x] != null && this.slots[x][y]) {
          return true;
        }
      }
    }
  }

  setSlots(x1: number, y1: number, id: number): void {
    const dimensions = TILE_DIMENSIONS[id];
    const x2 = x1 + dimensions[0] - 1;
    const y2 = y1 + dimensions[1] - 1;
    for (let y = y1; y <= y2; y++) {
      for (let x = x1; x <= x2; x++) {
        if (this.slots[x] == null) {
          this.slots[x] = [];
        }
        this.slots[x][y] = true;
      }
    }
  }

  /** @override */
  protected drawTile(project: Project, selection: Selection, event: MapMouseEvent, useActiveLayer: boolean): Edit[] {
    const layerActive: Layer = project.layers.getActive();

    let layer: Layer;
    if (useActiveLayer) {
      layer = layerActive;
    } else {
      layer = project.layers.drawTileLayer;
    }
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

    const to = typeof selection.id === 'string' ? parseInt(selection.id) : selection.id;
    for (let index = 0; index < tiles.length; index++) {
      const tile = tiles[index];
      const x = tile.x;
      const y = tile.y;
      // Make sure the tile coordinates are valid.
      if (x < 0 || x > 1023 || y < 0 || y > 1023) {
        continue;
      }
      // Make sure not to repeat the same tile being changed.
      if (this.isSlotTaken(x, y, to)) {
        continue;
      }
      this.slots = [];
      this.setSlots(tile.x, tile.y, to);
      this.apply.push({
        x: x,
        y: y,
        from: this.tileCache.getTile(layerActive.tiles, x, y),
        to: to
      });
    }
    if (this.apply.length !== 0) {
      return [new EditTiles(layer, this.apply)];
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
