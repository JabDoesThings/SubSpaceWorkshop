/**
 * The <i>MapSpriteCollection</i> class. TODO: Document.
 *
 * @author Jab
 */
import { Validatable } from '../../util/Validatable';
import hex2rgb = PIXI.utils.hex2rgb;

export class MapSpriteCollection {

    private sprites: MapSprite[];

    /**
     * Main constructor.
     */
    constructor() {

        // Initialize the array to store MapSprites in.
        this.sprites = [];
    }

    /**
     * Updates all MapSprites in the collection.
     */
    update(): void {

        // Go through all registered MapSprites in the collection sequentially and update them.
        for (let index = 0; index < this.sprites.length; index++) {
            this.sprites[index].update();
        }
    }

    /**
     * Resets all MapSprites in the collection.
     */
    reset(): void {

        // Go through all registered MapSprites in the collection sequentially and update them.
        for (let index = 0; index < this.sprites.length; index++) {
            this.sprites[index].reset();
        }
    }

    /**
     * Adds a MapSprite to the collection.
     *
     * @param sprite The MapSprite to add.
     *
     * @return Returns the index of the MapSprite.
     *
     * @throws Error Thrown if the MapSprite given is null or already registered to the collection.
     */
    addSprite(sprite: MapSprite): number {

        // Check to make sure the MapSprite is valid and not registered.
        if (sprite == null) {
            throw new Error("The MapSprite given is null.");
        } else if (this.getIndex(sprite) != -1) {
            throw new Error("The MapSprite given is already registered in the collection.");
        }

        // Properly push the MapSprite to the end of the array.
        this.sprites.push(sprite);

        // Returns the index of the registered MapSprite.
        return this.sprites.length - 1;
    }

    /**
     * Removes a MapSprite from the collection.
     *
     * @param sprite The MapSprite to remove.
     *
     * @throws Error Thrown if the MapSprite given is null or is not registered to the collection.
     */
    removeSprite(sprite: MapSprite): void {

        // Check to make sure the MapSprite is valid and is registered.
        if (sprite == null) {
            throw new Error("The MapSprite given is null.");
        } else if (this.getIndex(sprite) == -1) {
            throw new Error("The MapSprite given is not registered in the collection.");
        }

        // Create the new array to replace the old one without the object.
        let newArray: MapSprite[] = [];

        // Go through all registered MapSprites.
        for (let index = 0; index < this.sprites.length; index++) {

            let next = this.sprites[index];

            // If the MapSprite explicitly matches the one to remove, we skip this and not add
            //   it to the new array.
            if (next === sprite) {
                continue;
            }

            // Push the next MapSprite to the end of the new array. All MapObjects prior to
            //   the one to remove will keep the same index. The ones following the MapSprite
            //   to remove will have different indexes.
            newArray.push(next);
        }

        // Set the new array with the removed MapSprite.
        this.sprites = newArray;
    }

    /**
     * @param index The index of the MapSprite.
     *
     * @return Returns the MapSprite stored at the index given.
     *
     * @throws Error Thrown if the index is negative or greater than the last index of the
     *   collection. (size() - 1)
     */
    getSprite(index: number): MapSprite {

        // Make sure that the index is in range.
        if (index < 0) {
            throw new Error("The index given is negative. (" + index + ")");
        } else if (index > this.size() - 1) {
            throw new Error(
                "The index given is larger than the last index in the collection. ("
                + index
                + " given. Last index: "
                + (this.size() - 1)
                + ")"
            );
        }

        return this.sprites[index];
    }

    /**
     * Tests whether or not the MapSprite is registered in the collection.
     *
     * @param sprite The sprite to test.
     *
     * @return Returns the index of the MapSprite in the storage array for the collection. <br>
     *     If the MapSprite is not stored in the collection, -1 is returned.
     */
    getIndex(sprite: MapSprite) {

        // Go through all registered MapSprites with their respective indexes.
        for (let index = 0; index < this.sprites.length; index++) {

            let next = this.sprites[index];

            // If the next MapSprite explicitly matches the sprite, then this is
            //   the index we need to return.
            if (next != null && next === sprite) {
                return index;
            }
        }

        // Return -1 if the MapSprite is not added to the collection.
        return -1;
    }

    /**
     * Clears all registered MapSprites in the collection.
     */
    clear(): void {
        this.sprites = [];
    }

    /**
     * @return Returns the amount of MapSprites registered in the collection.
     */
    size(): number {
        return this.sprites.length;
    }
}

/**
 * The <i>MapSprite</i> class. TODO: Document.
 *
 * @author Jab
 */
export class MapSprite implements Validatable {

    texture: PIXI.Texture;
    current: number[];

    frameWidth: number;
    frameHeight: number;
    private framesX: number;
    private framesY: number;
    private startX: number;
    private startY: number;
    private endX: number;
    private endY: number;

