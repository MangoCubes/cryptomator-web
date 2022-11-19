import { Download } from "@mui/icons-material";
import { ListItem, ListItemIcon, ListItemText } from "@mui/material";
import { EncryptedFile } from "cryptomator-ts";
import { ItemDownloader, Progress } from "../ItemDownloader";

export function DownloadListItem(props: {item: ItemDownloader}){

	const displayProgress = () => {
		if(props.item.progress.current === Progress.Running) return 'Downloading...';
		else return 'Download complete';
	}

	const name = props.item.item instanceof EncryptedFile ? props.item.item.decryptedName : props.item.item.name;

	return (
		<ListItem>
			<ListItemIcon>
				<Download/>
			</ListItemIcon>
			<ListItemText primary={name} secondary={displayProgress()}/>
		</ListItem>
	)
}