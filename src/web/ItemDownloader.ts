import { Item } from "cryptomator-ts";
import { WebDAV } from "../lib/cryptomator/WebDAV";

export enum Progress{
	Downloading,
	Done
}

type ProgressData = {
	current: Progress.Downloading;
} | {
	current: Progress.Done;
	data: Uint8Array | string;
}

export class ItemDownloader{
	progress: ProgressData
	constructor(public item: Item, public client: WebDAV, public updater: (downloader: ItemDownloader) => void, progress?: ProgressData){
		this.progress = progress ?? { current: Progress.Downloading };
		this.start();
	}

	async start() {
		const data = await this.client.readFileString(this.item.fullName);
		this.updater(new ItemDownloader(this.item, this.client, this.updater, {
			current: Progress.Done,
			data: data
		}));
	}
}