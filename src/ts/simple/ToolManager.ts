import { MapRenderer } from './render/MapRenderer';
import { PencilTool } from './tools/PencilTool';
import { Session } from './Session';
import { MapMouseEvent, MapMouseEventType } from '../common/Renderer';
import { Tool } from './tools/Tool';
import { Edit } from './edits/Edit';
import { LineTool } from './tools/LineTool';
import { EraserTool } from './tools/EraserTool';

/**
 * The <i>ToolManager</i> class. TODO: Document.
 *
 * @author Jab
 */
export class ToolManager {

    private readonly tools: { [id: string]: Tool };
    private readonly renderer: MapRenderer;

    private active: string;

    constructor(renderer: MapRenderer) {

        this.renderer = renderer;

        this.tools = {};
        this.active = null;

        this.tools['pencil'] = new PencilTool();
        this.tools['eraser'] = new EraserTool();
        this.tools['line'] = new LineTool();

        let downTool: Tool;
        let downSession: Session;

        this.renderer.events.addMouseListener((event: MapMouseEvent) => {

            let edits: Edit[];
            let push = false;
            let reset = false;

            switch (event.type) {
                case MapMouseEventType.DOWN:
                    downSession = renderer.session;
                    downTool = this.getActive();
                    if (downSession == null || downTool == null) {
                        return;
                    }
                    edits = downTool.start(downSession, event);
                    break;
                case MapMouseEventType.UP:
                    if (downSession == null || downTool == null) {
                        return;
                    }
                    edits = downTool.stop(downSession, event);
                    push = reset = true;
                    break;
                case MapMouseEventType.DRAG:
                    if (downSession == null || downTool == null) {
                        return;
                    }
                    edits = downTool.drag(downSession, event);
                    break;
                case MapMouseEventType.ENTER:
                    if (downSession == null || downTool == null) {
                        return;
                    }
                    edits = downTool.enter(downSession, event);
                    break;
                case MapMouseEventType.EXIT:
                    if (downSession == null || downTool == null) {
                        return;
                    }
                    edits = downTool.exit(downSession, event);
                    break;
            }

            if (edits != null && edits.length !== 0) {
                downSession.editManager.append(edits);
            }
            if (push) {
                downSession.editManager.push();
                downSession.editor.renderer.radar.setDirty(true);
            }
            if (reset) {
                downTool = null;
                downSession = null;
            }
        });
    }

    getActive(): Tool {
        return this.active == null ? null : this.tools[this.active];
    }

    setActive(id: string): void {
        this.active = id;
    }

    addTool(id: string, brush: Tool): void {
        this.tools[id] = brush;
    }

    getTool(id: string): Tool {
        return this.tools[id];
    }
}
