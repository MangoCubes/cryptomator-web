import { DataProvider, EncryptedFile, Item } from "cryptomator-ts";
import { saveAs } from "file-saver";

export enum Progress{
	Running,
	Done
}

type ProgressData = {
	current: Progress.Running;
} | {
	current: Progress.Done;
	data: Uint8Array;
	name: string;
}

export class ItemDownloader{
	progress: ProgressData
	constructor(public item: Item, public client: DataProvider, public updater: (downloader: ItemDownloader) => void, progress?: ProgressData){
		this.progress = progress ?? { current: Progress.Running };
		if (this.progress.current === Progress.Running) this.start();
		else if(this.progress.current === Progress.Done) saveAs(new Blob([this.progress.data]), this.progress.name);
	}

	async start() {
		if (this.item instanceof EncryptedFile) {
			const decrypted = await this.item.decrypt();
			this.updater(new ItemDownloader(this.item, this.client, this.updater, {
				current: Progress.Done,
				data: decrypted.content,
				name: decrypted.title
			}));
		}
		else this.updater(new ItemDownloader(this.item, this.client, this.updater, {
			current: Progress.Done,
			data: await this.client.readFile(this.item.fullName),
			name: this.item.name
		}));
	}
}