import EditManager from '../EditManager';
import Edit from './Edit';
import Layer from '../layers/Layer';
import TileEdit from './TileEdit';

/**
 * The <i>EditTiles</i> class. TODO: Document.
 *
 * @author Jab
 */
export default class EditTiles extends Edit {
  readonly tiles: TileEdit[];
  tilesToUndo: TileEdit[];
  private readonly applyDimensions: boolean;
  private readonly layer: Layer;
  private readonly ignoreMask: boolean;

  /**
   * @param {Layer} layer The layer that the edit is on.
   * @param {TileEdit[]} tiles
   * @param {boolean} applyDimensions
   * @param {boolean} ignoreMask
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

  /** @override */
  do(history: EditManager): void {
    if (this.tilesToUndo != null) {
      return;
    }
    this.tilesToUndo = [];
    for (let index = 0; index < this.tiles.length; index++) {
      const next = this.tiles[index];
      try {
        const mask = history.project.selections;
        const originalTiles
          = this.layer.tiles.set(
          next.x,
          next.y,
          next.to,
          this.ignoreMask ? null : mask,
          this.applyDimensions
        );
        this.tilesToUndo = this.tilesToUndo.concat(originalTiles);
      } catch (e) {
        const str = next != null ? next.toString() : 'null';
        console.error(`Failed to DO tile: ${str}`);
        console.error(e);
      }
    }
  }

  /** @override */
  undo(history: EditManager): void {
    if (this.tilesToUndo == null) {
      return;
    }
    const tiles = this.layer.tiles;
    for (let index = this.tilesToUndo.length - 1; index >= 0; index--) {
      const next = this.tilesToUndo[index];
      try {
        const mask = history.project.selections;
        tiles.set(
          next.x,
          next.y,
          next.from,
          this.ignoreMask ? null : mask,
          this.applyDimensions
        );
      } catch (e) {
        const str = next != null ? next.toString() : 'null';
        console.error(`Failed to UNDO tile: ${str}`);
        console.error(e);
      }
    }
    this.tilesToUndo = null;
  }
}
