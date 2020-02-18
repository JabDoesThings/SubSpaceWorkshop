import { UpdatedObject } from '../util/UpdatedObject';
import { Vector2 } from 'three';
import { KeyListener } from '../util/KeyListener';
import { LVL } from './lvl/LVLUtils';

export class MapCamera extends UpdatedObject {

    private position: Vector2;
    private scale: number;
    private upArrowListener: KeyListener;
    private downArrowListener: KeyListener;
    private leftArrowListener: KeyListener;
    private rightArrowListener: KeyListener;

    coordinateMin: number;
    coordinateMax: number;

    /**
     * Main constructor.
     */
    constructor() {

        super();

        this.setRequireDirtyToUpdate(false);

        this.coordinateMin = 0;
        this.coordinateMax = LVL.MAP_LENGTH;

        // Set the initial position to be the center of the map with the default scale.
        this.position = new Vector2(this.coordinateMax / 2, this.coordinateMax / 2);
        this.scale = 1.0;

        this.upArrowListener = new KeyListener("ArrowUp");
        this.downArrowListener = new KeyListener("ArrowDown");
        this.leftArrowListener = new KeyListener("ArrowLeft");
        this.rightArrowListener = new KeyListener("ArrowRight");

        new KeyListener("1", () => {
            this.position.x = 0;
            this.position.y = 0;
            this.setDirty(true);
        });

        new KeyListener("2", () => {
            this.position.x = this.coordinateMax;
            this.position.y = 0;
            this.setDirty(true);
        });

        new KeyListener("3", () => {
            this.position.x = 0;
            this.position.y = this.coordinateMax;
            this.setDirty(true);
        });

        new KeyListener("4", () => {
            this.position.x = this.coordinateMax;
            this.position.y = this.coordinateMax;
            this.setDirty(true);
        });

        new KeyListener("5", () => {
            this.position.x = this.coordinateMax / 2;
            this.position.y = this.coordinateMax / 2;
            this.setDirty(true);
        });

        // Make sure anything dependent on the camera being dirty renders on the first
        // render call.
        this.setDirty(true);
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

            if (this.position.y <= this.coordinateMin) {
                this.position.y = this.coordinateMin;
            } else if (this.position.y >= this.coordinateMax) {
                this.position.y = this.coordinateMax;
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

            if (this.position.x <= this.coordinateMin) {
                this.position.x = this.coordinateMin;
            } else if (this.position.x >= this.coordinateMax) {
                this.position.x = this.coordinateMax;
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
