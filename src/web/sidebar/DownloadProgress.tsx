import { ClearAll } from "@mui/icons-material";
import { Drawer, Toolbar, ListItem, ListItemText, Divider, Box, List, IconButton, Tooltip } from "@mui/material";
import { ItemPath } from "cryptomator-ts";
import { WebDAV } from "../../lib/cryptomator/WebDAV";
import { ItemDownloader, Progress } from "../ItemDownloader";
import { DownloadListItem } from "./DownloadListItem";

export function DownloadProgress(props: {open: boolean, client: WebDAV, onClose: () => void, downloads: {[path: ItemPath]: ItemDownloader}, clear: () => void}){

	const genList = () => {
		const listItems = [];
		for(const k in props.downloads){
			const item = props.downloads[k as ItemPath];
			listItems.push(<DownloadListItem item={item} key={k}/>);
		}
		return listItems;
	}

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

	return (
		<Drawer anchor='right' open={props.open} onClose={props.onClose}>
			<Toolbar>
				<ListItem secondaryAction={
					<Tooltip title='Clear completed'>
						<span>
							<IconButton edge='end' onClick={props.clear}>
								<ClearAll/>
							</IconButton>
						</span>
					</Tooltip>
				}>
					<ListItemText primary={'All downloads'} secondary={getMessage()}/>
				</ListItem>
			</Toolbar>
			<Divider/>
			<Box sx={{display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden'}}>
				<Box sx={{flex: 1}}/>
				<List sx={{ overflow: 'auto'}}>
					{genList()}
				</List>
			</Box>
		</Drawer>
	)
}