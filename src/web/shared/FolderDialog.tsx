import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button } from "@mui/material";
import { useState, useEffect } from "react";

export function FolderDialog(props: {open: boolean, close: () => void, create: (name: string) => Promise<void>}){

	const [name, setName] = useState('');
	const [error, setError] = useState(false);
	const [querying, setQuerying] = useState(false);

	useEffect(() => {
		return () => setName('');
	}, []);

	const onClose = () => {
		if(!querying) props.close();
	}

	const create = async () => {
		try {
			setQuerying(true);
			await props.create(name);
			props.close();
		} catch (e) {
			setError(true);
		} finally {
			setQuerying(false);
		}
	}

	return (
		<Dialog open={props.open} onClose={onClose}>
			<DialogTitle>Create new folder</DialogTitle>
			<DialogContent>
				<TextField
					disabled={querying} required variant='standard' label='Name' type='name' value={name} error={error} helperText={error ? 'Cannot create folder.' : ' '} onChange={e => setName(e.currentTarget.value)}/>
			</DialogContent>
			<DialogActions>
				<Button disabled={querying} onClick={props.close}>Cancel</Button>
				<Button disabled={name === '' || querying} onClick={create}>Create</Button>
			</DialogActions>
		</Dialog>
	)
}