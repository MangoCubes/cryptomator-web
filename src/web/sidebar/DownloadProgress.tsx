import { Drawer, Toolbar, ListItem, ListItemText, Divider, Box, List } from "@mui/material";
import { Item } from "cryptomator-ts";
import { WebDAV } from "../../lib/cryptomator/WebDAV";
import { ItemDownload } from "./ItemDownload";

export function DownloadProgress(props: {open: boolean, client: WebDAV, onClose: () => void, downloads: Item[]}){

	const genList = () => {
		const listItems = [];
		for(const item of props.downloads) listItems.push(<ItemDownload item={item} key={item.fullName} client={props.client}/>);
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