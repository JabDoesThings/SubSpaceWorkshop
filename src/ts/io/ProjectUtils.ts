import { Project } from '../simple/Project';
import { Layer } from '../simple/layers/Layer';
import { TileData } from '../util/map/TileData';
import { Bitmap } from './Bitmap';

const archiver = require('archiver');
const fs = require('fs');

export class ProjectUtils {

    static read(path: string): Project {

        if (path == null) {
            throw new Error('The path provided is null or undefined.');
        }

        return;
    }

    static write(project: Project, path: string = null): void {

        if (project == null) {
            throw new Error('The project given is null or undefined.');
        }

        if (path == null) {
            path = project.path;
        }

        if (path == null) {
            throw new Error('The path provided and the path in the project'
                + ' given are null or undefined.');
        }

        let json = ProjectUtils.writeProjectJSON(project);

        let files: { [name: string]: Buffer } = {};

        // Compile the tileset.
        if (project.tileset != null) {
            try {
                let source = project.editor.renderer.toCanvas(project.tileset.texture);
                files['tileset.bmp'] = Bitmap.toBuffer(source, project.tileset.bitCount);
            } catch (e) {
                console.error("Failed to write project tileset to buffer.");
                console.error(e);
            }
        }

        // Compile the layers.
        let layers = project.layers.layers;
        if (layers.length !== 0) {
            for (let index = 0; index < layers.length; index++) {
                let next = layers[index];
                let data = next.tiles;
                if (data != null && data.getTileCount() !== 0) {
                    let id = next.getId() + '.tiledata';
                    try {
                        files[id] = ProjectUtils.writeTileData(data);
                    } catch (e) {
                        console.error('Failed to compile TILEDATA: ' + id);
                        console.error(e);
                    }
                }
            }
        }

        let output = fs.createWriteStream(path);
        let archive = archiver('zip', {zlib: {level: 9}});

        // good practice to catch this error explicitly
        archive.on('error', function (error: Error) {
            throw error;
        });

        archive.pipe(output);

        archive.append(JSON.stringify(json, null, 2), {
            name: 'project.json'
        });

        for (let name in files) {
            let file: Buffer = files[name];
            archive.append(file, {
                name: name
            });
        }

        archive.finalize();
    }

    static readTileData(buffer: Buffer): TileData {

        let offset = 0;

        let header = '';
        header += String.fromCharCode(buffer.readUInt8(offset++));
        header += String.fromCharCode(buffer.readUInt8(offset++));
        header += String.fromCharCode(buffer.readUInt8(offset++));
        header += String.fromCharCode(buffer.readUInt8(offset++));

        if (header !== 'STIL') {
            throw new Error('The TILEDATA buffer given is not a valid buffer.'
                + ' (Invalid header)');
        }

        let width = buffer.readUInt16LE(offset);
        offset += 2;

        if (width > 1024) {
            throw new Error('The width of the TILEDATA buffer is too big.'
                + ' (max: 1024, given: ' + width + ')');
        } else if (width < 0) {
            throw new Error('The width of the TILEDATA buffer is too small.'
                + ' (min: 1, given: ' + width + ')');
        }

        let height = buffer.readUInt16LE(offset);
        offset += 2;

        if (height > 1024) {
            throw new Error('The height of the TILEDATA buffer is too big.'
                + ' (max: 1024, given: ' + height + ')');
        } else if (height < 0) {
            throw new Error('The height of the TILEDATA buffer is too small.'
                + ' (min: 1, given: ' + height + ')');
        }

        let count = buffer.readUInt16LE(offset);
        offset += 2;

        // Make sure that the count is not negative.
        if (count < 0) {
            throw new Error('The tile-count of the TILEDATA buffer is negative.');
        }

        // Construct the expanded array to populate with tile data.
        let data: number[][] = [];
        for (let x = 0; x < width; x++) {
            data[x] = [];
            for (let y = 0; y < height; y++) {
                data[x][y] = 0;
            }
        }

        // If the TILEDATA is not empty, populate the data array.
        if (count !== 0) {

            for (let index = 0; index < count; index++) {

                let value = buffer.readUInt32LE(offset);
                offset += 4;

                let x = value & 0x03FF;
                let y = value >> 12 & 0x03FF;
                data[x][y] = value >> 24 & 0x00ff;
            }
        }

        return new TileData(data);
    }

    static writeTileData(data: TileData): Buffer {

        interface Tile {
            x: number,
            y: number,
            id: number
        }

        let tiles: Tile[] = [];

        // Go through and flatten the raw array into non-zero-based tile
        //   profiles.
        for (let y = 0; y < data.height; y++) {
            for (let x = 0; x < data.width; x++) {
                let next = data.tiles[x][y];
                if (next !== 0) {
                    tiles.push({x: x, y: y, id: next});
                }
            }
        }

        // (Header) + (Number of tiles) + (Tiles)
        let buffer = Buffer.alloc(12 + (tiles.length * 4));
        let offset = 0;

        // Write the header.
        buffer.writeUInt8('S'.charCodeAt(0), offset++);
        buffer.writeUInt8('T'.charCodeAt(0), offset++);
        buffer.writeUInt8('I'.charCodeAt(0), offset++);
        buffer.writeUInt8('L'.charCodeAt(0), offset++);

        // Width of TileData.
        buffer.writeUInt16LE(data.width, offset);
        offset += 2;
        // Height of TileData.
        buffer.writeUInt16LE(data.height, offset);
        offset += 2;
        // Tile-Count of TileData.
        buffer.writeUInt32LE(tiles.length, offset);
        offset += 4;

        // Go through all tile profiles, convert them to values and store them in
        //   in the buffer.
        for (let index = 0; index < tiles.length; index++) {

            // Format the next tile to be stored in the buffer.
            let next = tiles[index];
            let int = ((next.id & 0x00ff) << 24) | ((next.y & 0x03FF) << 12) | (next.x & 0x03FF);

            // Write the next tile as a integer value.
            buffer.writeInt32LE(int, offset);
            offset += 4;
        }

        return buffer;
    }

    private static parseProjectJSON(json: string): { [id: string]: any } {

        if (json == null) {
            throw new Error('The JSON given is null or undefined.');
        }

        return JSON.parse(json);
    }

    private static writeProjectJSON(project: Project): { [id: string]: any } {

        if (project == null) {
            throw new Error('The project given is null or undefined.');
        }

        let object: { [id: string]: any } = {};
        object.name = project._name;
        object.layers = {};

        let layers = project.layers.layers;
        for (let index = 0; index < layers.length; index++) {
            let next = layers[index];
            let id = next.getId();
            object.layers[id] = ProjectUtils.writeLayerJSON(next);
        }

        object.metadata = project.getMetadataTable();

        return object;
    }

    private static writeLayerJSON(layer: Layer): { [id: string]: any } {

        let object: { [id: string]: any } = {};

        object.name = layer.getName();
        object.visible = layer.isVisible();
        object.locked = layer.isLocked();

        let tileCount = layer.tiles.getTileCount();
        if (tileCount !== 0) {
            object.tiledata = layer.getId() + '.tiledata';
        }

        object.metadata = layer.getMetadataTable();

        return object;
    }

}
