import { GeneratedLayer } from './GeneratedLayer';
import { LayerManager } from './LayerManager';
import { TileData } from '../../util/map/TileData';
import { Zip } from '../../io/Zip';

/**
 * The <i>WallTileLayer</i> class. TODO: Document.
 *
 * @author Jab
 */
export class WallTileLayer extends GeneratedLayer {

    private wallTileData: TileData[];
    private idToValueMap: {[id: string]: number};
    private valueToIdMap: {[value: number]: string};

    /**
     * Main constructor.
     *
     * @param manager
     * @param id
     * @param name
     */
    constructor(manager: LayerManager, id: string, name: string) {
        super('walltile', id, name);
    }

    // @Override
    onLoad(json: { [p: string]: any }, projectZip: Zip): void {

    }

    // @Override
    onSave(json: { [p: string]: any }, projectZip: Zip): void {

    }

    // @Override
    protected onGenerate(): void {

    }

    // @Override
    protected onCacheApply(): void {

    }
}
