import { Box, AppBar, Toolbar, Typography } from "@mui/material";
import { useState } from "react";
import { WebDAV } from "../../lib/cryptomator/storage-adapters/WebDAV";

export function FileBrowser(props: {client: WebDAV}){

	const [dir, setDir] = useState<string[]>([]);

	return (
		<Box sx={{display: 'flex', flexDirection: 'column', height: '100%', flex: 1}}>
			<AppBar position='static'>
				<Toolbar>
					<Typography variant='h5'>{dir.length === 0 ? 'Root' : dir[dir.length - 1]}</Typography>
				</Toolbar>
			</AppBar>
		</Box>
	)
}