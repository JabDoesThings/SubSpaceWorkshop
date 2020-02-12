import { Vector2 } from 'three';
import { MapUtils } from './MapUtils';
import { UpdatedObject } from '../util/UpdatedObject';
import { KeyListener } from '../util/KeyListener';

/**
 * The <i>MapCamera</i> class. TODO: Document.
 *
 * @author Jab
 */
export class MapCamera extends UpdatedObject {

    private position: Vector2;
    private scale: number;
    private upArrowListener: KeyListener;
    private downArrowListener: KeyListener;
    private leftArrowListener: KeyListener;
    private rightArrowListener: KeyListener;

    /**
     * Main constructor.
     */
    constructor() {

        super("camera");

        this.setRequireDirtyToUpdate(false);

        let center: number = (MapUtils.MAP_LENGTH) / 2;

        // Set the initial position to be the center of the map with the default scale.
        this.position = new Vector2(center, center);
        this.scale = 1.0;

        this.upArrowListener = new KeyListener("ArrowUp");
        this.downArrowListener = new KeyListener("ArrowDown");
        this.leftArrowListener = new KeyListener("ArrowLeft");
        this.rightArrowListener = new KeyListener("ArrowRight");

    }

    // @Override
    public onUpdate(delta: number): boolean {

        if (this.upArrowListener.isDown != this.downArrowListener.isDown) {

            if (this.upArrowListener.isDown) {
                this.position.y -= 1;
                this.setDirty(true);
            }

            if (this.downArrowListener.isDown) {
                this.position.y += 1;
                this.setDirty(true);
            }

        }

        if (this.leftArrowListener.isDown != this.rightArrowListener.isDown) {

            if (this.leftArrowListener.isDown) {
                this.position.x -= 1;
                this.setDirty(true);
            }

            if (this.rightArrowListener.isDown) {
                this.position.x += 1;
                this.setDirty(true);
            }

        }

        return true;
    }

    /**
     * @Return Returns a copy of the position of the camera.
     * <br><b>NOTE:</b> Modifying this copy will not modify the position of the camera.
     */
    public getPosition(): Vector2 {
        return new Vector2(this.position.x, this.position.y);
    }

    /**
     *
     * @param x The x-coordinate to set.
     * @param y The y-coordinate to set.
     */
    public setPosition(x: number, y: number): void {
        this.position.x = x; // Math.floor(x);
        this.position.y = y; // Math.floor(y);
        this.setDirty(true);
    }

    /**
     * @return Returns the scale of the camera.
     */
    public getScale(): number {
        return this.scale;
    }

    /**
     * Sets the scale of the camera.
     *
     * @param value The value to set.
     */
    public setScale(value: number): void {
        this.scale = value;
        this.setDirty(true);
    }

}
