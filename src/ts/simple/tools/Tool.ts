import { MapMouseEvent } from '../../common/Renderer';
import { Project } from '../Project';
import { TileCache } from '../../util/map/TileCache';
import { Edit } from '../edits/Edit';

/**
 * The <i>Tool</i> abstract class. TODO: Document.
 *
 * @author Jab
 */
export abstract class Tool {

    protected readonly tileCache: TileCache;

    protected last: { x: number, y: number, tileX: number, tileY: number };
    protected down: { x: number, y: number, tileX: number, tileY: number };

    isSelector: boolean = false;

    /**
     * Main constructor.
     */
    protected constructor() {
        this.tileCache = new TileCache();

    }

    start(project: Project, event: MapMouseEvent): Edit[] {

        let edits = this.onStart(project, event);

        this.last = {
            x: event.data.x,
            y: event.data.y,
            tileX: event.data.tileX,
            tileY: event.data.tileY
        };

        this.down = this.last;

        return edits;
    }

    drag(project: Project, event: MapMouseEvent): Edit[] {

        let edits = this.onDrag(project, event);

        this.last = {
            x: event.data.x,
            y: event.data.y,
            tileX: event.data.tileX,
            tileY: event.data.tileY
        };

        return edits;
    }

    stop(project: Project, event: MapMouseEvent): Edit[] {

        let edits = this.onStop(project, event);

        this.last = null;
        this.down = null;
        this.tileCache.clear();

        return edits;
    }

    enter(project: Project, event: MapMouseEvent): Edit[] {

        let edits = this.onEnter(project, event);

        this.last = {
            x: event.data.x,
            y: event.data.y,
            tileX: event.data.tileX,
            tileY: event.data.tileY
        };

        return edits;
    }

    exit(project: Project, event: MapMouseEvent): Edit[] {

        let edits = this.onExit(project, event);

        this.last = {
            x: event.data.x,
            y: event.data.y,
            tileX: event.data.tileX,
            tileY: event.data.tileY
        };

        return edits;
    }

    protected abstract onStart(project: Project, event: MapMouseEvent): Edit[];

    protected abstract onDrag(project: Project, event: MapMouseEvent): Edit[];

    protected abstract onEnter(project: Project, event: MapMouseEvent): Edit[];

    protected abstract onExit(project: Project, event: MapMouseEvent): Edit[];

    protected abstract onStop(project: Project, event: MapMouseEvent): Edit[];
}
