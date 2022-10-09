import { Stack, TextField } from "@mui/material";
import { useEffect, useState } from "react";

export function Nextcloud(props: {setUrl: (url: string) => void}){

	const [url, setUrl] = useState('');
	const [username, setUsername] = useState('');

	useEffect(() => {
		if(url === '' || username === ''){
			props.setUrl('');
			return;
		}
		let stripped: string;
		const match = /https?:\/\/([A-z0-9\.-]+)/.exec(url);
		if (match) stripped = match[1];
		else stripped = url;
		props.setUrl(`https://${stripped}/remote.php/dav/files/${username}/`);
	}, [url, username]);

	return (
		<Stack spacing={1}>
			<TextField required variant='standard' label='Nextcloud URL' value={url} onChange={(e) => setUrl(e.currentTarget.value)}/>
			<TextField required variant='standard' label='Username' value={username} onChange={(e) => setUsername(e.currentTarget.value)}/>
		</Stack>
	);
}