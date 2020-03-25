import { MapRenderer } from './render/MapRenderer';
import { PencilTool } from './tools/PencilTool';
import { Project } from './Project';
import { MapMouseEvent, MapMouseEventType } from '../common/Renderer';
import { Tool } from './tools/Tool';
import { Edit } from './edits/Edit';
import { LineTool } from './tools/LineTool';
import { EraserTool } from './tools/EraserTool';
import { SelectionTool } from './tools/SelectionTool';

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
        this.tools['select'] = new SelectionTool();

        let downTool: Tool;
        let downProject: Project;

        this.renderer.events.addMouseListener((event: MapMouseEvent) => {

            let edits: Edit[];
            let push = false;
            let reset = false;

            switch (event.type) {
                case MapMouseEventType.DOWN:
                    downProject = renderer.project;
                    downTool = this.getActive();
                    if (downProject == null || downTool == null) {
                        return;
                    }
                    edits = downTool.start(downProject, event);
                    break;
                case MapMouseEventType.UP:
                    if (downProject == null || downTool == null) {
                        return;
                    }
                    edits = downTool.stop(downProject, event);
                    push = reset = true;
                    break;
                case MapMouseEventType.DRAG:
                    if (downProject == null || downTool == null) {
                        return;
                    }
                    edits = downTool.drag(downProject, event);
                    break;
                case MapMouseEventType.ENTER:
                    if (downProject == null || downTool == null) {
                        return;
                    }
                    edits = downTool.enter(downProject, event);
                    break;
                case MapMouseEventType.EXIT:
                    if (downProject == null || downTool == null) {
                        return;
                    }
                    edits = downTool.exit(downProject, event);
                    break;
            }

            if (edits != null && edits.length !== 0) {
                downProject.editManager.append(edits);
            }
            if (push) {
                downProject.editManager.push();
                downProject.editor.renderer.radar.setDirty(true);
            }
            if (reset) {
                downTool = null;
                downProject = null;
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
