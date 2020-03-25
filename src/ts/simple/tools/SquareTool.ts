import { Session } from '../Session';
import { MapMouseEvent } from '../../common/Renderer';
import { Tool } from './Tool';
import { SelectionType } from '../ui/Selection';
import { Edit } from '../edits/Edit';
import { EditTiles } from '../edits/EditTiles';
import { TileLayer } from '../layers/TileLayer';
import { TileData } from '../../util/map/TileData';

export class SquareTool extends Tool {

    /**
     * Main constructor.
     */
    constructor() {
        super();
    }

    // @Override
    protected onStart(session: Session, event: MapMouseEvent): Edit[] {
        return this.draw(session, event);
    }

    // @Override
    protected onDrag(session: Session, event: MapMouseEvent): Edit[] {
        return this.draw(session, event);
    }

    // @Override
    protected onStop(session: Session, event: MapMouseEvent): Edit[] {
        return this.draw(session, event);
    }

    // @Override
    protected onEnter(session: Session, event: MapMouseEvent): Edit[] {
        return;
    }

    // @Override
    protected onExit(session: Session, event: MapMouseEvent): Edit[] {
        return;
    }

    private draw(session: Session, event: MapMouseEvent): Edit[] {

        let activeLayer = session.layers.getActive();
        if(activeLayer == null || !(activeLayer instanceof TileLayer)) {
            return;
        }

        let selectionGroup = session.selectionGroup;

        let selection = selectionGroup.getSelection(event.button);
        if (selection == null || event.data == null) {
            return;
        }

        if (selection.type !== SelectionType.TILE) {
            return;
        }

        // With the line tool, we only need the latest edits to push.
        session.editManager.reset();

        let tiles: { x: number, y: number }[];

        if (this.down != null) {

            tiles = TileData.tracePixels(
                event.data.x,
                event.data.y,
                this.down.x,
                this.down.y
            );

        } else {

            let x = event.data.x;
            let y = event.data.y;
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
