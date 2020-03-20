import { MapMouseEvent } from '../../common/Renderer';
import { Session } from '../Session';
import { TileCache } from '../../util/map/TileCache';
import { Edit } from '../edits/Edit';

/**
 * The <i>Brush</i> abstract class. TODO: Document.
 *
 * @author Jab
 */
export abstract class Brush {

    protected readonly tileCache: TileCache;

    protected last: { x: number, y: number, tileX: number, tileY: number };
    protected down: { x: number, y: number, tileX: number, tileY: number };

    /**
     * Main constructor.
     */
    protected constructor() {
        this.tileCache = new TileCache();

    }

    start(session: Session, event: MapMouseEvent): Edit[] {

        let edits = this.onStart(session, event);

        this.last = {
            x: event.data.x,
            y: event.data.y,
            tileX: event.data.tileX,
            tileY: event.data.tileY
        };

        this.down = this.last;

        return edits;
    }

    drag(session: Session, event: MapMouseEvent): Edit[] {

        let edits = this.onDrag(session, event);

        this.last = {
            x: event.data.x,
            y: event.data.y,
            tileX: event.data.tileX,
            tileY: event.data.tileY
        };

        return edits;
    }

    stop(session: Session, event: MapMouseEvent): Edit[] {

        let edits = this.onStop(session, event);

        this.last = null;
        this.down = null;
        this.tileCache.clear();

        return edits;
    }

    enter(session: Session, event: MapMouseEvent): Edit[] {

        let edits = this.onEnter(session, event);

        this.last = {
            x: event.data.x,
            y: event.data.y,
            tileX: event.data.tileX,
            tileY: event.data.tileY
        };

        return edits;
    }

    exit(session: Session, event: MapMouseEvent): Edit[] {

        let edits = this.onExit(session, event);

        this.last = {
            x: event.data.x,
            y: event.data.y,
            tileX: event.data.tileX,
            tileY: event.data.tileY
        };

        return edits;
    }

    protected abstract onStart(session: Session, event: MapMouseEvent): Edit[];

    protected abstract onDrag(session: Session, event: MapMouseEvent): Edit[];

    protected abstract onEnter(session: Session, event: MapMouseEvent): Edit[];

    protected abstract onExit(session: Session, event: MapMouseEvent): Edit[];

    protected abstract onStop(session: Session, event: MapMouseEvent): Edit[];
}
