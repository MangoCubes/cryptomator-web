import { Box } from "@mui/material";
import { Item, Vault } from "cryptomator-ts";
import { useState } from "react";
import { WebDAV } from "../lib/cryptomator/WebDAV";
import { FileBrowser } from "./fileBrowser/FileBrowser";
import { Login } from "./Login";
import { Sidebar } from "./sidebar/Sidebar";
import { VaultBrowser } from "./vaultBrowser/VaultBrowser";

export enum Progress {
	Queued,
	Running,
	Decrypting,
	Done
}

type Download = {
	progress: Progress;
	item: Item;
}

export function MainScreen(){

	const [client, setClient] = useState<null | WebDAV>(null);
	const [vault, setVault] = useState<Vault | null>(null);
	const [downloads, setDownloads] = useState<Download[]>([]);

	const startDownload = (item: Item) => {
		setDownloads([...downloads, {
			item: item,
			progress: Progress.Queued
		}]);
	}

	const updateDownload = (index: number, to: Progress) => {
		const original = [...downloads];
		original[index] = {
			...original[index],
			progress: to
		};
		setDownloads(original);
	}

	if(client){
		return (
			<Box sx={{display: 'flex', width: '100vw', height: '100vh'}}>
				<Sidebar logout={() => setClient(null)} vault={vault} lock={() => setVault(null)} downloads={downloads.length}/>
				{
					vault === null
					? <FileBrowser client={client} setVault={setVault} download={startDownload}/>
					: <VaultBrowser client={client} vault={vault} download={startDownload}/>
				}
				
			</Box>
		)
	} else {
		return <Login setClient={setClient}/>
	}
}