import { Tool } from './Tool';
import { Project } from '../Project';
import { MapMouseEvent } from '../../common/Renderer';
import { Edit } from '../edits/Edit';
import { TileData } from '../../util/map/TileData';
import { MapArea } from '../../util/map/MapArea';
import { CoordinateType } from '../../util/map/CoordinateType';

/**
 * The <i>MoveTool</i> class. TODO: Document.
 *
 * @author Jab
 */
export class MoveTool extends Tool {

    selection: TileData;
    areaDown: MapArea;

    mDown: number[];
    mDelta: number[];
    mDeltaLast: number[];

    constructor() {
        super();
    }

    // @Override
    protected onStart(project: Project, event: MapMouseEvent): Edit[] {

        this.createSelection(project);

        this.mDown = [event.data.tileX, event.data.tileY];
        this.mDelta = [0, 0];
        this.mDeltaLast = [0, 0];

        return;
    }

    // @Override
    protected onDrag(project: Project, event: MapMouseEvent): Edit[] {

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

        let edits: Edit[] = null;

        // Update the delta offset of the tiles.
        this.mDelta[0] = event.data.tileX - this.mDown[0];
        this.mDelta[1] = event.data.tileY - this.mDown[1];

        // Only update the move when the tile coordinates change.
        //   (Prevents unnecessary recalculations)
        if (this.mDelta[0] !== this.mDeltaLast[0] || this.mDelta[1] !== this.mDeltaLast[1]) {
            edits = this.move(project);
        }

        project.editManager.push();

        this.mDelta = null;
        this.mDeltaLast = null;
        this.selection = null;
        this.areaDown = null;
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

    private createSelection(project: Project): void {
        let x1 = 1024, y1 = 1024;
        let x2 = -1, y2 = -1;

        let selections = project.selections;
        for (let index = 0; index < selections.sections.length; index++) {

            let next = selections.sections[index];
            let nx1 = next.x;
            let ny1 = next.y;
            let nx2 = next.x + next.width - 1;
            let ny2 = next.y + next.height - 1;

            if (nx1 < x1) {
                x1 = nx1;
            }
            if (ny1 < y1) {
                y1 = ny1;
            }
            if (nx2 < x1) {
                x1 = nx2;
            }
            if (ny2 < y1) {
                y1 = ny2;
            }

            if (nx1 > x2) {
                x2 = nx1;
            }
            if (ny1 > y2) {
                y2 = ny1;
            }
            if (nx2 > x2) {
                x2 = nx2;
            }
            if (ny2 > y2) {
                y2 = ny2;
            }
        }

        this.areaDown = new MapArea(CoordinateType.TILE, x1, y1, x2, y2);

        let tiles: number[][] = [];
        let width = (x2 - x1) + 1;
        let height = (y2 - y1) + 1;
        for (let x = 0; x < width; x++) {
            tiles[x] = [];
            for (let y = 0; y < height; y++) {
                tiles[x][y] = project.layers.getTile(x1 + x, y1 + y);
            }
        }

        this.selection = new TileData(tiles);
    }

    private move(project: Project): Edit[] {

        // Clear any previous edits pushed.
        project.editManager.reset();

        // TODO: Implement.

        return [];
    }
}
