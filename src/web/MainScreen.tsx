import { Item, ItemPath, Vault } from "cryptomator-ts";
import { useState } from "react";
import { WebDAV } from "../lib/cryptomator/WebDAV";
import { FileBrowser } from "./fileBrowser/FileBrowser";
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
	const [downloads, setDownloads] = useState<{[key: ItemPath]: Item}>({});
	const [open, setOpen] = useState(false);

	const startDownload = (items: Item[]) => {
		const copy = {...downloads};
		for(const i of items) copy[i.fullName] = i;
		setDownloads(copy);
	}

	if(client){
		return (
			<>
				{
					vault === null
					? <FileBrowser client={client} logout={() => setClient(null)} setVault={setVault} download={startDownload} downloads={downloads} openDownloads={() => setOpen(true)}/>
					: <VaultBrowser client={client} lock={() => setVault(null)} vault={vault} download={startDownload} downloads={downloads} openDownloads={() => setOpen(true)}/>
				}
				<DownloadProgress open={open} client={client} onClose={() => setOpen(false)} downloads={downloads}/>
			</>
		)
	} else {
		return <Login setClient={setClient}/>
	}
}