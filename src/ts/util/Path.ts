export enum PathMode {
    LINEAR = 'linear',
    EASE_OUT = 'ease_out',
    EASE_IN = 'ease_in',
    EASE_IN_OUT = 'ease_in_out'
}

export interface PathCoordinates {
    x: number,
    y: number
}

export class Path {

    private _from: PathCoordinates;
    private _to: PathCoordinates;
    private tick: number;

    x: number;
    y: number;
    private ticks: number;
    private mode: PathMode;

    private callbacks: ((x: number, y: number, lerp: number) => void)[];

    constructor() {
        this.callbacks = [];
        this.x = 0;
        this.y = 0;
    }

    update(): void {
        if (this._to != null) {

            this.tick++;

            let lerp = this.tick / this.ticks;
            let tickLerpFactor = this.tick / this.ticks;

            if (this.mode == PathMode.EASE_IN) {
                tickLerpFactor = Path.easeIn(lerp);
            } else if (this.mode == PathMode.EASE_OUT) {
                tickLerpFactor = Path.easeOut(lerp);
            } else if (this.mode == PathMode.EASE_IN_OUT) {
                tickLerpFactor = Path.easeInOut(lerp);
            } else if (this.mode === PathMode.LINEAR) {
                tickLerpFactor = lerp;
            }

            this.x = Path.lerp(this._from.x, this._to.x, tickLerpFactor);
            this.y = Path.lerp(this._from.y, this._to.y, tickLerpFactor);

            if (this.callbacks != null) {

                for (let index = 0; index < this.callbacks.length; index++) {
                    this.callbacks[index](this.x, this.y, lerp);
                }
            }

            if (this.tick >= this.ticks) {

                this.x = this._to.x;
                this.y = this._to.y;

                this._from = null;
                this._to = null;
                this.callbacks = null;
                this.mode = null;
                this.tick = 0;
                this.ticks = 0;
            }
        }
    }

    to(
        to: PathCoordinates,
        callbacks: [(x: number, y: number, lerp: number) => void] = null,
        ticks: number = 60,
        mode: PathMode = PathMode.LINEAR
    ): void {
        this._to = to;
        this.callbacks = callbacks;
        this._from = {x: this.x, y: this.y};
        this.tick = 0;
        this.ticks = ticks;
        this.mode = mode;
    }

    private static checkNumber(value: number): void {
        if (value == null || isNaN(value) || !isFinite(value)) {
            throw new Error('Number as NULL, NaN, or Infinite: ' + value);
        }
    }

    public static easeInOut(t: number): number {
        this.checkNumber(t);
        return t > 0.5 ? 4 * Math.pow((t - 1), 3) + 1 : 4 * Math.pow(t, 3);
    }

    public static easeIn(t: number): number {
        this.checkNumber(t);
        return 1.0 - Math.cos(t * Math.PI * 0.5);
    }

    public static easeOut(t: number): number {
        this.checkNumber(t);
        return Math.sin(t * Math.PI * 0.5);
    }

    public static lerp(start: number, stop: number, percent: number): number {
        this.checkNumber(start);
        this.checkNumber(stop);
        this.checkNumber(percent);
        if (start == stop) {
            return start;
        }
        return start + percent * (stop - start);
    }

    public static unlerp(start: number, stop: number, value: number): number {
        this.checkNumber(start);
        this.checkNumber(stop);
        this.checkNumber(value);
        if (value == stop || start == stop) {
            return 1;
        }
        let swap = start > stop;
        if (swap) {
            let temp = start;
            start = stop;
            stop = temp;
        }
        if (swap) {
            return 1.0 - (value - start) / (stop - start);
        } else {
            return (value - start) / (stop - start);
        }
    }
}
