import { Session } from '../Session';
import { MapMouseEvent } from '../../common/Renderer';
import { LVLMap } from '../../io/LVL';
import { Brush } from './Brush';
import { Edit } from '../edits/Edit';
import { EditTiles } from '../edits/EditTiles';

/**
 * The <i>EraserBrush</i> class. TODO: Document.
 *
 * @author Jab
 */
export class EraserBrush extends Brush {

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

        let to = 0;

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
