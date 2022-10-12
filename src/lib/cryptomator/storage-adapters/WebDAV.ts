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
		const items = await this.listItems(prefix);
		const itemList: StorageObject[] = [];
		for(const item of items){
			itemList.push({
				key: item.filename,
				size: item.size,
				lastModified: new Date(item.lastmod)
			});
		}
		return itemList;
	}

	async listItems(prefix: string): Promise<FileStat[]>{
		const res = await this.client.getDirectoryContents(prefix);
		if(Array.isArray(res)) return res;
		else return res.data;
	}

	async readFile(key: string): Promise<StorageObject> {
		let res = await this.client.getFileContents(key);
		if(typeof(res) !== 'string' && 'data' in res) res = res.data;
		if(typeof(res) === 'string'){
			return {
				key: key,
				data: new TextEncoder().encode(res)
			};
		} else {
			let ab: Uint8Array;
			if(res instanceof ArrayBuffer) ab = new Uint8Array(res);
			else ab = res;
			return {
				key: key,
				data: ab
			};
		}
	}

	async readFileAsText(key: string): Promise<string> {
		let res = await this.client.getFileContents(key);
		if(typeof(res) !== 'string' && 'data' in res) res = res.data;
		if(typeof(res) === 'string') return res;
		else {
			let ab: Uint8Array;
			if(res instanceof ArrayBuffer) ab = new Uint8Array(res);
			else ab = res;
			return new TextDecoder().decode(ab);
		}
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