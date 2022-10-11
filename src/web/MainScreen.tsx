import { Box } from "@mui/material";
import { useState } from "react";
import { WebDAV } from "../lib/cryptomator/storage-adapters/WebDAV";
import { FileBrowser } from "./fileBrowser/FileBrowser";
import { Login } from "./Login";
import { Sidebar } from "./sidebar/Sidebar";

export function MainScreen(){
	const [client, setClient] = useState<null | WebDAV>(null);

	if(client){
		return (
			<Box sx={{display: 'flex', width: '100vw', height: '100vh'}}>
				<Sidebar logout={() => setClient(null)}/>
				<FileBrowser client={client}/>
			</Box>
		)
	} else {
		return <Login setClient={setClient}/>
	}
}