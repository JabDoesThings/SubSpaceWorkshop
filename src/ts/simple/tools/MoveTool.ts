import { Tool } from './Tool';
import { Project } from '../Project';
import { MapMouseEvent } from '../../common/Renderer';
import { Edit } from '../edits/Edit';
import { CoordinateType } from '../../util/map/CoordinateType';
import { Layer } from '../layers/Layer';
import { MapPoint } from '../../util/map/MapPoint';
import { EditSelectionMove } from '../edits/EditSelectionMove';
import { EditTiles } from '../edits/EditTiles';

/**
 * The <i>MoveTool</i> class. TODO: Document.
 *
 * @author Jab
 */
export class MoveTool extends Tool {

    mDown: number[];
    mDelta: number[];
    mDeltaLast: number[];

    private activeLayer: Layer;

    /**
     * Main constructor.
     */
    constructor() {
        super();
    }

    // @Override
    protected onStart(project: Project, event: MapMouseEvent): Edit[] {

        this.activeLayer = project.layers.active;

        // Make sure that there's a selection, and there's an active layer.
        if (project.selections.isEmpty() || this.activeLayer == null) {
            return;
        }

        this.mDown = [event.data.tileX, event.data.tileY];
        this.mDelta = [0, 0];
        this.mDeltaLast = [0, 0];

        return;
    }

    // @Override
    protected onDrag(project: Project, event: MapMouseEvent): Edit[] {

        // Make sure that there's an active layer.
        if (this.activeLayer == null) {
            return;
        }

        let edits: Edit[] = null;

        // Update the delta offset of the tiles.
        this.mDelta[0] = event.data.tileX - this.mDown[0];
        this.mDelta[1] = event.data.tileY - this.mDown[1];

        // Only update the move when the tile coordinates change.
        //   (Prevents unnecessary recalculations)
        if (this.mDelta[0] !== this.mDeltaLast[0] || this.mDelta[1] !== this.mDeltaLast[1]) {
            edits = this.move(project);
        }

        // Set the last to know when a change occurs on the next drag event.
        this.mDeltaLast[0] = this.mDelta[0];
        this.mDeltaLast[1] = this.mDelta[1];

        return edits;
    }

    // @Override
    protected onStop(project: Project, event: MapMouseEvent): Edit[] {

        // Make sure that there's an active layer.
        if (this.activeLayer == null) {
            return;
        }

        let edits: Edit[] = null;

        // Update the delta offset of the tiles.
        this.mDelta[0] = event.data.tileX - this.mDown[0];
        this.mDelta[1] = event.data.tileY - this.mDown[1];

        // Only update the move when the tile coordinates change.
        //   (Prevents unnecessary recalculations)
        if (this.mDelta[0] !== this.mDeltaLast[0] || this.mDelta[1] !== this.mDeltaLast[1]) {
            edits = this.move(project);
        }

        this.mDelta = null;
        this.mDeltaLast = null;

        return edits;
    }

    // @Override
    protected onEnter(project: Project, event: MapMouseEvent): Edit[] {
        return;
    }

    // @Override
    protected onExit(project: Project, event: MapMouseEvent): Edit[] {
        return;
    }

    private move(project: Project): Edit[] {

        // Clear any previous edits pushed.
        project.editManager.reset();

        let tiles = this.activeLayer.tiles;

        let x = this.mDelta[0];
        let y = this.mDelta[1];

        let edits: Edit[] = [];
        edits.push(new EditSelectionMove(x, y));

        if (x !== 0 || x !== 0) {
            let point = new MapPoint(CoordinateType.TILE, x, y);
            let tileEdits = tiles.move(project.selections.sections, point);
            edits.push(new EditTiles(this.activeLayer, tileEdits, true, true));
        }

        return edits;
    }
}
