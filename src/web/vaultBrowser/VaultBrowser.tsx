import { Refresh } from "@mui/icons-material";
import { Box, AppBar, Toolbar, Typography, Tooltip, IconButton } from "@mui/material";
import { DirID, Vault } from "cryptomator-ts";
import { useState } from "react";
import { WebDAV } from "../../lib/cryptomator/WebDAV";

type VaultDir = {
	name: string;
	id: DirID;
};

export function VaultBrowser(props: {vault: Vault, client: WebDAV}){

	const [dir, setDir] = useState<VaultDir[]>([]);

	return (
		<Box sx={{display: 'flex', flexDirection: 'column', height: '100%', flex: 1}}>
			<AppBar position='static'>
				<Toolbar>
					<Typography variant='h5'></Typography>
					<Box sx={{flex: 1}}/>
					<Tooltip title='Refresh'>
						<span>
							<IconButton edge='end'>
								<Refresh/>
							</IconButton>
						</span>
					</Tooltip>
				</Toolbar>
			</AppBar>
			<Box m={1} sx={{flex: 1}}>
			</Box>
		</Box>
	)
}