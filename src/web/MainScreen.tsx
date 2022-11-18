import { Box } from "@mui/material";
import { Vault } from "cryptomator-ts";
import { useState } from "react";
import { WebDAV } from "../lib/cryptomator/WebDAV";
import { FileBrowser } from "./fileBrowser/FileBrowser";
import { Login } from "./Login";
import { Sidebar } from "./sidebar/Sidebar";
import { VaultBrowser } from "./vaultBrowser/VaultBrowser";

export function MainScreen(){

	const [client, setClient] = useState<null | WebDAV>(null);
	const [vault, setVault] = useState<Vault | null>(null);

	if(client){
		return (
			<Box sx={{display: 'flex', width: '100vw', height: '100vh'}}>
				<Sidebar logout={() => setClient(null)} vault={vault} lock={() => setVault(null)} downloads={0}/>
				{
					vault === null
					? <FileBrowser client={client} setVault={setVault}/>
					: <VaultBrowser client={client} vault={vault}/>
				}
				
			</Box>
		)
	} else {
		return <Login setClient={setClient}/>
	}
}