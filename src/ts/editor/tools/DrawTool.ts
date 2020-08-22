import Tool from './Tool';
import Project from '../Project';
import Edit from '../edits/Edit';
import Selection from '../ui/Selection';
import SelectionType from '../ui/SelectionType';
import MapMouseEvent from '../../common/MapMouseEvent';

/**
 * The <i>DrawTool</i> class. TODO: Document.
 *
 * @author Jab
 */
export default abstract class DrawTool extends Tool {
  private readonly clearOnDraw: boolean;

  /**
   * @param {boolean} clearOnDraw
   */
  constructor(clearOnDraw: boolean = false) {
    super();
    this.clearOnDraw = clearOnDraw;
  }

  /** @override */
  protected onStart(project: Project, event: MapMouseEvent): Edit[] {
    return this.draw(project, event, false);
  }

  /** @override */
  protected onDrag(project: Project, event: MapMouseEvent): Edit[] {
    return this.draw(project, event, false);
  }

  /** @override */
  protected onStop(project: Project, event: MapMouseEvent): Edit[] {
    return this.draw(project, event, true);
  }

  /** @override */
  protected onEnter(project: Project, event: MapMouseEvent): Edit[] {
    return;
  }

  /** @override */
  protected onExit(project: Project, event: MapMouseEvent): Edit[] {
    return;
  }

  protected draw(project: Project, event: MapMouseEvent, useActiveLayer: boolean): Edit[] {
    const selectionGroup = project.selectionGroup;
    const selection = selectionGroup.getSelection(event.button);
    if (selection == null || event.data == null) {
      return;
    }
    // Clear any previous edits made by the tool during its current use.
    if (this.clearOnDraw) {
      project.editManager.reset();
    }
    if (selection.type === SelectionType.TILE) {
      return this.drawTile(project, selection, event, useActiveLayer);
    } else if (selection.type == SelectionType.MAP_OBJECT) {
      return this.drawMapObject(project, selection, event, useActiveLayer);
    } else if (selection.type == SelectionType.SCREEN_OBJECT) {
      return this.drawScreenObject(project, selection, event, useActiveLayer);
    } else if (selection.type == SelectionType.REGION) {
      return this.drawRegion(project, selection, event, useActiveLayer);
    }
  }

  protected abstract drawTile(project: Project, selection: Selection, event: MapMouseEvent, useActiveLayer: boolean): Edit[];

  protected abstract drawMapObject(project: Project, selection: Selection, event: MapMouseEvent, useActiveLayer: boolean): Edit[];

  protected abstract drawScreenObject(project: Project, selection: Selection, event: MapMouseEvent, useActiveLayer: boolean): Edit[];

  protected abstract drawRegion(project: Project, selection: Selection, event: MapMouseEvent, useActiveLayer: boolean): Edit[];
}
