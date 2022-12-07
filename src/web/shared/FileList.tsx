import { List, ListItem, ListItemText, LinearProgress } from "@mui/material";
import { FileData, UploadProgress } from "./UploadDialog";

export function FileList(props: {files: FileData[], uploadProgress: UploadProgress | null}){

	const getSize = (amount: number) => {
		if(amount < 1000) return `${amount} B`;
		if(amount < 1000000) return `${(amount / 1000).toFixed(1)} KB`
		if(amount < 1000000000) return `${(amount / 1000000).toFixed(1)} MB`;
		else return `${(amount / 1000000000).toFixed(1)} GB`;
	}

	return (
		<List>
			{
				props.files.map((f, i) => 
					<ListItem key={f.name}>
						<ListItemText primary={f.name} secondary={getSize(f.data.length)} />
						{props.uploadProgress?.index === i && <LinearProgress variant='determinate' value={props.uploadProgress.progress} />}
					</ListItem>
				)
			}
		</List>
	);
}