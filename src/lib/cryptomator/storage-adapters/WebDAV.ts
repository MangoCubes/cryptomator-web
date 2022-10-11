import { StorageAdapter, StorageObject } from "../storage-adapter";
import { createClient, FileStat, WebDAVClient } from "webdav";

export class WebDAV implements StorageAdapter{
	client: WebDAVClient;

	constructor(url: string, username: string, password: string){
		this.client = createClient(url, {
			username: username,
			password: password
		});
	}

	async list(prefix: string): Promise<StorageObject[]> {
		const itemList: StorageObject[] = [];
		const res = await this.client.getDirectoryContents(prefix);
		let items: FileStat[];
		if(Array.isArray(res)) items = res;
		else items = res.data;
		for(const item of items){
			itemList.push({
				Key: item.filename,
				Size: item.size,
				LastModified: new Date(item.lastmod)
			});
		}
		return itemList;
	}
	readFile(key: string): Promise<StorageObject> {
		throw new Error("Method not implemented.");
	}
	readFileAsText(key: string): Promise<string> {
		throw new Error("Method not implemented.");
	}
	createDirectory(path: string, dirId: string): Promise<void> {
		throw new Error("Method not implemented.");
	}
	writeFile(path: string, contents: string | Uint8Array | Blob): Promise<void> {
		throw new Error("Method not implemented.");
	}
	delete(path: string): Promise<void> {
		throw new Error("Method not implemented.");
	}
	move(oldPath: string, newPath: string): Promise<void> {
		throw new Error("Method not implemented.");
	}

}