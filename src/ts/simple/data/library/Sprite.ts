import { Zip } from '../../../io/Zip';
import { LibraryAsset, LibraryAssetLoader } from './Library';

/**
 * The <i>Sprite</i> class. TODO: Document.
 *
 * @author Jab
 */
export class Sprite extends LibraryAsset {

    /**
     * Main constructor.
     *
     * @param id
     * @param name
     */
    constructor(id: string = null, name: string) {
        super('sprite', id, name);
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
 * The <i>SpriteLoader</i> class. TODO: Document.
 *
 * @author Jab
 */
export class SpriteLoader extends LibraryAssetLoader {

    // @Override
    onLoad(id: string, json: { [p: string]: any }, projectZip: Zip): Sprite {
        let asset = new Sprite(id, json.name);
        asset.load(json, projectZip);
        return asset;
    }
}

LibraryAssetLoader.set('sprite', new SpriteLoader());
