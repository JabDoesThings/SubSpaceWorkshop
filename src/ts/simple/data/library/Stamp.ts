import { Zip } from '../../../io/Zip';
import { LibraryAsset, LibraryAssetLoader } from './Library';

/**
 * The <i>Stamp</i> class. TODO: Document.
 *
 * @author Jab
 */
export class Stamp extends LibraryAsset {

    /**
     * Main constructor.
     *
     * @param id
     * @param name
     */
    constructor(id: string = null, name: string) {
        super('stamp', id, name);
    }

    // @Override
    protected onLoad(json: { [field: string]: any }, libraryZip: Zip): void {
    }

    // @Override
    protected onSave(json: { [field: string]: any }, libraryZip: Zip): void {
    }

    // @Override
    protected onPreUpdate(): void {
    }

    // @Override
    protected onUpdate(): void {
    }

    // @Override
    protected onPostUpdate(): void {
    }
}

/**
 * The <i>StampLoader</i> class. TODO: Document.
 *
 * @author Jab
 */
export class StampLoader extends LibraryAssetLoader {

    // @Override
    onLoad(id: string, json: { [p: string]: any }, projectZip: Zip): Stamp {
        let asset = new Stamp(id, json.name);
        asset.load(json, projectZip);
        return asset;
    }
}

LibraryAssetLoader.set('stamp', new StampLoader());
