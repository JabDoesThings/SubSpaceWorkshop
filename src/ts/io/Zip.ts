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
     * @param onSuccess (Optional) The method to call when the zip is finished reading.
     * @param onError (Optional) The method to call when the zip fails to read.
     *
     * @throw Error Thrown if the path given is null or undefined.
     */
    read(path: Buffer | string, onSuccess: (zip: Zip) => void = null, onError: (e: Error) => void = null) {

        if (path == null) {
            throw new Error('The path provided is null or undefined.');
        }

        this.clear();

        let execute = async () => {
            try {
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

                if (onSuccess != null) {
                    onSuccess(this);
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
