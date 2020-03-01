import { DirtyDataObject } from '../../../util/DirtyDataObject';
import { RasterMapObject } from './RasterMapObject';

/**
 * The <i>ComplexMapObject</i> class. TODO: Document.
 *
 * @author Jab
 */
export abstract class ComplexMapObject extends DirtyDataObject {

    private raster: RasterMapObject;

    protected constructor(name: string, id: string = null) {

        super(name, id);

        // Create the raster object used to display the result.
        this.raster = new RasterMapObject(1, 1, name, this.getId() + "_raster");
    }

}
