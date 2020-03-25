import { Tool } from './Tool';
import { Project } from '../Project';
import { MapMouseEvent } from '../../common/Renderer';
import { Edit } from '../edits/Edit';
import { Selection, SelectionType } from '../ui/Selection';

export abstract class DrawTool extends Tool {

    private readonly clearOnDraw: boolean;

    protected constructor(clearOnDraw: boolean = false) {
        super();

        this.clearOnDraw = clearOnDraw;
    }

    // @Override
    protected onStart(project: Project, event: MapMouseEvent): Edit[] {
        return this.draw(project, event);
    }

    // @Override
    protected onDrag(project: Project, event: MapMouseEvent): Edit[] {
        return this.draw(project, event);
    }

    // @Override
    protected onStop(project: Project, event: MapMouseEvent): Edit[] {
        return this.draw(project, event);
    }

    // @Override
    protected onEnter(project: Project, event: MapMouseEvent): Edit[] {
        return;
    }

    // @Override
    protected onExit(project: Project, event: MapMouseEvent): Edit[] {
        return;
    }

    protected draw(project: Project, event: MapMouseEvent): Edit[] {

        let selectionGroup = project.selectionGroup;
        let selection = selectionGroup.getSelection(event.button);
        if (selection == null || event.data == null) {
            return;
        }

        // Clear any previous edits made by the tool during its current use.
        if (this.clearOnDraw) {
            project.editManager.reset();
        }

        if (selection.type === SelectionType.TILE) {
            return this.drawTile(project, selection, event);
        } else if (selection.type == SelectionType.MAP_OBJECT) {
            return this.drawMapObject(project, selection, event);
        } else if (selection.type == SelectionType.SCREEN_OBJECT) {
            return this.drawScreenObject(project, selection, event);
        } else if (selection.type == SelectionType.REGION) {
            return this.drawRegion(project, selection, event);
        }
    }

    protected abstract drawTile(project: Project, selection: Selection, event: MapMouseEvent): Edit[];

    protected abstract drawMapObject(project: Project, selection: Selection, event: MapMouseEvent): Edit[];

    protected abstract drawScreenObject(project: Project, selection: Selection, event: MapMouseEvent): Edit[];

    protected abstract drawRegion(project: Project, selection: Selection, event: MapMouseEvent): Edit[];
}
