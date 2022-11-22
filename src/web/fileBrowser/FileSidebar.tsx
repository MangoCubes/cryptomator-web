import { Download, Logout } from "@mui/icons-material";
import { Drawer, Toolbar, ListItem, ListItemText, Divider, Box, List, ListItemButton, ListItemIcon, Badge } from "@mui/material";
import { ItemPath } from "cryptomator-ts";
import { ItemDownloader, Progress } from "../ItemDownloader";
import { DirCache } from "./FileBrowser";

export function FileSidebar(props: {
	logout: () => void,
	downloads: {[path: ItemPath]: ItemDownloader},
	openDownloads: () => void,
	tree: DirCache,
	dir: string[],
	setDir: (dir: string[]) => void
}){

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
				<ListItemText primary={'No vault selected'}/>
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
				<ListItemButton onClick={props.logout}>
					<ListItemIcon>
						<Logout/>
					</ListItemIcon>
					<ListItemText primary={'Logout'}/>
				</ListItemButton>
			</List>
		</Box>
	</Drawer>
	)
}