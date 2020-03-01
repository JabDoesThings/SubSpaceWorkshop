/**
 * The <i>Project</i> class. TODO: Document.
 *
 * @author Jab
 */
import { LVLMap } from '../../io/LVL';
import { LVZCollection } from '../../io/LVZ';

export class Project {

    compile: CompiledProject;
    layers: [];

    /**
     * Main constructor.
     */
    constructor() {

        this.layers = [];
        this.compile = new CompiledProject(this);
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
