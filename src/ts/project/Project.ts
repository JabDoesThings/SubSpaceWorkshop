/**
 * The <i>Project</i> class. TODO: Document.
 *
 * @author Jab
 */
import { LVLMap } from '../map/lvl/LVL';
import { LVZCollection } from '../map/lvz/LVZ';

export class Project {

    layers: [];

    /**
     * Main constructor.
     */
    constructor() {

    }
}

export class CompiledProject {

    map: LVLMap;
    lvz: LVZCollection;

    constructor(project: Project) {
        this.map = new LVLMap();
        this.lvz = new LVZCollection();
    }

    compile(): void {
        // TODO: Implement.
    }
}
