/**
 * The <i>MapUtils</i> class. TODO: Document.
 *
 * @author Jab
 */
export class MapUtils {

    public static readonly MAP_LENGTH: number = 1024;

    /**
     * Tests 'x' and 'y' coordinates to be between the given start and end coordinate ranges.
     *
     * @param x The 'x' coordinate to test.
     * @param y The 'y' coordinate to test.
     * @param startX The minimum 'x' coordinate to pass the test.
     * @param startY The minimum 'y' coordinate to pass the test.
     * @param endX The maximum 'x' coordinate to pass the test.
     * @param endY The maximum 'y' coordinate to pass the test.
     *
     * @throws EvalError Thrown if the 'x' or 'y' coordinate ranges are inverted.
     * @throws RangeError Thrown if the 'x' or 'y' coordinate given falls outside the ranges given.
     */
    public static validateCoordinates(x: number, y: number, startX: number, startY: number, endX: number, endY: number): void {

        // Make sure that the ranges are not inverted.
        MapUtils.validateRanges(startX, startY, endX, endY);

        // First, check the x value.
        if (x < startX || x > endX) {
            throw new RangeError(
                "'x' is out of range. (x can only be between "
                + startX
                + " and "
                + endX + ". "
                + x
                + " given)"
            );
        }

        // Next, check the y value.
        if (y < startY || y > endY) {
            throw new RangeError(
                "'y' is out of range. (y can only be between "
                + startY
                + " and "
                + endY
                + ". "
                + y
                + " given)"
            );
        }

    }

    /**
     * Tests whether or not the starting coordinate is greater than the ending coordinate.
     *
     * @param startX The minimum 'x' coordinate to test.
     * @param startY The minimum 'y' coordinate to test.
     * @param endX The maximum 'x' coordinate to test.
     * @param endY The maximum 'y' coordinate to test.
     *
     * @throws EvalError Thrown if the 'x' or 'y' coordinate ranges are inverted.
     */
    public static validateRanges(startX: number, startY: number, endX: number, endY: number): void {

        if (startX > endX) {
            throw new EvalError("'startX' is greater than 'endX'.");
        } else if (startY > endY) {
            throw new EvalError("'startY' is greater than 'endY'.");
        }

    }

    /**
     * Tests whether or not a tile is a unsigned byte value between 0 and 255.
     * @param value The value to test.
     *
     * @throws RangeError Thrown if the value is less than 0 or greater than 255.
     */
    public static validateTileId(value: number): void {
        if (value < 0 || value > 255) {
            throw new RangeError("The tile-value given is out of range. " +
                "Tile values can only be between 0 and 255. (" + value + " given)");
        }
    }

    /**
     * Tests whether the 'src' range is completely outside of the 'dst' range.
     *
     * @param srcStartX The minimum 'x' coordinate of the 'src' range.
     * @param srcStartY The minimum 'y' coordinate of the 'src' range.
     * @param srcEndX The maximum 'x' coordinate of the 'src' range.
     * @param srcEndY The maximum 'y' coordinate of the 'src' range.
     * @param dstStartX The minimum 'x' coordinate of the 'dst' range.
     * @param dstStartY The minimum 'y' coordinate of the 'dst' range.
     * @param dstEndX The maximum 'x' coordinate of the 'dst' range.
     * @param dstEndY The maximum 'y' coordinate of the 'dst' range.
     *
     * @return Returns 'true' if the 'src' is completely outside of the 'dst' range.
     */
    public static isOutOfRange(
        srcStartX: number, srcStartY: number, srcEndX: number, srcEndY: number,
        dstStartX: number, dstStartY: number, dstEndX: number, dstEndY: number): boolean {
        return srcEndX < dstStartX
            || srcStartX > dstEndX
            || srcEndY < dstStartY
            || srcStartY > dstEndY;
    }

    /**
     * Tests whether the 'x' and 'y' coordinates are contained within the coordinate range.
     *
     * @param x The 'x' coordinate to test.
     * @param y The 'y' coordinate to test.
     * @param startX The minimum 'x' coordinate of the range.
     * @param startY The minimum 'y' coordinate of the range.
     * @param endX The maximum 'x' coordinate of the range.
     * @param endY The maximum 'y' coordinate of the range.
     *
     * @return Returns 'true' if the 'x' and 'y' coordinate are within the range given.
     */
    static contains(x: number, y: number, startX: number, startY: number, endX: number, endY: number) {
        return x >= startX && x <= endX && y >= startY && y <= endY;
    }
}
