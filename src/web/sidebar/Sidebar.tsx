import { Download, Lock, Logout } from "@mui/icons-material";
import { Drawer, Toolbar, ListItem, ListItemText, Divider, Box, List, ListItemButton, ListItemIcon, Badge } from "@mui/material";
import { Vault } from "cryptomator-ts";

export function Sidebar(props: {logout: () => void, vault: Vault | null, lock: () => void, downloads: number, openDownloads: () => void}){

	const drawer = 240;

	return (
	<Drawer variant='permanent' sx={{ width: drawer }} open={true} anchor='left'>
		<Toolbar sx={{ maxWidth: drawer }}>
			<ListItem>
				<ListItemText primary={props.vault ? props.vault.name : 'No vault selected'}/>
			</ListItem>
		</Toolbar>
		<Divider/>
		<Box sx={{display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden'}}>
			<Box sx={{flex: 1}}/>
			<List sx={{ width: drawer, overflow: 'auto'}}>
				<ListItemButton onClick={props.openDownloads}>
					<ListItemIcon>
						<Badge badgeContent={props.downloads} color='primary'>
							<Download/>
						</Badge>
					</ListItemIcon>
					<ListItemText primary={'Downloads'} secondary={props.downloads === 0 ? '' : `${props.downloads} in progress`}/>
				</ListItemButton>
				<ListItemButton onClick={props.vault ? props.lock : props.logout}>
					<ListItemIcon>
						{props.vault ? <Lock/> : <Logout/>}
					</ListItemIcon>
					<ListItemText primary={props.vault ? 'Close vault' : 'Logout'}/>
				</ListItemButton>
			</List>
		</Box>
	</Drawer>
	)
}