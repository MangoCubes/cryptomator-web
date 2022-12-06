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
		const newFiles: FileData[] = [];
		let counter = 0;
		for(const f of acceptedFiles){
			const reader = new FileReader();
			reader.onloadend = () => {
				const res = reader.result;
				if(res && typeof(res) !== 'string') newFiles.push({
					name: f.name,
					data: new Uint8Array(res)
				});
				counter++;
				if(counter === acceptedFiles.length) setFiles([...files, ...newFiles]);
			}
			reader.readAsArrayBuffer(f);
		}
	}, [files]);

	useEffect(() => {
		setFiles([]);
	}, [props.open]);

	const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop});

	return (
		<Dialog open={props.open} onClose={onClose}>
			<DialogTitle>Upload files</DialogTitle>
			<DialogContent>
				<Box sx={{width: '30vw', minHeight: '30vh'}} {...getRootProps()}>
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

	const getSize = (amount: number) => {
		if(amount < 1000) return `${amount} B`;
		if(amount < 1000000) return `${(amount / 1000).toFixed(1)} KB`
		if(amount < 1000000000) return `${(amount / 1000000).toFixed(1)} MB`;
		else return `${(amount / 1000000000).toFixed(1)} GB`;
	}

	return (
		<List>
			{
				props.files.map(f => 
					<ListItem key={f.name}>
						<ListItemText primary={f.name} secondary={getSize(f.data.length)} />
					</ListItem>
				)
			}
		</List>
	)
}