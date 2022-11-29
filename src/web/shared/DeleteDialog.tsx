import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { Item, EncryptedItemBase } from "cryptomator-ts";
import { useState } from "react";

export function DeleteDialog(props: {open: boolean, close: () => void, del: () => Promise<void>, targets: Item[]}){

	const [querying, setQuerying] = useState(false);

	const onClose = () => {
		if(!querying) props.close();
	}

	const getTitle = () => {
		if(props.targets.length === 1) {
			const item = props.targets[0];
			if(item instanceof EncryptedItemBase) return `Really delete ${item.decryptedName}?`;
			else return `Really delete ${item.name}?`;
		} else {
			let f = 0;
			let d = 0;
			for(const i of props.targets){
				if(i.type === 'f') f++;
				else if(i.type === 'd') d++;
			}
			if(f && d) return `Really delete ${d} directories and ${f} files?`;
			else return `Really delete ${d ? d + ' directories' : f + ' files'}?`;
		}
	}

	const del = () => {
		setQuerying(true);
		props.del();
		setQuerying(false);
	}

	return (
		<Dialog open={props.open} onClose={onClose}>
			<DialogTitle>{getTitle()}</DialogTitle>
			<DialogContent>
				This action is irreversible. {props.targets.some(t => t.type === 'd') && 'Everything in the selected folders will be deleted recursively.'}
			</DialogContent>
			<DialogActions>
				<Button disabled={querying} onClick={props.close}>Cancel</Button>
				<Button disabled={querying} onClick={del} color='error'>Delete</Button>
			</DialogActions>
		</Dialog>
	)
}