import { DataProvider, Item, ItemPath, ProgressCallback } from "cryptomator-ts";

export class OneDrive implements DataProvider {
    accessToken: string
    url: string = "https://graph.microsoft.com/v1.0/me/drive/"

    constructor(accessToken: string){
		this.accessToken = accessToken;
	}

    async readFileString(path: string, progress?: ProgressCallback | undefined): Promise<string> {
		const endpoint = `root:${path}:/content`;
        const req = await fetch(this.url + endpoint, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + this.accessToken
            },
        });
        if(!req.ok) throw new Error(`Request failed: ${req.statusText}`);
        return await req.text();
    }

    async listItems(path: string): Promise<Item[]> {
        const endpoint = (path === "/") ? "root/children" : `root:${path}:/children`;
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
                fullName: item.parentReference.path.split(":")[1] + "/" + item.name as ItemPath,
                lastMod: item.createdDateTime,
                type: item.hasOwnProperty("folder") ? "d" : "f"
            });
        }
        return ret;
    }

    async readFile(path: string, progress?: ProgressCallback | undefined): Promise<Uint8Array> {
        const endpoint = `root:${path}:/content`;
        const req = await fetch(this.url + endpoint, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + this.accessToken
            },
        });
        if(!req.ok) throw new Error(`Request failed: ${req.statusText}`);
        const item = await req.blob();
        return new Uint8Array(await item.arrayBuffer());
    }

    async writeFile(path: string, content: string | Uint8Array, progress?: ProgressCallback | undefined): Promise<void> {
        const endpoint = `root:${path}:/content`;
        const req = await fetch(this.url + endpoint, {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + this.accessToken,
                'Content-Type': typeof(content) === "string" ? "text/plain" : "application/octet-stream"
            },
            body: content
        });
        if(!req.ok) throw new Error(`Request failed: ${req.statusText}`);
    }
    
    async createDir(path: string, recursive?: boolean | undefined): Promise<void> {
        const lastLoc = path.lastIndexOf("/");
        const location = path.slice(0, lastLoc);
        const endpoint = location.length === 0 ? "root/children" : `root:${location}:/children`;
        const req = await fetch(this.url + endpoint, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + this.accessToken,
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                name: path.slice(lastLoc + 1),
                folder: { },
                '@microsoft.graph.conflictBehavior': 'rename'
            })
        });
        if(!req.ok) throw new Error(`Request failed: ${req.statusText}`);
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