/**
 * The <i>Printable</i> class. TODO: Document.
 *
 * @author Jab
 */
export abstract class Printable {

    /**
     * Prints an object to the console.
     *
     * @param prefix The prefix to put behind each line. If not provided, an empty string will take its place.
     */
    public print(prefix: string = ''): void {
        this.onPrint(prefix);
    }

    /**
     * Fired when printing the object.
     *
     * @param prefix Place this in-front of each console for proper indexing when printing.
     */
    protected abstract onPrint(prefix: string): void;
}
