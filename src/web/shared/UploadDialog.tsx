import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box } from "@mui/material";
import { useState } from "react"

export function UploadDialog(props: {open: boolean, close: () => void}){

	const [files, setFiles] = useState<FileReader[]>([]);
	const [querying, setQuerying] = useState(false);

	const onClose = () => {
		if(querying || files.length !== 0) props.close();
	}

	const upload = () => {

	}

	const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		
		const r = new FileReader();
		r.readAsArrayBuffer(e.dataTransfer.files[0]);
		r.addEventListener('loadend', () => {
			console.log(r.result)
		})
	}

	return (
		<Dialog open={props.open} onClose={onClose}>
			<DialogTitle>Upload files</DialogTitle>
			<DialogContent>
				<Box sx={{width: '500px', height: '500px'}} onDrop={onDrop} onDragStart={e => console.log(e)} onDragOver={(e) => e.preventDefault()}>

				</Box>
			</DialogContent>
			<DialogActions>
				<Button disabled={querying} onClick={props.close}>Cancel</Button>
				<Button disabled={querying} onClick={upload}>Upload</Button>
			</DialogActions>
		</Dialog>
	)
}