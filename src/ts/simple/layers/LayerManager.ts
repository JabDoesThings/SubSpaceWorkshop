import { Layer } from './Layer';
import { Project } from '../Project';
import { MapRenderer } from '../render/MapRenderer';

/**
 * The <i>LayerManager</i> class. TODO: Document.
 *
 * @author Jab
 */
export class LayerManager {

    readonly layers: Layer[];
    readonly project: Project;

    active: Layer;

    /**
     * Main constructor.
     *
     * @param project
     */
    constructor(project: Project) {

        this.project = project;

        this.layers = [];
        this.active = null;
    }

    /**
     * Adds a layer to the project.
     * .
     * @param layer The layer to add.
     * @param setActive
     */
    add(layer: Layer, setActive: boolean = true): void {

        this.layers.push(layer);

        if (setActive) {
            this.active = layer;
        }
    }

    /**
     * Removes a layer from the project.
     *
     * @param layer The layer to remove.
     */
    remove(layer: Layer): void {

        let isActiveRemoved = this.active === layer;

        let toCopy = [];
        for (let index = 0; index < this.layers.length; index++) {

            let next = this.layers[index];
            if (next === layer) {
                continue;
            }

            toCopy.push(next);
        }

        this.layers.length = 0;

        for (let index = 0; index < toCopy.length; index++) {
            let next = toCopy[index];
            this.layers.push(next);
        }

        if (isActiveRemoved) {
            if (this.layers.length === 0) {
                this.active = null;
            } else {
                this.active = this.layers[this.layers.length - 1];
            }
        }
    }

    /**
     * Clears all layers from the project.
     */
    clear(overrideLocked: boolean): Layer[] {

        let toReturn = [];
        let toCopy = [];
        for (let index = 0; index < this.layers.length; index++) {

            let next = this.layers[index];

            if (!overrideLocked && next.isLocked()) {
                toCopy.push(next);
                continue;
            }

            toReturn.push(this.layers[index]);
        }

        this.layers.length = 0;

        if (toCopy.length !== 0) {
            for (let index = 0; index < toCopy.length; index++) {
                this.layers.push(toCopy[index]);
            }
        }

        return toReturn;
    }

    /**
     * @param layer The layer to test.
     * @param deepSearch Set this to true to scan child layers.
     * @return Returns true if the layer is in the project.
     */
    contains(layer: Layer, deepSearch: boolean = false): boolean {

        let check = (layers: Layer[]): boolean => {

            // Go through all layers and compare them and their children.
            for (let index = 0; index < layers.length; index++) {

                // The main layer
                let next = this.layers[index];
                if (next === layer) {
                    return true;
                }

                // The layer's children.
                if (deepSearch && next.hasChildren()) {
                    if (check(next.getChildren())) {
                        return true;
                    }
                }
            }

            // This level of recursion and below it did not match the layer given.
            return false;
        };

        return check(this.layers);
    }

    /**
     * @return Returns the active layer in the project. If no layer is active,
     *   null is returned.
     */
    getActive(): Layer {
        return this.active;
    }

    preUpdate(): void {
        if (this.layers.length !== 0) {
            for (let index = 0; index < this.layers.length; index++) {
                this.layers[index].preUpdate();
            }
        }
    }

    update(delta: number): void {
        if (this.layers.length !== 0) {
            for (let index = 0; index < this.layers.length; index++) {
                this.layers[index].update(delta);
            }
        }
    }

    postUpdate(): void {
        if (this.layers.length !== 0) {
            for (let index = 0; index < this.layers.length; index++) {
                this.layers[index].postUpdate();
            }
        }
    }

    /**
     * @param x The 'X' coordinate of the tile.
     * @param y The 'Y' coordinate of the tile.
     *
     * @return Returns the ID on the top-most layer (child-layer if applicable). If no tile data
     *   are available, -1 is returned.
     */
    getTile(x: number, y: number): number {

        if (this.layers.length === 0) {
            return -1;
        }

        for (let index = this.layers.length - 1; index >= 0; index--) {

            let tileId = this.layers[index].getTile(x, y);
            if (tileId > 0) {
                return tileId;
            }
        }

        return -1;
    }

    isDirty(): boolean {

        if (this.layers.length === 0) {
            return false;
        }

        for (let index = this.layers.length - 1; index >= 0; index--) {
            if (this.layers[index].isDirty()) {
                return true;
            }
        }

        return false;
    }

    onActivate(renderer: MapRenderer) {

        if (this.layers.length === 0) {
            return false;
        }

        for (let index = 0; index < this.layers.length; index++) {
            this.layers[index].activate(renderer);
        }
    }
}
