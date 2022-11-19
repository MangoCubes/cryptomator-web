import { Drawer, Toolbar, ListItem, ListItemText, Divider, Box, List } from "@mui/material";
import { DownloadItem, ProgressData } from "../MainScreen";
import { DownloadListItem } from "./DownloadListItem";

export function DownloadProgress(props: {open: boolean, onClose: () => void, downloads: DownloadItem[], update: (index: number, to: ProgressData) => void}){
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
					{props.downloads.map((item, i) => <DownloadListItem item={item} update={(to: ProgressData) => props.update(i, to)}/>)}
				</List>
			</Box>
		</Drawer>
	)
}