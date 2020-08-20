import { Project } from '../Project';
import { MapMouseEvent } from '../../common/Renderer';
import { Tool } from './Tool';
import { SelectionType } from '../ui/Selection';
import { Edit } from '../edits/Edit';
import { EditTiles } from '../edits/EditTiles';
import { TileData } from '../../util/map/TileData';

export class SquareTool extends Tool {

  /** @constructor */
  constructor() {
    super();
  }

  /** @override */
  protected onStart(project: Project, event: MapMouseEvent): Edit[] {
    return this.draw(project, event);
  }

  /** @override */
  protected onDrag(project: Project, event: MapMouseEvent): Edit[] {
    return this.draw(project, event);
  }

  /** @override */
  protected onStop(project: Project, event: MapMouseEvent): Edit[] {
    return this.draw(project, event);
  }

  /** @override */
  protected onEnter(project: Project, event: MapMouseEvent): Edit[] {
    return;
  }

  /** @override */
  protected onExit(project: Project, event: MapMouseEvent): Edit[] {
    return;
  }

  private draw(project: Project, event: MapMouseEvent): Edit[] {
    const activeLayer = project.layers.getActive();
    if (activeLayer == null) {
      return;
    }

    const selectionGroup = project.selectionGroup;
    const selection = selectionGroup.getSelection(event.button);
    if (selection == null || event.data == null) {
      return;
    }

    if (selection.type !== SelectionType.TILE) {
      return;
    }

    // With the line tool, we only need the latest edits to push.
    project.editManager.reset();

    let tiles: { x: number, y: number }[];
    if (this.down != null) {
      tiles = TileData.tracePixels(
        event.data.x,
        event.data.y,
        this.down.x,
        this.down.y
      );
    } else {
      const x = event.data.x;
      const y = event.data.y;
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

    for (let index = 0; index < tiles.length; index++) {
      const tile = tiles[index];
      apply.push({
        x: tile.x,
        y: tile.y,
        from: this.tileCache.getTile(activeLayer.tiles, tile.x, tile.y),
        to: to
      });
    }
    if (apply.length !== 0) {
      return [new EditTiles(activeLayer, apply)];
    }
  }
}
