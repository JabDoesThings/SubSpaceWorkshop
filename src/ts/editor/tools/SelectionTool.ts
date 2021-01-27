import Tool from './Tool';
import Project from '../Project';
import Edit from '../edits/Edit';
import MapSection from '../../util/map/MapSection';
import EditSelectionAdd from '../edits/EditSelectionAdd';
import EditSelectionClear from '../edits/EditSelectionClear';
import MapMouseEvent from '../../common/MapMouseEvent';

/**
 * The <i>SelectionTool</i> class. TODO: Document.
 *
 * @author Jab
 */
export default class SelectionTool extends Tool {
  invert: boolean = false;
  valid: boolean = false;
  dragged: boolean = false;

  constructor() {
    super();
    // Let the editor know that the tool is a selector and requires changes to
    //   certain components to not get in the way of selecting.
    this.isSelector = true;
  }

  /** @override */
  protected onStart(project: Project, event: MapMouseEvent): Edit[] {
    if (event.button !== 0) {
      return;
    }
    this.valid = true;
    const editor = project.editor;
    if (!editor.isControlPressed() && !editor.isAltPressed() && !project.selections.isEmpty()) {
      // Remove all selections.
      const history = project.editManager;
      history.append([new EditSelectionClear()]);
      history.push();
    }
    this.invert = editor.isAltPressed();
    return;
  }

  /** @override */
  protected onDrag(project: Project, event: MapMouseEvent): Edit[] {
    if (!this.valid) {
      return;
    }
    this.dragged = true;
    return this.select(project, event);
  }

  /** @override */
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

  /** @override */
  protected onEnter(project: Project, event: MapMouseEvent): Edit[] {
    return null;
  }

  /** @override */
  protected onExit(project: Project, event: MapMouseEvent): Edit[] {
    return null;
  }

  private select(project: Project, event: MapMouseEvent): Edit[] {
    if (event.data == null) {
      return;
    }

    const tx = event.data.tileX;
    const ty = event.data.tileY;
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

  /** @override */
  protected onDrawCursor(container: PIXI.Container): void {
  }
}
