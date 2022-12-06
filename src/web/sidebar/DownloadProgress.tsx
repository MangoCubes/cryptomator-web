import { Drawer, Toolbar, ListItem, ListItemText, Divider, Box, List } from "@mui/material";
import { Item, ItemPath } from "cryptomator-ts";
import { WebDAV } from "../../lib/cryptomator/WebDAV";
import { ItemDownload } from "./ItemDownload";

export function DownloadProgress(props: {open: boolean, client: WebDAV, onClose: () => void, downloads: {[key: ItemPath]: Item}}){

	const genList = () => {
		const listItems = [];
		for(const k in props.downloads) listItems.push(<ItemDownload item={props.downloads[k as ItemPath]} key={k} client={props.client}/>);
		return listItems;
	}

	return (
		<Drawer anchor='right' open={props.open} onClose={props.onClose}>
			<Toolbar>
				<ListItem>
					<ListItemText primary={'All downloads'}/>
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