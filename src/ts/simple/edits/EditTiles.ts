import { Edit } from './Edit';
import { EditManager } from '../EditManager';

/**
 * The <i>EditTiles</i> class. TODO: Document.
 *
 * @author Jab
 */
export class EditTiles extends Edit {

    readonly tiles: { x: number, y: number, from: number, to: number }[];
    tilesToUndo: { x: number, y: number, from: number, to: number }[];

    private applyDimensions: boolean;

    /**
     * Main constructor.
     *
     * @param layer The layer that the edit is on.
     * @param tiles
     * @param applyDimensions
     */
    constructor(
        layer: number,
        tiles: { x: number, y: number, from: number, to: number }[],
        applyDimensions = true) {

        super(layer);
        this.tiles = tiles;
        this.tilesToUndo = null;
        this.applyDimensions = applyDimensions;
    }

    // @Override
    do(history: EditManager): void {

        if (this.tilesToUndo != null) {
            return;
        }

        let map = history.session.map;

        this.tilesToUndo = [];

        for (let index = 0; index < this.tiles.length; index++) {

            let next = this.tiles[index];

            try {
                this.tilesToUndo
                    = this.tilesToUndo.concat(map.setTile(next.x, next.y, next.to, this.applyDimensions));
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

        if (this.tilesToUndo == null) {
            return;
        }

        let map = history.session.map;

        for (let index = this.tilesToUndo.length - 1; index >= 0; index--) {

            let next = this.tilesToUndo[index];

            try {
                map.setTile(next.x, next.y, next.from, this.applyDimensions);
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

        this.tilesToUndo = null;
    }
}
