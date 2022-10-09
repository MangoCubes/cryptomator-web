import { useState } from "react";
import { WebDAV } from "../cryptomator/storage-adapters/WebDAV";
import { Login } from "./Login";

export function MainScreen(){
	const [client, setClient] = useState<null | WebDAV>(null);

	if(client){
		return (
			<></>
		)
	} else {
		return <Login setClient={setClient}/>
	}
}