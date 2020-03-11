
/**
 * The <i>Brush</i> abstract class. TODO: Document.
 *
 * @author Jab
 */
export abstract class Brush {

    private canvas: HTMLCanvasElement;

    protected constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 1024;
        this.canvas.height = 1024;
    }

    abstract onStart(mouse: { x: number, y: number }): void;

    abstract onUpdate(mouse: { x: number, y: number }): void;

    abstract onStop(mouse: { x: number, y: number }): void;
}

/**
 * The <i>PencilBrush</i> class. TODO: Document.
 *
 * @author Jab
 */
export class PencilBrush extends Brush {

    onStart(mouse: { x: number; y: number }): void {
    }

    onUpdate(mouse: { x: number; y: number }): void {
    }

    onStop(mouse: { x: number; y: number }): void {
    }
}
