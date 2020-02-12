/**
 * The <i>KeyListener</i> class. TODO: Document.
 *
 * @author Jab, kittykatattack
 */
export class KeyListener {

    public readonly value: string;
    public press: () => void;
    public held: () => void;
    public release: () => void;
    public unsubscribe: () => void;
    public isDown: boolean;
    public isUp: boolean;

    private downHandler: (event: KeyboardEvent) => void;
    private upHandler: (event: KeyboardEvent) => void;

    constructor(value: string, press?: () => void, held?: () => void, release?: () => void) {

        this.value = value;
        this.press = press;
        this.held = held;
        this.release = release;
        this.isDown = false;
        this.isUp = true;

        //The `downHandler`
        this.downHandler = event => {
            console.log("key: " + event.key);
            if (event.key == this.value) {
                if (this.isUp) {
                    if (this.press) {
                        this.press();
                    }
                } else {
                    if (this.held) {
                        this.held();
                    }
                }
                this.isDown = true;
                this.isUp = false;
                event.preventDefault();
            }
        };

        //The `upHandler`
        this.upHandler = event => {

            if (event.key == this.value) {
                if (this.isDown && this.release) {
                    this.release();
                }
                this.isDown = false;
                this.isUp = true;
                event.preventDefault();
            }
        };

        // Attach event listeners
        const downListener = this.downHandler.bind(value);
        const upListener = this.upHandler.bind(value);

        window.addEventListener("keydown", downListener, false);
        window.addEventListener("keyup", upListener, false);

        // Detach event listeners
        this.unsubscribe = () => {
            window.removeEventListener("keydown", downListener);
            window.removeEventListener("keyup", upListener);
        };
    }

}
