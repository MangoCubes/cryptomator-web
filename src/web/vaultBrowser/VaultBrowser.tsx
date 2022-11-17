import { Refresh } from "@mui/icons-material";
import { Box, AppBar, Toolbar, Typography, Tooltip, IconButton } from "@mui/material";
import { GridSelectionModel } from "@mui/x-data-grid";
import { DirID, EncryptedItem, Vault } from "cryptomator-ts";
import { useState } from "react";
import { WebDAV } from "../../lib/cryptomator/WebDAV";

type VaultDir = {
	name: string;
	id: DirID;
};

export function VaultBrowser(props: {vault: Vault, client: WebDAV}){

	// dir length should never be 0 since first element is the root folder
	const [dir, setDir] = useState<VaultDir[]>([{
		name: 'Root',
		id: '' as DirID
	}]);
	const [items, setItems] = useState<EncryptedItem[]>([]);
	const [querying, setQuerying] = useState(false);
	const [sel, setSel] = useState<GridSelectionModel>([]);

	const loadItems = async (dirId: DirID) => {
		const temp = [...items];
		try {
			setQuerying(true);
			setItems([]);
			setItems(await props.vault.listItems(dirId));
		} catch(e) {
			setItems(temp);
		} finally {
			setQuerying(false);
		}
	}

	return (
		<Box sx={{display: 'flex', flexDirection: 'column', height: '100%', flex: 1}}>
			<AppBar position='static'>
				<Toolbar>
					<Typography variant='h5'>{`${[props.vault.name]}: ${dir[dir.length - 1]}`}</Typography>
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