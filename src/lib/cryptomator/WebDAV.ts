import { createClient, FileStat, WebDAVClient } from "webdav";
import { DataProvider, Item, ItemPath } from "cryptomator-ts";
/**
 * \(([^\)]+)\) => ([^;]+);
 * ($1): $2 {
	throw new Error("Not implemented");
}
 */

export class WebDAV implements DataProvider{
	client: WebDAVClient;

	constructor(url: string, username: string, password: string){
		this.client = createClient(url, {
			username: username,
			password: password
		});
	}
	async readFileString(path: string): Promise<string> {
		let res = await this.client.getFileContents(path);
		if(typeof(res) !== 'string' && 'data' in res) res = res.data;
		if(typeof(res) === 'string') return res;
		else {
			let ab: Uint8Array;
			if(res instanceof ArrayBuffer) ab = new Uint8Array(res);
			else ab = res;
			return new TextDecoder().decode(ab);
		}
	}

	async listStat(path: string): Promise<FileStat[]>{
		const res = await this.client.getDirectoryContents(path);
		if(Array.isArray(res)) return res;
		else return res.data;
	}
	async listItems(path: string): Promise<Item[]> {
		const items = await this.listStat(path);
		const itemList: Item[] = [];
		for(const item of items){
			itemList.push({
				name: item.basename,
				fullName: item.filename as ItemPath,
				lastMod: new Date(item.lastmod),
				type: item.type[0] as 'f' | 'd'
			});
		}
		return itemList;
	}
	async readFile(path: string): Promise<Uint8Array> {
		let res = await this.client.getFileContents(path);
		if(typeof(res) !== 'string' && 'data' in res) res = res.data;
		if(typeof(res) === 'string') return new TextEncoder().encode(res)
		else {
			if(res instanceof ArrayBuffer) return new Uint8Array(res);
			return res;
		}
	}
	writeFile(path: string, content: string | Uint8Array): Promise<void> {
		throw new Error("Not implemented");
	}
	createDir(path: string, recursive?: boolean | undefined): Promise<void> {
		throw new Error("Not implemented");
	}
	removeFile(path: string): Promise<void> {
		throw new Error("Not implemented");
	}
	removeDir(path: string): Promise<void> {
		throw new Error("Not implemented");
	}
}