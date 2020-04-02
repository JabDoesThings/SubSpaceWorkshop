import { Layer } from './Layer';
import { MapArea } from '../../util/map/MapArea';
import { TileData } from '../../util/map/TileData';
import { MapRenderer } from '../render/MapRenderer';
import { LayerManager } from './LayerManager';

/**
 * The <i>TileLayer</i> class. TODO: Document.
 *
 * @author Jab
 */
export class TileLayer extends Layer {

    bounds: MapArea;

    readonly tiles: TileData;

    /**
     * Main constructor.
     *
     * @param manager
     * @param id The unique ID of the layer. <br/>
     *   <b>NOTE</b>: Only provide this when loading an existing layer. A
     *   unique ID will generate for new layers.
     * @param name The displayed name of the layer.
     * @param tiles
     */
    constructor(manager: LayerManager, id: string, name: string, tiles: TileData = null) {

        super(manager, id, name);

        if (tiles == null) {
            tiles = new TileData();
        }

        this.tiles = tiles;
    }

    // @Override
    protected onPreUpdate(): void {
    }

    // @Override
    protected onUpdate(delta: number): void {
    }

    // @Override
    protected onPostUpdate(): void {
        this.tiles.setDirty(false);
    }

    // @Override
    getBounds(): MapArea {

        if (this.bounds != null) {
            return this.bounds;
        }

        // TODO: Implement.

        return this.bounds;
    }

    // @Override
    onActivate(renderer: MapRenderer): void {
    }

    isDirty(): boolean {
        return super.isDirty() || this.tiles.isDirty();
    }
}
