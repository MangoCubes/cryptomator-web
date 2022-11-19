import { Drawer, Toolbar, ListItem, ListItemText, Divider, Box, List } from "@mui/material";
import { ItemPath } from "cryptomator-ts";
import { WebDAV } from "../../lib/cryptomator/WebDAV";
import { ItemDownloader } from "../ItemDownloader";
import { DownloadListItem } from "./DownloadListItem";

export function DownloadProgress(props: {open: boolean, client: WebDAV, onClose: () => void, downloads: {[path: ItemPath]: ItemDownloader}}){

	const genList = () => {
		const listItems = [];
		for(const k in props.downloads){
			const item = props.downloads[k as ItemPath];
			listItems.push(<DownloadListItem item={item} key={k}/>);
		}
		return listItems;
	}

	return (
		<Drawer anchor='right' open={props.open} onClose={props.onClose}>
			<Toolbar>
				<ListItem>
					<ListItemText primary={'Downloads'}/>
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