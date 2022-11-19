import { Download } from "@mui/icons-material";
import { ListItem, ListItemIcon, ListItemText } from "@mui/material";
import { useEffect } from "react";
import { WebDAV } from "../../lib/cryptomator/WebDAV";
import { DownloadItem, Progress, ProgressData } from "../MainScreen";

export function DownloadListItem(props: {item: DownloadItem, client: WebDAV, update: (to: ProgressData) => void}){

	const displayProgress = () => {
		if(props.item.progress === Progress.Queued) return 'Download queued';
		else if(props.item.progress === Progress.Running) return 'Downloading...';
		else return 'Download complete';
	}

	const startDownload = async () => {
		const data = await props.client.readFileString(props.item.item.fullName);
		props.update({
			progress: Progress.Done,
			data: data
		});
		console.log(data);
	}

	useEffect(() => {
		if(props.item.progress === Progress.Queued) {
			props.update({
				progress: Progress.Running
			});
			startDownload();
		}
	}, [])

	return (
		<ListItem>
			<ListItemIcon>
				<Download/>
			</ListItemIcon>
			<ListItemText primary={props.item.item.name} secondary={displayProgress()}/>
		</ListItem>
	)
}