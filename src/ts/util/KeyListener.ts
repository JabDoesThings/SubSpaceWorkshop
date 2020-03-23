/**
 * The <i>KeyListener</i> class. TODO: Document.
 *
 * @author Jab, kittykatattack
 */
export class KeyListener {

    public readonly value: string;
    private readonly downListener: any;
    private readonly upListener: any;

    press: () => void;
    held: () => void;
    release: () => void;
    isDown: boolean;
    isUp: boolean;

    private downHandler: (event: KeyboardEvent) => void;
    private upHandler: (event: KeyboardEvent) => void;

    constructor(value: string, press?: () => void, held?: () => void, release?: () => void) {

        this.value = value.toLowerCase();
        this.press = press;
        this.held = held;
        this.release = release;
        this.isDown = false;
        this.isUp = true;

        //The `downHandler`
        this.downHandler = event => {
            let key = event.key.toLowerCase();
            if (key == this.value) {
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
            let key = event.key.toLowerCase();
            if (key == this.value) {
                if (this.isDown && this.release) {
                    this.release();
                }
                this.isDown = false;
                this.isUp = true;
                event.preventDefault();
            }
        };

        // Attach event listeners
        this.downListener = this.downHandler.bind(value);
        this.upListener = this.upHandler.bind(value);

        window.addEventListener("keydown", this.downListener, false);
        window.addEventListener("keyup", this.upListener, false);

        // Detach event listeners
        this.unsubscribe = () => {
            window.removeEventListener("keydown", this.downListener);
            window.removeEventListener("keyup", this.upListener);
        };
    }

    unsubscribe(): void {
        window.removeEventListener("keydown", this.downListener);
        window.removeEventListener("keyup", this.upListener);
    }
}
