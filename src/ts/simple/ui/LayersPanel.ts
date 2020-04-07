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

    private readonly layerContainer: HTMLDivElement;

    private renderer: MapRenderer;

    selectedLayer: number;

    /**
     * Main constructor.
     */
    constructor(renderer: MapRenderer) {

        super('layers');

        this.renderer = renderer;
        this.selectedLayer = -1;

        this.layerContainer = document.createElement('div');
        this.layerContainer.classList.add('ui-layer-container');

        let toolAdd = new UITool(
            'new-layer',
            new UIIcon(['fas', 'fa-plus-square']),
            new UITooltip('New Layer'),
            false
        );

        let toolRemove = new UITool(
            'remove-layer',
            new UIIcon(['fas', 'fa-minus-square']),
            new UITooltip('Remove Layer'),
            false
        );

        let toolDuplicate = new UITool(
            'duplicate-layer',
            new UIIcon(['fas', 'fa-clone']),
            new UITooltip('Duplicate Layer'),
            false
        );

        let toolMerge = new UITool(
            'merge-layer',
            new UIIcon(['fas', 'fa-arrow-down']),
            new UITooltip('Merge Layer'),
            false
        );

        let toolMoveUp = new UITool(
            'move-up-layer',
            new UIIcon(['fas', 'fa-caret-square-up']),
            new UITooltip('Move Layer Up'),
            false
        );

        let toolMoveDown = new UITool(
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

            console.log(e);
            if (e.eventType !== 'UIToolEvent') {
                return;
            }

            let event = <UIToolEvent> e;
            let id = event.tool.id;
            if (id === 'new-layer') {
                this.newLayer();
            } else if(id === 'remove-layer') {
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
        let toRemove = [];
        for (let index = 0; index < this.layerContainer.childElementCount; index++) {
            toRemove.push(this.layerContainer.children.item(index));
        }
        for (let index = 0; index < toRemove.length; index++) {
            this.layerContainer.removeChild(toRemove[index]);
        }

        let process = (layer: UILayer, indent: number): void => {

            let element = layer.element;
            element.style.position = 'relative';
            element.style.left = (indent * 8) + 'px';
            element.style.width = 'calc(100% - ' + (indent * 8) + 'px)';

            this.layerContainer.appendChild(layer.element);
            let children = layer.getChildren();

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

        let project = this.renderer.project;
        if (project == null) {
            return;
        }

        let layers = project.layers;
        let layer = new Layer(layers, null, 'Untitled Layer');

        let edit = new EditLayerAdd(layer, true);
        project.editManager.append([edit]);
        project.editManager.push();
        return layer;
    }

    removeLayer(): void {

        let project = this.renderer.project;
        if (project == null) {
            return;
        }

        let layers = project.layers;

        let active = layers.active;
        if(active == null) {
            return;
        }

        let edit = new EditLayerRemove(active);
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

    // @Override
    addChild(object: UILayer): void {
        super.addChild(object);
        if (this.panel != null) {
            this.panel.updateElements();
        }
    }

    // @Override
    removeChild(object: UILayer): number {

        let index = super.removeChild(object);

        if (this.panel != null) {
            this.panel.updateElements();
        }

        return index;
    }

    // @Override
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

        if(this.locked === flag) {
            return;
        }

        this.locked = flag;
    }

    // @Override
    isDirty(): boolean {
        return this.dirty;
    }

    // @Override
    setDirty(flag: boolean): void {
        this.dirty = flag;
    }

    isSelected(): boolean {
        return this.selected;
    }

    setSelected(flag: boolean): void {

        // console.log('setSelected(flag: ' + flag + ")");

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
