import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box } from "@mui/material";
import { ProgressCallback } from "cryptomator-ts";
import { useCallback, useEffect, useState } from "react"
import { useDropzone } from 'react-dropzone';
import { WebDAV } from "../../lib/cryptomator/WebDAV";
import { FileList } from "./FileList";

export type FileData = {
	data: Uint8Array;
	name: string;
}

export type UploadProgress = {
	index: number;
	progress: number;
}

export function UploadDialog(props: {open: boolean, close: () => void, client: WebDAV, currentPath: string}){

	const [files, setFiles] = useState<FileData[]>([]);
	const [querying, setQuerying] = useState(false);
	const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);

	const onClose = () => {
		if(querying || files.length !== 0) props.close();
	}

	const getUploadCallback = (index: number): ProgressCallback => {
		return (current, total) => {
			setUploadProgress({
				index: index,
				progress: Math.floor((current * 100) / total)
			});
		}
	}

	const upload = async () => {
		setQuerying(true);
		try{
			for(let i = 0; i < files.length; i++){
				const f = files[i];
				await props.client.writeFile(`${props.currentPath}${f.name}`, f.data, getUploadCallback(i));
			}
		} catch (e) {
			console.log(e)
		} finally {
			setQuerying(false);
		}
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
				<Box sx={{width: '30vw', minHeight: '30vh', display: 'flex', alignItems: 'stretch', border: 'dashed'}} {...getRootProps()}>
					<input {...getInputProps()}/>
					{
						files.length === 0
						? 	<Box sx={{
								width: '100%',
								textAlign: 'center',
								alignSelf: 'center',
							}}>
								Click here to add files, or drag them here
							</Box>
						: <FileList files={files} uploadProgress={uploadProgress}/>
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