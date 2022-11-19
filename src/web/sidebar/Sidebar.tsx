import { Download, Lock, Logout } from "@mui/icons-material";
import { Drawer, Toolbar, ListItem, ListItemText, Divider, Box, List, ListItemButton, ListItemIcon, Badge } from "@mui/material";
import { ItemPath, Vault } from "cryptomator-ts";
import { ItemDownloader, Progress } from "../ItemDownloader";

export function Sidebar(props: {logout: () => void, vault: Vault | null, lock: () => void, downloads: {[path: ItemPath]: ItemDownloader}, openDownloads: () => void}){

	const drawer = 240;

	const getMessage = () => {
		let done = 0;
		let inProgress = 0;
		for(const k in props.downloads){
			const item = props.downloads[k as ItemPath];
			if(item.progress.current === Progress.Done) done++;
			else if(item.progress.current === Progress.Running) inProgress++;
		}
		const res = [];
		if(inProgress !== 0) res.push(`${inProgress} in progress`);
		if(done !== 0) res.push(`${done} completed`);
		return res.join(', ');
	}

	const getCount = () => {
		let inProgress = 0;
		for(const k in props.downloads){
			const item = props.downloads[k as ItemPath];
			if(item.progress.current === Progress.Running) inProgress++;
		}
		return inProgress;
	}

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
						<Badge badgeContent={getCount()} color='primary'>
							<Download/>
						</Badge>
					</ListItemIcon>
					<ListItemText primary={'Downloads'} secondary={getMessage()}/>
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