import * as PIXI from 'pixi.js';

import { TileUtils } from './TileUtils';
import { DirtyDataObject } from '../../util/DirtyDataObject';

/**
 * The <i>Tileset</i> class. TODO: Document.
 *
 * @author Jab
 */
export class TileSet extends DirtyDataObject {

    private image: PIXI.Texture;
    private readonly tiles: PIXI.Texture[];
    private readonly tileCoordinates: number[][];

    /**
     * Main constructor.
     *
     * @param image The tileset image.
     * @param name The tileset name.
     * @param id The ID of the tileset. If the ID is null, a UUID is generated
     *   in its place.
     */
    constructor(image: string, name: string, id: string = null) {

        super(name, id);

        // Make sure the image is a valid tileset.
        // TileUtils.validateTilesetImage(image);

        this.image = PIXI.Texture.from(image);

        this.tileCoordinates = [];
        this.tiles = [];
        this.tiles.push(null);

        for (let y = 0; y < 10; y++) {
            for (let x = 0; x < 19; x++) {

                let tx = 16 * x;
                let ty = 16 * y;
                this.tileCoordinates.push([tx, ty]);
                // Grab the section of the tileset for the tile and turn it into its own texture.
                let rect = new PIXI.Rectangle(tx, ty, 16, 16);
                let tile = new PIXI.Texture(this.image.baseTexture, rect);

                // Push the next ID to the stack.
                this.tiles.push(tile);
            }
        }

        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 19; x++) {
                let tx = 16 * x;
                let ty = 16 * y;
                this.tileCoordinates.push([tx, ty]);
            }
        }

        /*
        let canvas = new HTMLCanvasElement();
        canvas.width = 16;
        canvas.height = 16;

        let ctx = canvas.getContext("2d");

        // Clear the canvas to prevent images with alpha channels bleeding.
        ctx.clearRect(0, 0, 16, 16);

        // Create the empty tile image for '0' which is nothing.
        let tile: HTMLImageElement = new Image();
        tile.src = canvas.toDataURL();
        this.tiles.push(tile);

        for (let y = 0; y < 10; y++) {
            for (let x = 0; x < 19; x++) {

                // Clear the canvas to prevent images with alpha channels bleeding.
                ctx.clearRect(0, 0, 16, 16);

                // Draw the next tile onto the canvas.
                ctx.drawImage(this.image, x * 16, y * 16);

                // Create the tile image.
                tile = new Image();
                tile.src = canvas.toDataURL();

                // Push the next Id to the stack.
                this.tiles.push(tile);
            }
        }

         */

    }

    // @Override
    public onUpdate(): boolean {

        return true;
        /*

        // Create the canvas element for the updated tileset image.
        let canvas: HTMLCanvasElement = new HTMLCanvasElement();

        // Set the width and height of the tileset dimensions.
        let dims = TileUtils.TILESET_DIMENSIONS;
        canvas.width = dims[0];
        canvas.height = dims[1];

        // Grab the context for the canvas to apply each tile.
        let ctx = canvas.getContext("2d");

        // Set the default color as 'black' as the tileset image does not have an
        //   alpha channel.
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Use this offset to iterate through the one-dimensional tile array.
        let offset = 1;

        for (let y = 0; y < 10; y++) {
            for (let x = 0; x < 19; x++) {

                // Draw the next tile onto the tileset.
                ctx.drawImage(this.tiles[offset++], x * 16, y * 16);

            }
        }

        // Set the compiled tileset image's source to the canvas.
        this.image = new HTMLImageElement();
        this.image.src = canvas.toDataURL();
         */

    }

    /**
     *
     * @param tile The ID of the tile to grab.
     *
     * @return Returns the image element of the tile in the tileset.
     *
     * @throws RangeError Thrown if the ID given is below 0 or above 190.
     */
    public getTile(tile: number): PIXI.Texture {

        // Check to make sure that the tile is within range.
        if (!TileUtils.inTilesetRange(tile)) {
            throw new RangeError(
                "The id given is out of range. Id's can only be between 1 and 190. ("
                + tile
                + " given)"
            );
        }

        return this.tiles[tile];
    }

    /**
     * Sets a tile-image for a tile-id in a tileset.
     *
     * @param tile The tile ID to set.
     * @param image The image to set for the tile.
     *
     * @throws RangeError Thrown if the tile ID given is out of the tileset's range of 1 to 190.
     * @throws Error Thrown if the image given is null or is not 16x16 in size.
     */
    public setTile(tile: number, image: PIXI.Texture) {

        // Check to make sure that the tile is within range.
        if (!TileUtils.inTilesetRange(tile)) {
            throw new RangeError(
                "The id given is out of range. Id's can only be between 1 and 190. ("
                + tile
                + " given)"
            );
        }

        // Make sure that the tile image is properly sized before application.
        TileUtils.validateTileImage(image);

        // Set the tile in the tiles array.
        this.tiles[tile] = image;

        // Sets the tileset as 'dirty' to be updated.
        this.setDirty(true);
    }

    /**
     * @return Returns the source image of the entire tileset.
     */
    public getTexture(): PIXI.Texture {
        return this.image;
    }

    public getTileCoordinates(tile: number): number[] {
        return this.tileCoordinates[tile - 1];
    }
}
