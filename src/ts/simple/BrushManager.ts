import { MapRenderer } from './render/MapRenderer';
import { PencilBrush } from './brushes/PencilBrush';
import { Session } from './Session';
import { MapMouseEvent, MapMouseEventType } from '../common/Renderer';
import { Brush } from './brushes/Brush';
import { Edit } from './edits/Edit';
import { LineBrush } from './brushes/LineBrush';

/**
 * The <i>BrushCanvas</i> class. TODO: Document.
 *
 * @author Jab
 */
export class BrushManager {

    private readonly brushes: { [id: string]: Brush };
    private readonly renderer: MapRenderer;

    private active: string;

    constructor(renderer: MapRenderer) {

        this.renderer = renderer;

        this.brushes = {};
        this.active = null;

        this.brushes['pencil'] = new PencilBrush();
        this.brushes['line'] = new LineBrush();
        this.setActive('line');

        let downBrush: Brush;
        let downSession: Session;

        this.renderer.events.addMouseListener((event: MapMouseEvent) => {

            let edits: Edit[];
            let push = false;
            let reset = false;

            switch (event.type) {
                case MapMouseEventType.DOWN:
                    downSession = renderer.session;
                    downBrush = this.getActive();
                    if (downSession == null || downBrush == null) {
                        return;
                    }
                    edits = downBrush.start(downSession, event);
                    break;
                case MapMouseEventType.UP:
                    if (downSession == null || downBrush == null) {
                        return;
                    }
                    edits = downBrush.stop(downSession, event);
                    push = reset = true;
                    break;
                case MapMouseEventType.DRAG:
                    if (downSession == null || downBrush == null) {
                        return;
                    }
                    edits = downBrush.drag(downSession, event);
                    break;
                case MapMouseEventType.ENTER:
                    if (downSession == null || downBrush == null) {
                        return;
                    }
                    edits = downBrush.enter(downSession, event);
                    break;
                case MapMouseEventType.EXIT:
                    if (downSession == null || downBrush == null) {
                        return;
                    }
                    edits = downBrush.exit(downSession, event);
                    break;
            }

            if (edits != null && edits.length !== 0) {
                downSession.editManager.append(edits);
            }
            if (push) {
                downSession.editManager.push();
            }
            if (reset) {
                downBrush = null;
                downSession = null;
            }
        });
    }

    getActive(): Brush {
        return this.active == null ? null : this.brushes[this.active];
    }

    setActive(id: string): void {
        this.active = id;
    }

    addBrush(id: string, brush: Brush): void {
        this.brushes[id] = brush;
    }

    getBrush(id: string): Brush {
        return this.brushes[id];
    }
}
