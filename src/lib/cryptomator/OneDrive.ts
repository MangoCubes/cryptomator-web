import { DataProvider, Item, ProgressCallback } from "cryptomator-ts";

export class OneDrive implements DataProvider {
    accessToken: string
    url: string = "https://graph.microsoft.com/v1.0/me/drive/"
    constructor(accessToken: string){
		this.accessToken = accessToken;
	}
    async readFileString(path: string, progress?: ProgressCallback | undefined): Promise<string> {
		throw new Error('Not implemented')
    }
    async listItems(path: string): Promise<Item[]> {
        const endpoint = (path === "/") ? "root/children" : `root:${path}:/children`
        const req = await fetch(this.url + endpoint, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + this.accessToken
            },
        });
        if(!req.ok) throw new Error(`Request failed: ${req.statusText}`);
        const items = await req.json();
        const ret: Item[] = [];
        for(const item of items.value){
            ret.push({
                name: item.name,
                fullName: item.parentReference.path.split(":")[1],
                lastMod: item.createdDateTime,
                type: item.hasOwnProperty("folder") ? "d" : "f"
            });
        }
        return ret;
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