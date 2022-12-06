import { Download } from "@mui/icons-material";
import { ListItem, ListItemIcon, ListItemText } from "@mui/material";
import { Item, EncryptedFile } from "cryptomator-ts";
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