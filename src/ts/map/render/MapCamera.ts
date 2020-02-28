import { UpdatedObject } from '../../util/UpdatedObject';
import { Vector2 } from 'three';
import { KeyListener } from '../../util/KeyListener';
import { LVL } from '../lvl/LVLUtils';

export class MapCamera extends UpdatedObject {

    private position: Vector2;
    private scale: number;
    private upArrowListener: KeyListener;
    private downArrowListener: KeyListener;
    private leftArrowListener: KeyListener;
    private rightArrowListener: KeyListener;

    coordinateMin: number;
    coordinateMax: number;

    bounds: PIXI.Rectangle;
    private shift: boolean;
    private wListener: KeyListener;
    private sListener: KeyListener;
    private aListener: KeyListener;
    private dListener: KeyListener;
    alt: KeyListener;

    /**
     * Main constructor.
     */
    constructor() {

        super();

        this.shift = false;

        this.setRequireDirtyToUpdate(false);

        this.coordinateMin = 0;
        this.coordinateMax = LVL.MAP_LENGTH;

        // Set the initial position to be the center of the map with the default scale.
        this.position = new Vector2(this.coordinateMax / 2, this.coordinateMax / 2);
        this.scale = 1.0;

        this.bounds = new PIXI.Rectangle(0, 0, 0, 0);

        this.upArrowListener = new KeyListener("ArrowUp");
        this.downArrowListener = new KeyListener("ArrowDown");
        this.leftArrowListener = new KeyListener("ArrowLeft");
        this.rightArrowListener = new KeyListener("ArrowRight");

        this.wListener = new KeyListener("w");
        this.sListener = new KeyListener("s");
        this.aListener = new KeyListener("a");
        this.dListener = new KeyListener("d");

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

        new KeyListener("Shift", () => {
            this.shift = true;
        }, null, () => {
            this.shift = false;
        });

        this.alt = new KeyListener('Alt');

        // Make sure anything dependent on the camera being dirty renders on the first
        // render call.
        this.setDirty(true);
    }

    // @Override
    public onUpdate(delta: number): boolean {

        let speed = 1;
        if (this.shift) {
            speed = 2;
        }

        let up = this.upArrowListener.isDown || this.wListener.isDown;
        let down = this.downArrowListener.isDown || this.sListener.isDown;
        let left = this.leftArrowListener.isDown || this.aListener.isDown;
        let right = this.rightArrowListener.isDown || this.dListener.isDown;

        if (up != down) {

            if (up) {
                this.position.y -= speed;
                this.setDirty(true);
            }

            if (down) {
                this.position.y += speed;
                this.setDirty(true);
            }

            if (this.position.y <= this.coordinateMin) {
                this.position.y = this.coordinateMin;
            } else if (this.position.y >= this.coordinateMax) {
                this.position.y = this.coordinateMax;
            }
        }

        if (left != right) {

            if (left) {
                this.position.x -= speed;
                this.setDirty(true);
            }

            if (right) {
                this.position.x += speed;
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
