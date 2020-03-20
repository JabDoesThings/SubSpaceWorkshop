import { Session } from '../Session';
import { MapMouseEvent } from '../../common/Renderer';
import { LVLMap } from '../../io/LVL';
import { Brush } from './Brush';
import { SelectionType } from '../ui/Selection';
import { Edit } from '../edits/Edit';
import { EditTiles } from '../edits/EditTiles';

export class LineBrush extends Brush {

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

        // With the line tool, we only need the latest edits to push.
        session.editManager.reset();

        let tiles: { x: number, y: number }[];

        if (this.down != null) {

            tiles = LVLMap.tracePixels(
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
                from: this.tileCache.getTile(session.map, tile.x, tile.y),
                to: to
            });
        }

        if (apply.length !== 0) {
            return [new EditTiles(0, apply)];
        }
    }
}
