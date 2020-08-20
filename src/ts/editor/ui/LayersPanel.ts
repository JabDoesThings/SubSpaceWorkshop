import {
  ToolbarOrientation,
  UIIcon,
  UIIconToolbar,
  UIPanelTab,
  UITool,
  UIToolEvent,
  UITooltip
} from './UI';
import { MapRenderer } from '../render/MapRenderer';
import { Dirtable } from '../../util/Dirtable';
import { InheritedObject } from '../../util/InheritedObject';
import { Inheritable } from '../../util/Inheritable';
import { Layer } from '../layers/Layer';
import { EditLayerRemove } from '../edits/EditLayerRemove';
import { EditLayerAdd } from '../edits/EditLayerAdd';

/**
 * The <i>LayersPanel</i> class. TODO: Document.
 *
 * @author Jab
 */
export class LayersPanel extends UIPanelTab {

  readonly toolbar: UIIconToolbar;
  readonly layers: UILayer[];
  selectedLayer: number;

  private readonly layerContainer: HTMLDivElement;
  private renderer: MapRenderer;

  /**
   * @constructor
   *
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
    this.layers = [];
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

export class UILayer extends InheritedObject<UILayer> implements Inheritable, Dirtable {

  private readonly visibilityIcon: HTMLElement;
  private readonly invisibilityIcon: HTMLElement;
  private readonly gripElement: HTMLDivElement;
  private readonly gripIcon: HTMLElement;
  private readonly selected: boolean;

  element: HTMLDivElement;
  titleLabel: HTMLLabelElement;
  visibilityElement: HTMLDivElement;
  panel: LayersPanel;
  private visible: boolean;
  private dirty: boolean;
  private locked: boolean;

  /**
   * @constructor
   *
   * @param {string} name
   */
  constructor(name: string) {
    super();
    this.visibilityIcon = document.createElement('i');
    this.visibilityIcon.classList.add('fas', 'fa-eye');
    this.visibilityIcon.style.opacity = '1';
    this.visibilityIcon.style.zIndex = '0';
    this.invisibilityIcon = document.createElement('i');
    this.invisibilityIcon.classList.add('fas', 'fa-eye-slash');
    this.invisibilityIcon.style.opacity = '0';
    this.invisibilityIcon.style.zIndex = '1';
    this.visibilityElement = document.createElement('div');
    this.visibilityElement.classList.add('visibility-icon');
    this.visibilityElement.appendChild(this.visibilityIcon);
    this.visibilityElement.appendChild(this.invisibilityIcon);
    this.visibilityElement.addEventListener('click', () => {
      this.setVisible(!this.visible);
    });

    this.gripIcon = document.createElement('i');
    this.gripIcon.classList.add('fas', 'fa-ellipsis-h');
    this.gripElement = document.createElement('div');
    this.gripElement.classList.add('grip-icon');
    this.gripElement.appendChild(this.gripIcon);
    this.titleLabel = document.createElement('label');
    this.titleLabel.classList.add('title');
    this.titleLabel.innerText = name;
    this.element = document.createElement('div');
    this.element.classList.add('ui-layer');
    this.element.appendChild(this.visibilityElement);
    this.element.appendChild(this.titleLabel);
    this.element.appendChild(this.gripElement);

    this.locked = false;
    this.selected = false;
    this.setVisible(true);
  }

  /** @override */
  addChild(object: UILayer): void {
    super.addChild(object);
    if (this.panel != null) {
      this.panel.updateElements();
    }
  }

  /** @override */
  removeChild(object: UILayer): number {
    const index = super.removeChild(object);
    if (this.panel != null) {
      this.panel.updateElements();
    }
    return index;
  }

  /** @override */
  setParent(object: UILayer): void {
    super.setParent(object);
    if (this.panel != null) {
      this.panel.updateElements();
    }
  }

  isVisible(): boolean {
    return this.visible;
  }

  setVisible(flag: boolean): void {
    if (this.visible === flag) {
      return;
    }
    this.visible = flag;
    this.dirty = true;
    if (flag) {
      this.invisibilityIcon.style.opacity = '0';
      this.visibilityIcon.style.opacity = '1';
    } else {
      this.visibilityIcon.style.opacity = '0';
      this.invisibilityIcon.style.opacity = '1';
    }
  }

  isLocked(): boolean {
    return this.locked;
  }

  setLocked(flag: boolean): void {
    if (this.locked === flag) {
      return;
    }
    this.locked = flag;
  }

  /** @override */
  isDirty(): boolean {
    return this.dirty;
  }

  /** @override */
  setDirty(flag: boolean): void {
    this.dirty = flag;
  }

  isSelected(): boolean {
    return this.selected;
  }

  setSelected(flag: boolean): void {
    if (flag) {
      if (!this.element.classList.contains('selected')) {
        this.element.classList.add('selected');
      }
    } else {
      if (this.element.classList.contains('selected')) {
        this.element.classList.remove('selected');
      }
    }
  }
}
