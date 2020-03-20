import { Session } from '../Session';
import { MapMouseEvent } from '../../common/Renderer';
import { LVLMap } from '../../io/LVL';
import { Tool } from './Tool';
import { SelectionType } from '../ui/Selection';
import { Edit } from '../edits/Edit';
import { EditTiles } from '../edits/EditTiles';

export class PencilTool extends Tool {

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

        let selectionGroup = session.selectionGroup;
        let selection = selectionGroup.getSelection(event.button);
        if (selection == null || event.data == null) {
            return;
        }

        if (selection.type !== SelectionType.TILE) {
            return;
        }

        let tiles: { x: number, y: number }[];

        if (this.last != null) {

            tiles = LVLMap.traceTiles(
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

            // Make sure not to repeat the same tile being changed.
            if (this.tileCache.isCached(tile.x, tile.y)) {
                continue;
            }

            apply.push({
                x: tile.x,
                y: tile.y,
                from: this.tileCache.getTile(session.map, tile.x, tile.y),
                to: to
            });
        }

        if (apply.length !== 0) {
            return [new EditTiles(0, apply)];
        }
    }
}
