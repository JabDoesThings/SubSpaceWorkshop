import { UIPanelTab } from './UI';
import { MapRenderer } from '../render/MapRenderer';
import { Dirtable } from '../../util/Dirtable';
import { InheritedObject } from '../../util/InheritedObject';
import { Inheritable } from '../../util/Inheritable';

/**
 * The <i>LayersPanel</i> class. TODO: Document.
 *
 * @author Jab
 */
export class LayersPanel extends UIPanelTab {

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
        this.element.appendChild(this.layerContainer);

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
    removeChild(object: UILayer): void {
        super.removeChild(object);
        if (this.panel != null) {
            this.panel.updateElements();
        }
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
