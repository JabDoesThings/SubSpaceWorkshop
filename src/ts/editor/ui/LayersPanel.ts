import MapRenderer from '../render/MapRenderer';
import Layer from '../layers/Layer';
import EditLayerRemove from '../edits/EditLayerRemove';
import EditLayerAdd from '../edits/EditLayerAdd';
import {
  UIPanelTab,
  UIIconToolbar,
  UITool,
  UIIcon,
  UITooltip,
  UILayer,
  ToolbarOrientation,
  UIToolEvent
} from '../../ui/UI';

/**
 * The <i>LayersPanel</i> class. TODO: Document.
 *
 * @author Jab
 */
export default class LayersPanel extends UIPanelTab {
  readonly toolbar: UIIconToolbar;
  readonly layers: UILayer[] = [];
  selectedLayer: number;
  private readonly layerContainer: HTMLDivElement;
  private renderer: MapRenderer;

  /**
   * @param {MapRenderer} renderer
   */
  constructor(renderer: MapRenderer) {
    super('layers');
    this.renderer = renderer;
    this.selectedLayer = -1;
    this.layerContainer = document.createElement('div');
    this.layerContainer.classList.add('ui-layer-container');

    const toolAdd = new UITool(
      'new-layer',
      new UIIcon(['fas', 'fa-plus-square']),
      new UITooltip('New Layer'),
      false
    );

    const toolRemove = new UITool(
      'remove-layer',
      new UIIcon(['fas', 'fa-minus-square']),
      new UITooltip('Remove Layer'),
      false
    );

    const toolDuplicate = new UITool(
      'duplicate-layer',
      new UIIcon(['fas', 'fa-clone']),
      new UITooltip('Duplicate Layer'),
      false
    );

    const toolMerge = new UITool(
      'merge-layer',
      new UIIcon(['fas', 'fa-arrow-down']),
      new UITooltip('Merge Layer'),
      false
    );

    const toolMoveUp = new UITool(
      'move-up-layer',
      new UIIcon(['fas', 'fa-caret-square-up']),
      new UITooltip('Move Layer Up'),
      false
    );

    const toolMoveDown = new UITool(
      'move-down-layer',
      new UIIcon(['fas', 'fa-caret-square-down']),
      new UITooltip('Move Layer Down'),
      false
    );

    this.toolbar = new UIIconToolbar(ToolbarOrientation.BOTTOM);
    this.toolbar.add(toolAdd);
    this.toolbar.add(toolRemove);
    this.toolbar.add(toolDuplicate);
    this.toolbar.add(toolMerge);
    this.toolbar.add(toolMoveUp);
    this.toolbar.add(toolMoveDown);
    this.toolbar.addEventListener((e) => {
      if (e.eventType !== 'UIToolEvent') {
        return;
      }
      const event = <UIToolEvent> e;
      const id = event.tool.id;
      if (id === 'new-layer') {
        this.newLayer();
      } else if (id === 'remove-layer') {
        this.removeLayer();
      }
    });

    this.element.appendChild(this.layerContainer);
    this.element.appendChild(this.toolbar.element);
    this.element.style.overflowY = 'hidden';
    this.element.style.overflowX = '';
  }

  addLayer(layer: UILayer) {
    this.layers.push(layer);
  }

  clear(): void {
    this.layers.length = 0;
  }

  updateElements() {
    // Remove all child elements.
    const toRemove = [];
    for (let index = 0; index < this.layerContainer.childElementCount; index++) {
      toRemove.push(this.layerContainer.children.item(index));
    }
    for (let index = 0; index < toRemove.length; index++) {
      this.layerContainer.removeChild(toRemove[index]);
    }

    const process = (layer: UILayer, indent: number): void => {
      const element = layer.element;
      element.style.position = 'relative';
      element.style.left = (indent * 8) + 'px';
      element.style.width = 'calc(100% - ' + (indent * 8) + 'px)';
      this.layerContainer.appendChild(layer.element);

      const children = layer.getChildren();
      if (children.length !== 0) {
        for (let index = 0; index < children.length; index++) {
          process(children[index], indent + 1);
        }
      }
    };

    for (let index = 0; index < this.layers.length; index++) {
      process(this.layers[index], 0);
    }
  }

  getLayerIndex(layer: UILayer): number {
    for (let index = 0; index < this.layers.length; index++) {
      if (this.layers[index] === layer) {
        return index;
      }
    }
    return -1;
  }

  newLayer(): Layer {
    const project = this.renderer.project;
    if (project == null) {
      return;
    }
    const layer = new Layer('default', null, 'Untitled Layer');
    const edit = new EditLayerAdd(layer, true);
    project.editManager.append([edit]);
    project.editManager.push();
    return layer;
  }

  removeLayer(): void {
    const project = this.renderer.project;
    if (project == null) {
      return;
    }
    const layers = project.layers;
    const active = layers.active;
    if (active == null) {
      return;
    }
    const edit = new EditLayerRemove(active);
    project.editManager.append([edit]);
    project.editManager.push();
  }
}
