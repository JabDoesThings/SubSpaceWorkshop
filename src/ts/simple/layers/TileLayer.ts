import { Layer } from './Layer';
import { MapArea } from '../../util/map/MapArea';
import { TileData } from '../../util/map/TileData';
import { MapRenderer } from '../render/MapRenderer';
import { TileDataChunk } from '../render/TileDataChunk';
import { LayerManager } from './LayerManager';

/**
 * The <i>TileLayer</i> class. TODO: Document.
 *
 * @author Jab
 */
export class TileLayer extends Layer {

    bounds: MapArea;

    readonly tiles: TileData;

    readonly chunks: TileDataChunk[][];

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

        this.chunks = [];
        for (let x = 0; x < 16; x++) {
            let xArray: TileDataChunk[] = this.chunks[x] = [];
            for (let y = 0; y < 16; y++) {
                let chunk = new TileDataChunk(manager.session, this.tiles, x, y);
                chunk.init();
                xArray[y] = chunk;

                this.renderLayers[2].addChild(chunk.tileMap);
                this.renderLayers[2].addChild(chunk.tileMapAnim);
            }
        }
    }

    // @Override
    protected onPreUpdate(): void {
    }

    // @Override
    protected onUpdate(delta: number): void {

        for (let x = 0; x < 16; x++) {
            for (let y = 0; y < 16; y++) {
                this.chunks[x][y].update(delta);
            }
        }
    }

    // @Override
    protected onPostUpdate(): void {
        this.tiles.setDirty(false);
        for (let x = 0; x < 16; x++) {
            for (let y = 0; y < 16; y++) {
                this.chunks[x][y].setDirty(false);
            }
        }
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

        for (let index = 0; index < this.renderLayers.length; index++) {
            renderer.mapLayers.layers[index].addChild(this.renderLayers[index]);
        }
    }

    isDirty(): boolean {
        return super.isDirty() || this.tiles.isDirty();
    }
}
