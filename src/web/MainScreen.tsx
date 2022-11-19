import { Box } from "@mui/material";
import { EncryptedItem, Item, Vault } from "cryptomator-ts";
import { useState } from "react";
import { WebDAV } from "../lib/cryptomator/WebDAV";
import { FileBrowser } from "./fileBrowser/FileBrowser";
import { Login } from "./Login";
import { DownloadProgress } from "./sidebar/DownloadProgress";
import { Sidebar } from "./sidebar/Sidebar";
import { VaultBrowser } from "./vaultBrowser/VaultBrowser";

export enum Progress {
	Queued,
	Running,
	Decrypting,
	Done
}

export type ProgressData = {
	progress: Progress.Queued | Progress.Running;
} | {
	progress: Progress.Decrypting | Progress.Done;
	data: Uint8Array;
}

export type DownloadItem = ProgressData & ({
	item: Item;
} | {
	item: EncryptedItem;
	vault: Vault;
});

export function MainScreen(){

	const [client, setClient] = useState<null | WebDAV>(null);
	const [vault, setVault] = useState<Vault | null>(null);
	const [downloads, setDownloads] = useState<DownloadItem[]>([]);
	const [open, setOpen] = useState(false);

	const startDownload = (item: Item) => {
		setDownloads([...downloads, {
			item: item,
			progress: Progress.Queued
		}]);
	}

	const startEncryptedDownload = (item: EncryptedItem, vault: Vault) => {
		setDownloads([...downloads, {
			item: item,
			progress: Progress.Queued,
			vault: vault
		}]);
	}

	const updateDownload = (index: number, to: ProgressData) => {
		const original = [...downloads];
		original[index] = {
			...original[index],
			...to
		};
		setDownloads(original);
	}

	if(client){
		return (
			<Box sx={{display: 'flex', width: '100vw', height: '100vh'}}>
				<Sidebar logout={() => setClient(null)} vault={vault} lock={() => setVault(null)} downloads={downloads.length} openDownloads={() => setOpen(true)}/>
				{
					vault === null
					? <FileBrowser client={client} setVault={setVault} download={startDownload}/>
					: <VaultBrowser client={client} vault={vault} download={startEncryptedDownload}/>
				}
				<DownloadProgress open={open} onClose={() => setOpen(false)} downloads={downloads} update={updateDownload}/>
			</Box>
		)
	} else {
		return <Login setClient={setClient}/>
	}
}