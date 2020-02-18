export class MapSprite {

    public current: number[];

    private frameWidth: number;
    private frameHeight: number;
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

    public constructor(frameWidth: number, frameHeight: number, framesX: number = 1, framesY: number = 1, frameTime: number = 1, startX: number = null, startY: number = null, endX: number = null, endY: number = null) {

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

        if (this.startX < 0) {
            throw new Error("the value 'startX' is less than 0.");
        } else if (this.startX > this.framesX - 1) {
            throw new Error(
                "The value 'startX' is greater than the last frameX offset. ("
                + (this.framesX - 1)
                + ")"
            );
        }

        if (this.startY < 0) {
            throw new Error("the value 'startY' is less than 0.");
        } else if (this.startY > this.framesY - 1) {
            throw new Error(
                "The value 'startY' is greater than the last frameY offset. ("
                + (this.framesX - 1)
                + ")"
            );
        }

        if (this.endX < 0) {
            throw new Error("the value 'endX' is less than 0.");
        } else if (this.endX > this.framesX - 1) {
            throw new Error(
                "The value 'endX' is greater than the last frameX offset. ("
                + (this.framesX - 1)
                + ")"
            );
        }

        if (this.endY < 0) {
            throw new Error("the value 'endY' is less than 0.");
        } else if (this.endY > this.framesY - 1) {
            throw new Error(
                "The value 'endY' is greater than the last frameY offset. ("
                + (this.framesY - 1)
                + ")"
            );
        }

        this.frameX = this.startX;
        this.frameY = this.startY;
        this.current = [0, 0, 0, 0];

        this.reset();
    }

    public update(): void {

        let now = Date.now();
        if (now - this.last > this.frameTime) {
            this.next();
            // Set the time for the last update.
            this.last = now;
        }
    }

    private next(): void {

        this.frameOffset++;
        this.frameX++;
        if (this.frameX > this.endX) {
            this.frameY++;
            this.frameX = this.startX;
            if (this.frameY > this.endY) {
                this.frameY = this.startY;
                this.frameOffset = 0;
            }
        }

        this.updateCurrent();
    }

    private updateCurrent() {

        this.current[0] = Math.floor(this.frameX * this.frameWidth);
        this.current[1] = Math.floor(this.frameY * this.frameHeight);
        this.current[2] = this.frameHeight;
        this.current[3] = this.frameWidth;

        // console.log(
        //     "x: "
        //     + this.current[0]
        //     + " y: "
        //     + this.current[1]
        //     + " w: "
        //     + this.current[2]
        //     + " h: "
        //     + this.current[3]
        // );
    }

    private reset(): void {
        this.frameOffset = 0;
        this.framesX = this.startX;
        this.framesY = this.startY;

        this.updateCurrent();

        this.last = Date.now();
    }
}
