import { Item, ItemPath, Vault } from "cryptomator-ts";
import { useState } from "react";
import { WebDAV } from "../lib/cryptomator/WebDAV";
import { FileBrowser } from "./fileBrowser/FileBrowser";
import { ItemDownloader, Progress } from "./ItemDownloader";
import { Login } from "./Login";
import { DownloadProgress } from "./sidebar/DownloadProgress";
import { VaultBrowser } from "./vaultBrowser/VaultBrowser";

/**
 * Each browser needs a sidebar because each handles fetching directory differently
 * 1. Add caching directories
 * 2. Add state that holds tree structure
 * 3. Create tree based on that structure
 */

export function MainScreen(){

	const [client, setClient] = useState<null | WebDAV>(null);
	const [vault, setVault] = useState<Vault | null>(null);
	const [downloads, setDownloads] = useState<{[path: ItemPath]: ItemDownloader}>({});
	const [open, setOpen] = useState(false);

	const updateDownload = (dl: ItemDownloader) => {
		const copy = {...downloads};
		copy[dl.item.fullName] = dl;
		setDownloads(copy);
	}

	const startDownload = (items: Item[]) => {
		if(!client) return;
		const copy = {...downloads};
		for(const item of items) copy[item.fullName] = new ItemDownloader(item, client, updateDownload);
		setDownloads(copy);
	}

	const clearDownloads = () => {
		const newMap: {[path: ItemPath]: ItemDownloader} = {};
		for(const k in downloads){
			const item = downloads[k as ItemPath];
			if(item.progress.current !== Progress.Done) newMap[item.item.fullName] = item;
		}
		setDownloads(newMap);
	}

	if(client){
		return (
			<>
				{
					vault === null
					? <FileBrowser client={client} logout={() => setClient(null)} setVault={setVault} download={startDownload} downloads={downloads} openDownloads={() => setOpen(true)}/>
					: <VaultBrowser client={client} lock={() => setVault(null)} vault={vault} download={startDownload} downloads={downloads} openDownloads={() => setOpen(true)}/>
				}
				<DownloadProgress open={open} client={client} onClose={() => setOpen(false)} downloads={downloads} clear={clearDownloads}/>
			</>
		)
	} else {
		return <Login setClient={setClient}/>
	}
}