import { Tool } from './Tool';
import { Session } from '../Session';
import { MapMouseEvent } from '../../common/Renderer';
import { Edit } from '../edits/Edit';
import { MapSection } from '../../util/map/MapSection';
import { EditAddSelection } from '../edits/EditAddSelection';

/**
 * The <i>SelectionTool</i> class. TODO: Document.
 *
 * @author Jab
 */
export class SelectionTool extends Tool {

    constructor() {
        super();
    }

    // @Override
    protected onStart(session: Session, event: MapMouseEvent): Edit[] {
        return this.select(session, event);
    }

    // @Override
    protected onDrag(session: Session, event: MapMouseEvent): Edit[] {
        return this.select(session, event);
    }

    // @Override
    protected onStop(session: Session, event: MapMouseEvent): Edit[] {
        return this.select(session, event);
    }

    // @Override
    protected onEnter(session: Session, event: MapMouseEvent): Edit[] {
        return null;
    }

    // @Override
    protected onExit(session: Session, event: MapMouseEvent): Edit[] {
        return null;
    }

    private select(session: Session, event: MapMouseEvent): Edit[] {

        if(event.data == null) {
            return;
        }

        let tx = event.data.tileX;
        let ty = event.data.tileY;
        let dtx = tx;
        let dty = ty;

        if(this.down != null) {
            dtx = this.down.tileX;
            dty = this.down.tileY;
        }

        let x1 = Math.min(dtx, tx);
        let y1 = Math.min(dty, ty);
        let x2 = Math.max(dtx, tx);
        let y2 = Math.max(dty, ty);

        session.editManager.reset();

        return [
            new EditAddSelection(0, [
                new MapSection(x1, y1, x2, y2)
            ])
        ];
    }
}
