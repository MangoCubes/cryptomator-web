import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, ListItem, List, ListItemText } from "@mui/material";
import { useCallback, useEffect, useState } from "react"
import { useDropzone } from 'react-dropzone';


type FileData = {
	data: Uint8Array;
	name: string;
}

export function UploadDialog(props: {open: boolean, close: () => void}){

	const [files, setFiles] = useState<FileData[]>([]);
	const [querying, setQuerying] = useState(false);

	const onClose = () => {
		if(querying || files.length !== 0) props.close();
	}

	const upload = () => {

	}

	const onDrop = useCallback((acceptedFiles: File[]) => {
		acceptedFiles.forEach((file) => {
			const reader = new FileReader();
			reader.onloadend = () => {
				const res = reader.result;
				if(!res || typeof(res) === 'string') return;
				setFiles([...files, {data: new Uint8Array(res), name: file.name}]);
			}
			reader.readAsArrayBuffer(file);
		});
	}, []);

	const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop});

	return (
		<Dialog open={props.open} onClose={onClose}>
			<DialogTitle>Upload files</DialogTitle>
			<DialogContent>
				<Box sx={{width: '30vw', height: '30vh'}} {...getRootProps()}>
					<input {...getInputProps()}/>
					{
						files.length === 0
						? <Typography>Select files or drag them here</Typography>
						: <FileList files={files}/>
					}
					
				</Box>
			</DialogContent>
			<DialogActions>
				<Button disabled={querying} onClick={props.close}>Cancel</Button>
				<Button disabled={querying} onClick={upload}>Upload</Button>
			</DialogActions>
		</Dialog>
	);
}

function FileList(props: {files: FileData[]}){
	return (
		<List>
			{
				props.files.map(f => 
					<ListItem key={f.name}>
						<ListItemText primary={f.name} secondary={`${f.data.length} bytes`} />
					</ListItem>
				)
			}
		</List>
	)
}