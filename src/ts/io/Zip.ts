import uuid = require('uuid');

const archiver = require('archiver');
const unzipper = require('unzipper');
const fs = require('fs');

/**
 * The <i>Zip</i> class. TODO: Document.
 *
 * @author Jab
 */
export class Zip {

    private readonly content: { [path: string]: Buffer | string };
    processed: boolean = false;

    /**
     * Main constructor.
     */
    constructor() {
        this.content = {};
    }

    /**
     * Reads a Zip file from a path.
     *
     * @param path The path to the file to read.
     * @param onSuccess The method to call when the zip is finished reading.
     * @param onError The method to call when the zip fails to read.
     *
     * @throw Error Thrown if the path given is null or undefined.
     */
    read(path: Buffer | string, onSuccess: (zip: Zip) => void, onError: (e: Error) => void) {

        if (path == null) {
            throw new Error('The path given is null or undefined.');
        }

        if (onSuccess == null) {
            throw new Error('The onSuccess(zip: Zip) function given is null or undefined.');
        }

        if (onError == null) {
            throw new Error('The onError(error: Error) function given is null or undefined.');
        }

        this.clear();
        this.processed = false;

        let execute = async () => {
            try {
                if (typeof path === 'string') {
                    const zip = fs.createReadStream(path).pipe(unzipper.Parse({forceStream: true}));
                    for await (const entry of zip) {
                        if (entry.type === 'Directory') {
                            continue;
                        }
                        let path: string = entry.path;
                        let promise = entry.buffer();
                        promise.then((data: any) => {
                                this.content[path] = data;
                            },
                            (reason: any) => {
                                console.error(reason);
                            });
                    }
                    this.processed = true;
                    if (onSuccess != null) {
                        onSuccess(this);
                    }
                } else {
                    await unzipper.Open.buffer(path).then((zip: any) => {
                        try {
                            let len = zip.files.length - 1;
                            for (let index in zip.files) {
                                let entry = zip.files[index];
                                if (entry.type === 'Directory') {
                                    continue;
                                }
                                let path: string = entry.path;
                                let promise = entry.buffer();
                                promise.then((data: any) => {
                                        this.content[path] = data;
                                        len--;
                                        if (len < 0) {
                                            this.processed = true;
                                            if (onSuccess != null) {
                                                try {
                                                    onSuccess(this);
                                                } catch (e) {
                                                    console.error(e);
                                                }
                                            }
                                        }
                                    },
                                    (reason: any) => {
                                        console.error(reason);
                                    });
                            }
                        } catch (e) {
                            console.error(e);
                        }
                    });
                }
            } catch (e) {
                if (onError != null) {
                    onError(e);
                }
                console.error('Failed to read ZIP file: \'' + path + '\'.');
                console.error(e);
            }
        };

        execute();
    }

    toBuffer(
        properties: { [any: string]: any } = null,
        onSuccess: (buffer: Buffer) => void = null,
        onError: (e: Error) => void = null
    ): void {

        if (properties == null) {
            properties = {zlib: {level: 9}};
        }

        let tempFile = process.env.TEMP + '/' + uuid.v4() + '.zip';

        try {

            let output = fs.createWriteStream(tempFile);
            let archive = archiver('zip', properties);

            archive.on('error', function (error: Error) {
                if (onError != null) {
                    onError(error);
                }
                throw error;
            });

            archive.pipe(output);

            for (let filePath in this.content) {
                let file = this.content[filePath];
                archive.append(file, {name: filePath});
            }

            // listen for all archive data to be written
            // 'close' event is fired only when a file descriptor is involved
            output.on('close', function () {

                console.log(archive);
                console.log(archive.pointer() + ' total bytes');
                console.log('archiver has been finalized and the output file descriptor has closed.');

                let buffer = fs.readFileSync(tempFile);
                fs.unlink(tempFile, () => {
                });

                onSuccess(buffer);
            });

            archive.finalize();

        } catch (e) {

            if (onError != null) {
                onError(e);
            }

            console.error('Failed to write ZIP file: \'' + tempFile + '\'.');
            console.error(e);
        }

    }

    /**
     * Writes a Zip to a file.
     *
     * @param path The path to the file to write.
     * @param properties (Optional) Zip properties.
     * @param onSuccess (Optional) The method to call when the zip is finished writing.
     * @param onError (Optional) The method to call when the zip fails to write.
     *
     * @throw Error Thrown if the path given is null or undefined.
     */
    write(path: string | Buffer, properties: { [any: string]: any } = null, onSuccess: () => void = null, onError: (e: Error) => void = null) {

        if (path == null) {
            throw new Error('The path provided is null or undefined.');
        }

        if (properties == null) {
            properties = {zlib: {level: 9}};
        }

        try {

            let output = fs.createWriteStream(path);
            let archive = archiver('zip', properties);
            archive.pipe(output);
            archive.on('error', function (error: Error) {

                if (onError != null) {
                    onError(error);
                }

                throw error;
            });

            for (let filePath in this.content) {
                let file = this.content[filePath];
                archive.append(file, {name: filePath});
            }

            archive.finalize();

            if (onSuccess != null) {
                onSuccess();
            }

        } catch (e) {

            if (onError != null) {
                onError(e);
            }

            console.error('Failed to write ZIP file: \'' + path + '\'.');
            console.error(e);
        }
    }

    get(path: string): Buffer | string {
        return this.content[path];
    }

    set(path: string, buffer: Buffer | string): void {
        this.content[path] = buffer;
    }

    remove(path: string): Buffer | string {

        let returned = this.content[path];

        this.content[path] = undefined;

        return returned;
    }

    clear(): void {
        for (let id in this.content) {
            this.content[id] = undefined;
        }
    }

    exists(path: string): boolean {
        return this.get(path) != null;
    }

    getContent(): { [path: string]: Buffer | string } {
        return this.content;
    }
}
