export class BufferUtils {

    static readFixedString(buffer: Buffer, offset: number, length: number): string {
        let s: string = '';
        for (let index = offset; index < offset + length; index++) {
            s += String.fromCharCode(buffer.readInt8(index));
        }
        return s;
    }

    static writeFixedString(buffer: Buffer, s: string, offset: number): void {
        // Write each character as ascii value.
        for (let index = 0; index < s.length; index++) {
            buffer.writeInt8(s.charCodeAt(index), offset + index);
        }
    }

    static readNullString(buffer: Buffer, offset: number): string {
        let s: string = '';
        let next: number = 0;
        while ((next = buffer.readInt8(offset++)) != 0) {
            s += String.fromCharCode(next);
        }
        return s;
    }

    static writeNullString(s: string, buffer: Buffer, offset: number): void {
        // Write each character as ascii value.
        for (let index = 0; index < s.length; index++) {
            buffer.writeInt8(s.charCodeAt(index), offset + index);
        }
        // Write null-end value.
        buffer.writeInt8(0, offset + s.length);
    }
}
