import { Session } from '../Session';
import { MapMouseEvent } from '../../common/Renderer';
import { Selection } from '../ui/Selection';
import { Edit } from '../edits/Edit';
import { EditTiles } from '../edits/EditTiles';
import { DrawTool } from './DrawTool';
import { LVL } from '../../io/LVLUtils';
import { TileLayer } from '../layers/TileLayer';
import { TileData } from '../../util/map/TileData';

/**
 * The <i>PencilTool</i> class. TODO: Document.
 *
 * @author Jab
 */
export class PencilTool extends DrawTool {

    slots: boolean[][] = [];

    /**
     * Main constructor.
     */
    constructor() {
        super();
    }

    // @Override
    protected onStop(session: Session, event: MapMouseEvent): Edit[] {

        let edits = super.onStop(session, event);
        this.slots = [];
        return edits;
    }

    isSlotTaken(x1: number, y1: number, id: number): boolean {
        let dimensions = LVL.TILE_DIMENSIONS[id];
        let x2 = x1 + dimensions[0] - 1;
        let y2 = y1 + dimensions[1] - 1;
        for (let y = y1; y <= y2; y++) {
            for (let x = x1; x <= x2; x++) {
                if (this.slots[x] != null && this.slots[x][y]) {
                    return true;
                }
            }
        }
    }

    setSlots(x1: number, y1: number, id: number): void {
        let dimensions = LVL.TILE_DIMENSIONS[id];
        let x2 = x1 + dimensions[0] - 1;
        let y2 = y1 + dimensions[1] - 1;
        for (let y = y1; y <= y2; y++) {
            for (let x = x1; x <= x2; x++) {
                let xa = this.slots[x];
                if (xa == null) {
                    xa = this.slots[x] = [];
                }
                xa[y] = true;
            }
        }
    };

    // @Override
    protected drawTile(session: Session, selection: Selection, event: MapMouseEvent): Edit[] {

        let activeLayer = session.layers.getActive();
        if(activeLayer == null || !(activeLayer instanceof TileLayer)) {
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

            let x = event.data.tileX;
            let y = event.data.tileY;
            if (x < 0 || x > 1023 || y < 0 || y > 1023) {
                return;
            }

            tiles = [{x: x, y: y}];
        }

        if (tiles.length === 0) {
            return;
        }

        let apply: { x: number, y: number, from: number, to: number }[] = [];

        let to = typeof selection.id === 'string' ? parseInt(selection.id) : selection.id;

        for (let index = 0; index < tiles.length; index++) {

            let tile = tiles[index];
            let x = tile.x;
            let y = tile.y;

            // Make sure the tile coordinates are valid.
            if(x < 0 || x > 1023 || y < 0 || y > 1023) {
                continue;
            }

            // Make sure not to repeat the same tile being changed.
            if (this.isSlotTaken(x, y, to)) {
                continue;
            }

            this.slots = [];
            this.setSlots(tile.x, tile.y, to);

            apply.push({
                x: x,
                y: y,
                from: this.tileCache.getTile(activeLayer.tiles, x, y),
                to: to
            });
        }

        if (apply.length !== 0) {
            return [new EditTiles(activeLayer, apply)];
        }
    }

    // @Override
    protected drawMapObject(session: Session, selection: Selection, event: MapMouseEvent): Edit[] {
        // TODO: Implement.
        return null;
    }

    // @Override
    protected drawScreenObject(session: Session, selection: Selection, event: MapMouseEvent): Edit[] {
        // TODO: Implement.
        return null;
    }

    // @Override
    protected drawRegion(session: Session, selection: Selection, event: MapMouseEvent): Edit[] {
        // TODO: Implement.
        return null;
    }
}
