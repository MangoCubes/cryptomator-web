import { LinearProgress, List, ListItem, ListItemText, Stack, Typography } from "@mui/material";
import { SingleLine } from "./SingleLine";
import { FileData, UploadProgress, UploadStatus } from "./UploadDialog";

export function FileList(props: {files: FileData[], uploadProgress: UploadProgress | null}){

	const status = (prog: UploadStatus) => {
		if(prog === UploadStatus.Encrypting) return 'Encrypting...';
		else if(prog === UploadStatus.Uploading) return 'Uploading...';
		else if(prog === UploadStatus.Error) return 'Error!';
	}

	const secondary = (index: number, amount: number) => {
		if(props.uploadProgress){
			if(index < props.uploadProgress.index) return <Typography variant='caption'>File uploaded</Typography>;
			else if(index > props.uploadProgress.index) return <Typography variant='caption'>Upload queued</Typography>;
			else {
				if(props.uploadProgress.progress === 100) return <Typography variant='caption'>Finalising...</Typography>;
				else {
					return (
					<>
						<Typography variant='caption'>{status(props.uploadProgress.status)}</Typography>
						<LinearProgress key='prog' variant='determinate' value={props.uploadProgress.progress} />
					</>
					);
				}
			}
		} else {
			let size;
			if(amount < 1000) size = `${amount} B`;
			if(amount < 1000000) size = `${(amount / 1000).toFixed(1)} KB`
			if(amount < 1000000000) size = `${(amount / 1000000).toFixed(1)} MB`;
			else size = `${(amount / 1000000000).toFixed(1)} GB`;
			return <Typography variant='caption'>{size}</Typography>;
		}
	}

	return (
		<List sx={{width: '100%'}}>
			{
				props.files.map((f, i) => 
					<ListItem key={f.name}>
						<Stack sx={{width: '100%'}}>
							<ListItemText primary={<SingleLine>{f.name}</SingleLine>}/>
							{secondary(i, f.data.length)}
						</Stack>
					</ListItem>
				)
			}
		</List>
	);
}