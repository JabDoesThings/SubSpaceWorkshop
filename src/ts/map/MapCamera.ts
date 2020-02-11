import { Vector2 } from 'three';

export class MapCamera {

    private position: Vector2;

    private dirty: boolean;

    constructor() {
        this.position = new Vector2(512.0, 512.0);
        this.dirty = false;
    }

    /**
     *
     * @param x The x-coordinate to set. (Can also be a Vector2 to set)
     * @param y The y-coordinate to set.
     */
    public setPosition(x: [number, Vector2], y: number = 0): void {
        if (typeof x === 'number') {
            this.position.x = x;
            this.position.y = y;
            this.dirty = true;
        } else if (x instanceof Vector2) {
            this.position.x = x.x;
            this.position.y = x.y;
            this.dirty = true;
        }
    }

    /**
     * @Return Returns a copy of the position of the camera.
     * <br><b>NOTE:</b> Modifying this copy will not modify the position of the camera.
     */
    public getPosition(): Vector2 {
        return new Vector2(this.position.x, this.position.y);
    }
}