    private frameOffset: number;
    private frameX: number;
    private frameY: number;
    private frameTime: number;
    private last: number;

    offset: number;

    sequence: PIXI.Texture[];

    /**
     * Main constructor.
     *
     * @param frameWidth
     * @param frameHeight
     * @param framesX
     * @param framesY
     * @param frameTime
     * @param startX
     * @param startY
     * @param endX
     * @param endY
     */
    constructor(frameWidth: number, frameHeight: number, framesX: number = 1, framesY: number = 1, frameTime: number = 1, startX: number = null, startY: number = null, endX: number = null, endY: number = null) {

        if (frameWidth == null) {
            throw new Error("The value of 'frameWidth' cannot be undefined.");
        } else if (frameHeight == null) {
            throw new Error("The value of 'frameHeight' cannot be undefined.");
        }

        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;

        if (framesX == null) {
            throw new Error("The value of 'framesX' cannot be undefined.");
        } else if (framesX < 1) {
            throw new Error("The value of 'framesX' cannot be less than 1.");
        }

        if (framesY == null) {
            throw new Error("The value of 'framesY' cannot be undefined.");
        } else if (framesY < 1) {
            throw new Error("The value of 'framesY' cannot be less than 1.");
        }

        if (frameTime == null) {
            throw new Error("The value of 'frameTime' cannot be undefined.");
        }

        this.framesX = framesX;
        this.framesY = framesY;
        this.frameTime = frameTime;

        if (startX != null) {
            this.startX = startX;
        } else {
            this.startX = 0;
        }

        if (startY != null) {
            this.startY = startY;
        } else {
            this.startY = 0;
        }

        if (endX != null) {
            this.endX = endX;
        } else {
            this.endX = framesX - 1;
        }

        if (endY != null) {
            this.endY = endY;
        } else {
            this.endY = framesY - 1;
        }

        this.frameX = this.startX;
        this.frameY = this.startY;
        this.current = [0, 0, 0, 0];
        this.offset = 0;

        this.validate();

        this.reset();
    }

    // @Override
    validate(): void {

        // Make sure that the 'startX' field is valid.
        if (this.startX < 0) {
            throw new Error("the value 'startX' is less than 0.");
        } else if (this.startX > this.framesX - 1) {
            throw new Error(
                "The value 'startX' is greater than the last frameX offset. ("
                + (this.framesX - 1)
                + ")"
            );
        }

        // Make sure that the 'startY' field is valid.
        if (this.startY < 0) {
            throw new Error("the value 'startY' is less than 0.");
        } else if (this.startY > this.framesY - 1) {
            throw new Error(
                "The value 'startY' is greater than the last frameY offset. ("
                + (this.framesX - 1)
                + ")"
            );
        }

        // Make sure that the 'endX' field is valid.
        if (this.endX < 0) {
            throw new Error("the value 'endX' is less than 0.");
        } else if (this.endX > this.framesX - 1) {
            throw new Error(
                "The value 'endX' is greater than the last frameX offset. ("
                + (this.framesX - 1)
                + ")"
            );
        }

        // Make sure tha the 'endY' field is valid.
        if (this.endY < 0) {
            throw new Error("the value 'endY' is less than 0.");
        } else if (this.endY > this.framesY - 1) {
            throw new Error(
                "The value 'endY' is greater than the last frameY offset. ("
                + (this.framesY - 1)
                + ")"
            );
        }
    }

    reset(): void {

        this.offset = 0;
        this.frameOffset = 0;
        this.framesX = this.startX;
        this.framesY = this.startY;

        this.updateCurrent();

        this.last = Date.now();
    }

    update(): void {

        let now = Date.now();
        if (now - this.last > this.frameTime) {
            this.next();
            // Set the time for the last update.
            this.last = now;
        }
    }

    next(): void {

        this.offset++;
        this.frameOffset++;
        this.frameX++;
        if (this.frameX > this.endX) {
            this.frameY++;
            this.frameX = this.startX;
            if (this.frameY > this.endY) {
                this.frameY = this.startY;
                this.frameOffset = 0;
                this.offset = 0;
            }
        }

        this.updateCurrent();
    }

    updateCurrent(): void {

        let fw = this.frameWidth;
        let fh = this.frameHeight;

        if (fw <= 0 || fh <= 0) {
            this.current[0] = 0;
            this.current[1] = 0;
            this.current[2] = 0;
            this.current[3] = 0;
            return;
        }

        this.current[0] = this.frameX * this.frameWidth;
        this.current[1] = this.frameY * this.frameHeight;
        this.current[2] = this.frameWidth;
        this.current[3] = this.frameHeight;
    }

    destroy() {
        if (this.texture != null) {
            this.texture.destroy(true);
            this.texture = null;
        }
    }
}
