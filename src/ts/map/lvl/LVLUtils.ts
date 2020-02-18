import * as fs from "fs";
import { LVLMap, LVLTileSet } from './LVL';
import { BufferUtils } from '../../util/BufferUtils';
import { Bitmap } from '../../util/Bitmap';

export class LVL {

    public static DEFAULT_TILESET = LVL.readTilesetImage("assets/media/tiles.bmp");

    public static MAP_LENGTH = 1024;

    public static read(path: string): LVLMap {

        let tileset: LVLTileSet;
        let buffer = fs.readFileSync(path);
        let length = buffer.length;

        // Create blank map tile array.
        let tiles: number[][] = [];
        for (let x = 0; x < 1024; x++) {
            tiles[x] = [];
            for (let y = 0; y < 1024; y++) {
                tiles[x][y] = 0;
            }
        }

        let offset = 0;
        let bm = BufferUtils.readFixedString(buffer, 0, 2);
        if (bm === 'BM') {

            tileset = this.readTileset(buffer);

            // Skip tileset bitmap image.
            offset = buffer.readInt32LE(2);
        } else {
            tileset = LVL.DEFAULT_TILESET;
        }


        let tileCount = 0;

        while (offset <= length - 4) {
            let i = buffer.readInt32LE(offset);
            offset += 4;
            let tile = (i >> 24 & 0x00ff);
            let y = (i >> 12) & 0x03FF;
            let x = i & 0x03FF;
            tiles[x][y] = tile;
            tileCount++;
        }

        return new LVLMap(tileset, tiles);
    }

    static write(map: LVLMap, path: string) {

    }

    public static readTilesetImage(path: string): LVLTileSet {
        let buffer = fs.readFileSync(path);
        return LVL.readTileset(buffer);
    }

    public static readTileset(buffer: Buffer): LVLTileSet {

        let bitmap = new Bitmap(buffer);
        console.log(bitmap);
        let imageData = bitmap.convertToImageData();

        let canvas = document.createElement('canvas');
        canvas.width = 304;
        canvas.height = 160;
        let context = canvas.getContext('2d');

        context.putImageData(imageData, 0, 0);
        return new LVLTileSet(canvas);
    }
}
