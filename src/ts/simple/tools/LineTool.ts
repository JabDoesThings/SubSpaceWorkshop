import { Project } from '../Project';
import { MapMouseEvent } from '../../common/Renderer';
import { Selection } from '../ui/Selection';
import { Edit } from '../edits/Edit';
import { EditTiles } from '../edits/EditTiles';
import { DrawTool } from './DrawTool';
import { LVL } from '../../io/LVLUtils';
import { TileData } from '../../util/map/TileData';
import { Layer } from '../layers/Layer';

/**
 * The <i>LineTool</i> class. TODO: Document.
 *
 * @author Jab
 */
export class LineTool extends DrawTool {

    /**
     * Main constructor.
     */
    constructor() {
        super(true);
    }

    // @Override
    protected drawTile(project: Project, selection: Selection, event: MapMouseEvent, useActiveLayer: boolean): Edit[] {

        let layer: Layer;
        if(useActiveLayer) {
            layer = project.layers.getActive();
        } else {
            layer = project.layers.drawTileLayer;
        }

        if(layer == null) {
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

            let x = event.data.x;
            let y = event.data.y;

            // Make sure the tile coordinates are valid.
            if(x < 0 || x > 1023 || y < 0 || y > 1023) {
                return;
            }

            tiles = [{x: x, y: y}];
        }

        if (tiles.length === 0) {
            return;
        }

        let apply: { x: number, y: number, from: number, to: number }[] = [];

        let to = typeof selection.id === 'string' ? parseInt(selection.id) : selection.id;

        let slots: boolean[][] = [];

        let isSlotTaken = (x1: number, y1: number, id: number): boolean => {
            let dimensions = LVL.TILE_DIMENSIONS[id];
            let x2 = x1 + dimensions[0] - 1;
            let y2 = y1 + dimensions[1] - 1;
            for (let y = y1; y <= y2; y++) {
                for (let x = x1; x <= x2; x++) {
                    if (slots[x] != null && slots[x][y]) {
                        return true;
                    }
                }
            }
        };

        let setSlots = (x1: number, y1: number, id: number): void => {
            let dimensions = LVL.TILE_DIMENSIONS[id];
            let x2 = x1 + dimensions[0] - 1;
            let y2 = y1 + dimensions[1] - 1;
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

            let tile = tiles[index];
            let x = tile.x;
            let y = tile.y;

            if (x < 0 || x > 1023 || y < 0 || y > 1023) {
                continue;
            }

            if (isSlotTaken(x, y, to)) {
                continue;
            }

            setSlots(x, y, to);

            let from = this.tileCache.getTile(layer.tiles, x, y);

            apply.push({x: x, y: y, from: from, to: to});
        }

        if (apply.length !== 0) {
            return [new EditTiles(layer, apply)];
        }
    }

    // @Override
    protected drawMapObject(project: Project, selection: Selection, event: MapMouseEvent): Edit[] {
        // TODO: Implement.
        return null;
    }

    // @Override
    protected drawScreenObject(project: Project, selection: Selection, event: MapMouseEvent): Edit[] {
        // TODO: Implement.
        return null;
    }

    // @Override
    protected drawRegion(project: Project, selection: Selection, event: MapMouseEvent): Edit[] {
        // TODO: Implement.
        return null;
    }
}
