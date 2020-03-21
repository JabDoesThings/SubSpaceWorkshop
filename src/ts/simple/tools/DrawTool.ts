import { Tool } from './Tool';
import { Session } from '../Session';
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

    protected draw(session: Session, event: MapMouseEvent): Edit[] {

        let selectionGroup = session.selectionGroup;
        let selection = selectionGroup.getSelection(event.button);
        if (selection == null || event.data == null) {
            return;
        }

        // Clear any previous edits made by the tool during its current use.
        if (this.clearOnDraw) {
            session.editManager.reset();
        }

        if (selection.type === SelectionType.TILE) {
            return this.drawTile(session, selection, event);
        } else if (selection.type == SelectionType.MAP_OBJECT) {
            return this.drawMapObject(session, selection, event);
        } else if (selection.type == SelectionType.SCREEN_OBJECT) {
            return this.drawScreenObject(session, selection, event);
        } else if (selection.type == SelectionType.REGION) {
            return this.drawRegion(session, selection, event);
        }
    }

    protected abstract drawTile(session: Session, selection: Selection, event: MapMouseEvent): Edit[];

    protected abstract drawMapObject(session: Session, selection: Selection, event: MapMouseEvent): Edit[];

    protected abstract drawScreenObject(session: Session, selection: Selection, event: MapMouseEvent): Edit[];

    protected abstract drawRegion(session: Session, selection: Selection, event: MapMouseEvent): Edit[];
}
