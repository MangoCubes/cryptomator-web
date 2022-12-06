import { Download } from "@mui/icons-material";
import { ListItem, ListItemIcon, ListItemText } from "@mui/material";
import { Item, EncryptedFile, ProgressCallback } from "cryptomator-ts";
import saveAs from "file-saver";
import { useEffect, useState } from "react";
import { WebDAV } from "../../lib/cryptomator/WebDAV";

enum Step{
	Starting,
	Running,
	Decrypting,
	Done
}

type Progress = {
	step: Step.Running | Step.Decrypting;
	current: number;
	total: number;
} | {
	step: Step.Done | Step.Starting;
}

/**
 * Note:
 * Add cleanup function that cancels download
 */

export function ItemDownload(props: {item: Item, client: WebDAV}){

	const [prog, setProg] = useState<Progress>({
		step: Step.Starting
	});

	const downloadCallback: ProgressCallback = (c, t) => setProg({
		step: Step.Running,
		current: c,
		total: t
	});

	const decryptionCallback: ProgressCallback = (c, t) => setProg({
		step: Step.Decrypting,
		current: c,
		total: t
	});

	const startLoad = async () => {
		if (props.item instanceof EncryptedFile) {
			const decrypted = await props.item.decrypt({
				download: downloadCallback,
				decrypt: decryptionCallback
			});
			saveAs(new Blob([decrypted.content]), decrypted.title);
		}
		else {
			const data = await props.client.readFile(props.item.fullName, downloadCallback);
			saveAs(new Blob([data]), props.item.name);
		}
	}

	useEffect(() => {
		startLoad();
	}, [])

	const getMessage = () => {
		if(prog.step === Step.Decrypting) return 'Decrypting...';
		if(prog.step === Step.Done) return 'File downloaded.';
		if(prog.step === Step.Running) return 'Downloading...';
		if(prog.step === Step.Starting) return 'Fetching file details...';
	}

	return (
		<ListItem>
			<ListItemIcon>
				<Download/>
			</ListItemIcon>
			<ListItemText
				primary={
					props.item instanceof EncryptedFile
					? props.item.decryptedName
					: props.item.name
				}
				secondary={getMessage()}
			/>
		</ListItem>
	)
}