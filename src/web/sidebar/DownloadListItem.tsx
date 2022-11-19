import { Download } from "@mui/icons-material";
import { ListItem, ListItemIcon, ListItemText } from "@mui/material";
import { ItemDownloader, Progress } from "../ItemDownloader";

export function DownloadListItem(props: {item: ItemDownloader}){

	const displayProgress = () => {
		if(props.item.progress.current === Progress.Queued) return 'Download queued';
		else if(props.item.progress.current === Progress.Running) return 'Downloading...';
		else {
			console.log(props.item.progress.data)
			return 'Download complete';
		}
	}

	return (
		<ListItem>
			<ListItemIcon>
				<Download/>
			</ListItemIcon>
			<ListItemText primary={props.item.item.name} secondary={displayProgress()}/>
		</ListItem>
	)
}