import { UIPanelTab } from './UI';
import { MapRenderer } from '../render/MapRenderer';
import { Dirtable } from '../../util/Dirtable';
import { InheritedObject } from '../../util/InheritedObject';
import { Inheritable } from '../../util/Inheritable';
import { notDeepEqual } from 'assert';

/**
 * The <i>LayersPanel</i> class. TODO: Document.
 *
 * @author Jab
 */
export class LayersPanel extends UIPanelTab {

    readonly layers: UILayer[];

    private renderer: MapRenderer;

    private layerContainer: HTMLDivElement;

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
        this.element.appendChild(this.layerContainer);

        this.layers = [];

        let layer = new UILayer(this, 'Test Layer');
        let layer2 = new UILayer(this, 'Test Layer 2');
        let layer3 = new UILayer(this, 'Test Layer 3');
        layer.addChild(layer2);
        layer2.addChild(layer3);
        this.addLayer(layer);
        let baseLayer = new UILayer(this, 'Base Layer');
        this.addLayer(baseLayer);

        baseLayer.setSelected(true);
    }

    addLayer(layer: UILayer) {
        this.layers.push(layer);
        this.updateElements();
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
}

export class UILayer extends InheritedObject<UILayer> implements Inheritable, Dirtable {

    element: HTMLDivElement;
    titleLabel: HTMLLabelElement;

    private visibilityElement: HTMLDivElement;
    private visibilityIcon: HTMLElement;
    private invisibilityIcon: HTMLElement;
    private gripElement: HTMLDivElement;
    private gripIcon: HTMLElement;
    private visible: boolean;
    private dirty: boolean;

    private panel: LayersPanel;
    private selected: boolean;

    constructor(panel: LayersPanel, name: string) {

        super();

        this.panel = panel;

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
        this.visibilityElement.addEventListener('click', (event) => {
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

        this.selected = false;

        this.setVisible(false);
    }

    // @Override
    addChild(object: UILayer): void {
        super.addChild(object);
        this.panel.updateElements();
    }

    // @Override
    removeChild(object: UILayer): void {
        super.removeChild(object);
        this.panel.updateElements();
    }

    // @Override
    setParent(object: UILayer): void {
        super.setParent(object);
        this.panel.updateElements();
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
        if(this.selected === flag) {
            return;
        }

        if(flag) {
            this.element.classList.add('selected');
        } else {
            this.element.classList.remove('selected');
        }
    }
}
