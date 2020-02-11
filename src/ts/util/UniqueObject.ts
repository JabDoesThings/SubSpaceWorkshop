import uuid = require('uuid');
import { Unique } from './Unique';

/**
 * The <i>UniqueObject</i> class. TODO: Document.
 *
 * @author Jab.
 */
export abstract class UniqueObject implements Unique {

    private id: string;
    private name: string;

    /**
     * Main constructor.
     *
     * @param name The decorative name of the object.
     * @param id The internal ID of the object. If not provided, a UUID V4 is generated.
     */
    protected constructor(name: string, id: string = null) {
        this.name = name;
        if (id == null) {
            this.id = uuid.v4();
        } else {
            this.id = id;
        }
    }

    // @Override
    public equals(other: Unique): boolean {
        return other != null
            && other instanceof UniqueObject
            && other.getId() === this.getId();
    }

    // @Override
    public getName(): string {
        return this.name;
    }

    // @Override
    public setName(name: string): void {
        this.name = name;
    }

    // @Override
    public getId(): string {
        return this.id;
    }

    // @Override
    public setId(id: string): void {
        this.id = id;
    }
}

