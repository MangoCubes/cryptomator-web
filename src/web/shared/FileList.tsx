import { List, ListItem, ListItemText, LinearProgress, Typography, Box } from "@mui/material";
import { FileData, UploadProgress, UploadStatus } from "./UploadDialog";

export function FileList(props: {files: FileData[], uploadProgress: UploadProgress | null}){

	const status = () => {
		if(props.uploadProgress === null) return;
		if(props.uploadProgress.status === UploadStatus.Encrypting) return 'Encrypting...';
		else if(props.uploadProgress.status === UploadStatus.Uploading) return 'Uploading...';
		else if(props.uploadProgress.status === UploadStatus.Error) return 'Error!';
	}

	const secondary = (index: number, amount: number) => {
		if(props.uploadProgress){
			if(index < props.uploadProgress.index) return 'File uploaded';
			else if(index > props.uploadProgress.index) return 'Upload queued';
			else {
				if(props.uploadProgress.progress === 100) return 'Finalising...';
				return (
					<Box>
						<Typography>{status()}</Typography>
						<LinearProgress variant='determinate' value={props.uploadProgress.progress} />
					</Box>
				);
			}
		} else {
			if(amount < 1000) return `${amount} B`;
			if(amount < 1000000) return `${(amount / 1000).toFixed(1)} KB`
			if(amount < 1000000000) return `${(amount / 1000000).toFixed(1)} MB`;
			else return `${(amount / 1000000000).toFixed(1)} GB`;
		}
	}

	return (
		<List>
			{
				props.files.map((f, i) => 
					<ListItem key={f.name}>
						<ListItemText primary={f.name} secondary={secondary(i, f.data.length)} />
					</ListItem>
				)
			}
		</List>
	);
}