import { Edit } from './Edit';
import { EditManager } from '../EditManager';
import { Layer } from '../layers/Layer';

/**
 * The <i>EditTiles</i> class. TODO: Document.
 *
 * @author Jab
 */
export class EditTiles extends Edit {

    readonly tiles: TileEdit[];
    tilesToUndo: TileEdit[];

    private readonly applyDimensions: boolean;
    private readonly layer: Layer;
    private readonly ignoreMask: boolean;

    /**
     * Main constructor.
     *
     * @param layer The layer that the edit is on.
     * @param tiles
     * @param applyDimensions
     * @param ignoreMask
     */
    constructor(
        layer: Layer,
        tiles: TileEdit[],
        applyDimensions = true,
        ignoreMask: boolean = false) {

        super();

        this.layer = layer;
        this.tiles = tiles;
        this.tilesToUndo = null;
        this.applyDimensions = applyDimensions;
        this.ignoreMask = ignoreMask;
    }

    // @Override
    do(history: EditManager): void {

        if (this.tilesToUndo != null) {
            return;
        }

        this.tilesToUndo = [];

        for (let index = 0; index < this.tiles.length; index++) {

            let next = this.tiles[index];

            try {

                let mask = history.project.selections;
                let originalTiles
                    = this.layer.tiles.set(
                    next.x,
                    next.y,
                    next.to,
                    this.ignoreMask ? null : mask,
                    this.applyDimensions
                );
                this.tilesToUndo = this.tilesToUndo.concat(originalTiles);
            } catch (e) {

                let str = next != null ? next.toString() : 'null';
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

        let tiles = this.layer.tiles;

        for (let index = this.tilesToUndo.length - 1; index >= 0; index--) {

            let next = this.tilesToUndo[index];

            try {
                let mask = history.project.selections;
                tiles.set(
                    next.x,
                    next.y,
                    next.from,
                    this.ignoreMask ? null : mask,
                    this.applyDimensions
                );
            } catch (e) {

                let str = next != null ? next.toString() : 'null';
                console.error('Failed to UNDO tile: ' + str);
                console.error(e);
            }
        }

        this.tilesToUndo = null;
    }

}

/**
 * The <i>TileEdit</i> class. TODO: Document.
 *
 * @author Jab
 */
export class TileEdit {

    readonly x: number;
    readonly y: number;
    readonly from: number;
    readonly to: number;

    /**
     * Main constructor.
     *
     * @param x The 'X' coordinate of the tile to edit.
     * @param y The 'Y' coordinate of the tile to edit.
     * @param from The original ID of the tile.
     * @param to The ID to set for the tile.
     */
    constructor(x: number, y: number, from: number, to: number) {
        this.x = x;
        this.y = y;
        this.from = from;
        this.to = to;
    }

    // @Override
    toString(): string {
        return '{x: ' + this.x + ', y: ' + this.y + ', from: ' + this.from + ', to: ' + this.to + '}';
    }
}
