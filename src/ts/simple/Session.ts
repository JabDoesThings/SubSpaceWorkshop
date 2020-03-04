import { LVLMap } from '../io/LVL';
import { LVL } from '../io/LVLUtils';
import { LVZPackage } from '../io/LVZ';
import { LVZ } from '../io/LVZUtils';

export class Session {

    private lvlPath: string;
    private lvzPaths: string[];

    map: LVLMap;
    lvzPackages: LVZPackage[];
    tab: HTMLDivElement;
    _name: string;
    loaded: boolean;

    constructor(lvlPath: string, lvzPaths: string[] = []) {

        this.lvlPath = lvlPath;
        this.lvzPaths = lvzPaths;

        let split = lvlPath.split("/");
        this._name = split[split.length - 1].split('.')[0];

        // Create the tab to add to the map list.
        this.tab = document.createElement('div');
        this.tab.classList.add('tab');
        this.tab.innerHTML = '<label>' + this._name + '</label>';
    }

    load(override: boolean = false): void {

        if (override || !this.loaded) {

            this.map = LVL.read(this.lvlPath);

            this.lvzPackages = [];
            for (let index = 0; index < this.lvzPaths.length; index++) {
                this.lvzPackages.push(LVZ.read(this.lvzPaths[index]).inflate());
            }

            this.loaded = true;
        }
    }

}
