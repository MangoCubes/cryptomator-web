import { Box } from "@mui/material";
import { EncryptedItem, Item, ItemPath, Vault } from "cryptomator-ts";
import { useState } from "react";
import { WebDAV } from "../lib/cryptomator/WebDAV";
import { FileBrowser } from "./fileBrowser/FileBrowser";
import { ItemDownloader, Progress } from "./ItemDownloader";
import { Login } from "./Login";
import { DownloadProgress } from "./sidebar/DownloadProgress";
import { Sidebar } from "./sidebar/Sidebar";
import { VaultBrowser } from "./vaultBrowser/VaultBrowser";

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

	const startDownload = (item: Item) => {
		if(!client) return;
		const copy = {...downloads};
		copy[item.fullName] = new ItemDownloader(item, client, updateDownload);
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
			<Box sx={{display: 'flex', width: '100vw', height: '100vh'}}>
				<Sidebar logout={() => setClient(null)} vault={vault} lock={() => setVault(null)} downloads={downloads} openDownloads={() => setOpen(true)}/>
				{
					vault === null
					? <FileBrowser client={client} setVault={setVault} download={startDownload}/>
					: <VaultBrowser client={client} vault={vault} download={startDownload}/>
				}
				<DownloadProgress open={open} client={client} onClose={() => setOpen(false)} downloads={downloads} clear={clearDownloads}/>
			</Box>
		)
	} else {
		return <Login setClient={setClient}/>
	}
}