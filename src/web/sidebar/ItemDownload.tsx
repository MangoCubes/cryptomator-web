import { Download } from "@mui/icons-material";
import { ListItem, ListItemIcon, ListItemText } from "@mui/material";
import { Item, EncryptedFile } from "cryptomator-ts";
import { useState } from "react";
import { WebDAV } from "../../lib/cryptomator/WebDAV";

export enum Progress{
	Running,
	Done
}

export function ItemDownload(props: {item: Item, client: WebDAV}){

	const [prog, setProg] = useState<Progress>(Progress.Running);

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
				secondary={
					prog === Progress.Running
					? 'Downloading...'
					: 'Download complete'
				}
			/>
		</ListItem>
	)
}