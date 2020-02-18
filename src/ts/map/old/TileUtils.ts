/**
 * The <i>ImageUtils</i> class. TODO: Document.
 *
 * @author Jab
 */
import { TileSet } from './TileSet';
import * as PIXI from "pixi.js";

export class TileUtils {

    public static readonly TILESET_DIMENSIONS: number[] = [306, 160];

    public static DEFAULT_TILESET: TileSet = new TileSet("assets/media/tiles.bmp", "default", "default_tileset");

    public static FLAG_TEXTURE: PIXI.Texture = PIXI.Texture.from("assets/media/flag.png");
    public static GOAL_TEXTURE: PIXI.Texture = PIXI.Texture.from("assets/media/goal.png");
    public static PRIZES_TEXTURE: PIXI.Texture = PIXI.Texture.from("assets/media/prizes.png");
    public static OVER1_TEXTURE: PIXI.Texture = PIXI.Texture.from("assets/media/over1.png");
    public static OVER2_TEXTURE: PIXI.Texture = PIXI.Texture.from("assets/media/over2.png");
    public static OVER3_TEXTURE: PIXI.Texture = PIXI.Texture.from("assets/media/over3.png");
    public static OVER4_TEXTURE: PIXI.Texture = PIXI.Texture.from("assets/media/over4.png");
    public static OVER5_TEXTURE: PIXI.Texture = PIXI.Texture.from("assets/media/over5.png");
    public static EXTRAS_TEXTURE: PIXI.Texture = PIXI.Texture.from("assets/media/extras.bmp");

    /**
     * Tests whether the image given is null or the dimensions given are invalid.
     *
     * @param image The image to test.
     *
     * @throws Error Thrown if the image is null, undefined, or does not fit the dimensions given.
     */
    static validateTilesetImage(image: HTMLImageElement) {

        // First, make sure the image is not null or undefined.
        if (image == null) {
            throw new Error("The image given is null or undefined.");
        }

        // Grab the dimensions to check against.
        let dims = TileUtils.TILESET_DIMENSIONS;

        // Check if either width or height dimensions do not match.
        if (image.width != dims[0] || image.height != dims[1]) {
            throw new Error(
                "Invalid dimensions for the tileset image. Images must be "
                + dims[0]
                + "x"
                + dims[1]
                + ". ("
                + image.width
                + "x"
                + image.height
                + " given)"
            );
        }
    }

    /**
     *
     * Tests if the image is 16x16 pixels. (The dimensions of a tile)
     *
     * @param image The image to test.
     *
     * @throws Error Thrown if the image is null, or the width or height of the image is
     *   not 16 pixels.
     */
    public static validateTileImage(image: PIXI.Texture) {

        // First, make sure the image is not null or undefined.
        if (image == null) {
            throw new Error("The image given is null or undefined.");
        }

        let width = image.width;
        let height = image.height;

        if (width != 16 || height != 16) {
            throw new Error(
                "Invalid dimensions for the tile image. Images must be 16x16. ("
                + width
                + "x"
                + height
                + " given)"
            );
        }

    }

    /**
     * Tests if a image's dimensions are divisible by 16.
     *
     * @param image The image to test.
     *
     * @return Returns 'true' if the image's dimensions are divisible by 16.
     */
    public static canImageFitTiles(image: HTMLImageElement): boolean {

        // First, make sure the image is not null or undefined.
        if (image == null) {
            throw new Error("The image given is null or undefined.");
        }

        return TileUtils.canFitTiles(image.width, image.height);

    }

    /**
     * Tests if both a 'width' and 'height' value are divisible by 16.
     *
     * @param width The 'width' value to test.
     * @param height The 'height' value to test.
     *
     * @return Returns 'true' if the width and height are both divisible by 16.
     */
    public static canFitTiles(width: number, height: number): boolean {
        return width % 16 == 0 && height % 16 == 0;
    }

    /**
     * Tests whether or not a tile is a unsigned byte value between 0 and 255.
     * @param value The value to test.
     *
     * @throws RangeError Thrown if the value is less than 0 or greater than 255.
     */
    public static validateTileId(value: number): void {
        if (value < 0 || value > 255) {
            throw new RangeError("The tile-value given is out of range. " +
                "Tile values can only be between 0 and 255. (" + value + " given)");
        }
    }

    /**
     * Tests whether or not the ID given is within the standard tileset range of 1 and 190.
     * @param tile The ID to test.
     *
     * @return Returns 'true' if the ID is within 1 and 190.
     */
    public static inTilesetRange(tile: number): boolean {
        return tile >= 1 && tile <= 190;
    }
}
