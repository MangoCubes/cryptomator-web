import { Download } from "@mui/icons-material";
import { ListItem, ListItemIcon, ListItemText } from "@mui/material";
import { DownloadItem, ProgressData } from "../MainScreen";

export function DownloadListItem(props: {item: DownloadItem, update: (to: ProgressData) => void}){
	return (
		<ListItem>
			<ListItemIcon>
				<Download/>
			</ListItemIcon>
			<ListItemText primary={'Downloads'}/>
		</ListItem>
	)
}