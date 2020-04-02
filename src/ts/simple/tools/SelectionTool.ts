import { Tool } from './Tool';
import { Project } from '../Project';
import { MapMouseEvent } from '../../common/Renderer';
import { Edit } from '../edits/Edit';
import { MapSection } from '../../util/map/MapSection';
import { EditSelectionAdd } from '../edits/EditSelectionAdd';
import { EditSelectionClear } from '../edits/EditSelectionClear';

/**
 * The <i>SelectionTool</i> class. TODO: Document.
 *
 * @author Jab
 */
export class SelectionTool extends Tool {

    invert: boolean;
    valid: boolean;
    dragged: boolean;

    constructor() {

        super();

        // Let the editor know that the tool is a selector and requires changes to
        //   certain components to not get in the way of selecting.
        this.isSelector = true;

        this.valid = false;
        this.invert = false;
        this.dragged = false;
    }

    // @Override
    protected onStart(project: Project, event: MapMouseEvent): Edit[] {

        if (event.button !== 0) {
            return;
        }

        this.valid = true;

        let editor = project.editor;
        if (!editor.isControlPressed() && !editor.isAltPressed() && !project.selections.isEmpty()) {

            // Remove all selections.
            let history = project.editManager;
            history.append([new EditSelectionClear()]);
            history.push();
        }

        this.invert = editor.isAltPressed();

        return;
    }

    // @Override
    protected onDrag(project: Project, event: MapMouseEvent): Edit[] {

        if (!this.valid) {
            return;
        }

        this.dragged = true;
        return this.select(project, event);
    }

    // @Override
    protected onStop(project: Project, event: MapMouseEvent): Edit[] {

        if (!this.valid) {
            return;
        }

        let edits: Edit[] = null;
        if (this.dragged) {
            edits = this.select(project, event);
        }

        this.invert = false;
        this.valid = false;
        this.dragged = false;
        return edits;
    }

    // @Override
    protected onEnter(project: Project, event: MapMouseEvent): Edit[] {
        return null;
    }

    // @Override
    protected onExit(project: Project, event: MapMouseEvent): Edit[] {
        return null;
    }

    private select(project: Project, event: MapMouseEvent): Edit[] {

        if (event.data == null) {
            return;
        }

        let tx = event.data.tileX;
        let ty = event.data.tileY;
        let dtx = tx;
        let dty = ty;

        if (this.down != null) {
            dtx = this.down.tileX;
            dty = this.down.tileY;
        }

        let x1 = Math.min(dtx, tx);
        let y1 = Math.min(dty, ty);
        let x2 = Math.max(dtx, tx);
        let y2 = Math.max(dty, ty);

        // Check if the selection is entirely outside the map.
        if (x1 > 1023 || y1 > 1023 || x2 < 0 || y2 < 0) {
            return;
        }

        if (x1 < 0) {
            x1 = 0;
        }
        if (x2 > 1023) {
            x2 = 1023;
        }
        if (y1 < 0) {
            y1 = 0;
        }
        if (y2 > 1023) {
            y2 = 1023;
        }

        project.editManager.reset();

        return [
            new EditSelectionAdd([
                MapSection.box(x1, y1, x2, y2, this.invert)
            ])
        ];
    }
}
