import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box } from "@mui/material";
import { DirID, ProgressCallback, Vault } from "cryptomator-ts";
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

export type UploadDest = {
	encrypted: false;
	client: WebDAV;
	currentPath: string;
} | {
	encrypted: true;
	vault: Vault;
	id: DirID;
};

export function UploadDialog(props: {
	open: boolean,
	close: () => void,
	uploadDest: UploadDest,
	refresh: () => void
}){

	const [files, setFiles] = useState<FileData[]>([]);
	const [querying, setQuerying] = useState(false);
	const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);

	const onClose = () => {
		if(!querying && files.length === 0) props.close();
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
			if(props.uploadDest.encrypted){
				
			} else {
				const targetDir = props.uploadDest.currentPath.endsWith('/') ? props.uploadDest.currentPath.slice(0, -1) : props.uploadDest.currentPath;
				for(let i = 0; i < files.length; i++){
					const f = files[i];
					await props.uploadDest.client.writeFile(`${targetDir}/${f.name}`, f.data, getUploadCallback(i));
				}
			}
			props.refresh();
			props.close();
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
				if(counter === acceptedFiles.length) {
					const copy = [...files];
					for(let i = 0; i < copy.length; i++){
						for(let j = 0; j < newFiles.length; j++){
							if(copy[i].name === newFiles[j].name){
								copy[i] = newFiles[j];
								newFiles.splice(j, 1);
								break;
							}
						}
					}
					setFiles([...copy, ...newFiles]);
				}
			}
			reader.readAsArrayBuffer(f);
		}
	}, [files]);

	useEffect(() => {
		setFiles([]);
		setUploadProgress(null);
	}, [props.open]);

	const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop});

	return (
		<Dialog open={props.open} onClose={onClose}>
			<DialogTitle>Upload files</DialogTitle>
			<DialogContent sx={{width: '30vw', minHeight: '30vh', flexDirection: 'column', display: 'flex'}}>
				<Box {...getRootProps()} sx={{border: 'dashed', flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					<input {...getInputProps()}/>
					{
						files.length === 0
						? 	<Box>
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