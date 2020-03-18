import { SelectionGroup } from '../ui/Selection';
import { Edit } from '../EditHistory';
import { MapRenderer } from '../render/MapRenderer';
import { MapMouseEvent, MapMouseEventType } from '../../common/Renderer';
import { Session } from '../Session';

/**
 * The <i>BrushCanvas</i> class. TODO: Document.
 *
 * @author Jab
 */
export class BrushCanvas {

    private readonly brushes: { [id: string]: Brush };
    private readonly renderer: MapRenderer;

    private active: string;

    constructor(renderer: MapRenderer) {

        this.renderer = renderer;

        this.brushes = {};
        this.active = null;

        this.brushes['pencil'] = new PencilBrush();
        this.setActive('pencil');

        let downBrush: Brush = null;
        let downSession: Session = null;

        let edits: Edit[] = [];

        let handleDown = (event: MapMouseEvent): void => {

            downSession = renderer.session;
            if (downSession == null) {
                return;
            }

            downBrush = this.getActive();
            if (downBrush == null) {
                return;
            }

            downBrush.onStart(downSession.selectionGroup, edits, {
                button: event.button,
                x: event.data.x,
                y: event.data.y
            });
        };

        let handleUp = (event: MapMouseEvent): void => {

            if (downSession == null || downBrush == null) {
                return;
            }

            downBrush.onStop(downSession.selectionGroup, edits, {
                button: event.button,
                x: event.data.x,
                y: event.data.y
            });

            downSession.editHistory.execute(edits);

            edits = [];
            downBrush = null;
            downSession = null;
        };

        let handleDrag = (event: MapMouseEvent): void => {

            if (downSession == null || downBrush == null) {
                return;
            }

            downBrush.onDrag(downSession.selectionGroup, edits, {
                button: event.button,
                x: event.data.x,
                y: event.data.y
            });
        };

        this.renderer.events.addMouseListener((event: MapMouseEvent) => {
            if (event.type == MapMouseEventType.DOWN) {
                handleDown(event);
            } else if (event.type == MapMouseEventType.UP) {
                handleUp(event);
            } else if (event.type == MapMouseEventType.DRAG) {
                handleDrag(event);
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

/**
 * The <i>Brush</i> abstract class. TODO: Document.
 *
 * @author Jab
 */
export abstract class Brush {

    private canvas: HTMLCanvasElement;

    /**
     * Main constructor.
     */
    protected constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 1024;
        this.canvas.height = 1024;
    }

    abstract onStart(group: SelectionGroup, edit: Edit[], mouse: { button: number, x: number, y: number }): void;

    abstract onDrag(group: SelectionGroup, edit: Edit[], mouse: { button: number, x: number, y: number }): void;

    abstract onStop(group: SelectionGroup, edit: Edit[], mouse: { button: number, x: number, y: number }): void;
}

export class PencilBrush extends Brush {

    constructor() {
        super();
    }

    onStart(group: SelectionGroup, edits: Edit[], mouse: { button: number, x: number; y: number }): void {

        let selection = group.getSelection(mouse.button);
        if(selection == null) {
            return;
        }
    }

    onDrag(group: SelectionGroup, edits: Edit[], mouse: { button: number, x: number; y: number }): void {

        let selection = group.getSelection(mouse.button);
        if(selection == null) {
            return;
        }
    }

    onStop(group: SelectionGroup, edits: Edit[], mouse: { button: number, x: number; y: number }): void {

    }
}
