import { Edit } from './Edit';
import { EditManager } from '../EditManager';

/**
 * The <i>EditTiles</i> class. TODO: Document.
 *
 * @author Jab
 */
export class EditTiles extends Edit {

    readonly tiles: { x: number, y: number, from: number, to: number }[];

    /**
     * Main constructor.
     *
     * @param layer The layer that the edit is on.
     * @param tiles
     */
    constructor(layer: number, tiles: { x: number, y: number, from: number, to: number }[]) {
        super(layer);
        this.tiles = tiles;
    }

    // @Override
    do(history: EditManager): void {

        let map = history.session.map;

        for (let index = 0; index < this.tiles.length; index++) {

            let next = this.tiles[index];

            try {
                map.setTile(next.x, next.y, next.to);
            } catch (e) {

                let str = 'null';
                if (next != null) {
                    str = '{x: ' + next.x
                        + ', y: ' + next.y
                        + ', from: ' + next.from
                        + ', to: ' + next.to + '}';
                }

                console.error('Failed to DO tile: ' + str);
                console.error(e);
            }
        }
    }

    // @Override
    undo(history: EditManager): void {

        let map = history.session.map;

        for (let index = 0; index < this.tiles.length; index++) {

            let next = this.tiles[index];

            try {
                map.setTile(next.x, next.y, next.from);
            } catch (e) {

                let str = 'null';
                if (next != null) {
                    str = '{x: ' + next.x
                        + ', y: ' + next.y
                        + ', from: ' + next.from
                        + ', to: ' + next.to + '}';
                }

                console.error('Failed to UNDO tile: ' + str);
                console.error(e);
            }
        }
    }
}
