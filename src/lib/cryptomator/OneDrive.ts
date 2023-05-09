import { DataProvider, Item, ProgressCallback } from "cryptomator-ts";

/**
 * Looks like onedrive-api lacks typing. Damn.
 */
const oneDriveAPI = require("onedrive-api");

export class OneDrive implements DataProvider {
    accessToken: string
    constructor(accessToken: string){
		this.accessToken = accessToken;
	}
    async readFileString(path: string, progress?: ProgressCallback | undefined): Promise<string> {
        const res: ReadableStream = await oneDriveAPI.items.download({
            accessToken: this.accessToken,
            itemPath: path
        });
		if(typeof(res) === 'string') return res;
		throw new Error('Not implemented')
    }
    async listItems(path: string): Promise<Item[]> {
        throw new Error('Not implemented')
    }
    async readFile(path: string, progress?: ProgressCallback | undefined): Promise<Uint8Array> {
        throw new Error('Not implemented')
    }
    async writeFile(path: string, content: string | Uint8Array, progress?: ProgressCallback | undefined): Promise<void> {
        throw new Error('Not implemented')
    }
    async createDir(path: string, recursive?: boolean | undefined): Promise<void> {
        
    }
    async removeFile(path: string): Promise<void> {
        
    }
    async removeDir(path: string): Promise<void> {
        
    }
    async exists(path: string): Promise<boolean> {
        throw new Error('Not implemented')
    }
    async rename(path: string, newPath: string): Promise<void> {
        
    }
    async move(path: string, newPath: string): Promise<void> {
        
    }
}