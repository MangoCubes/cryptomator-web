import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button, Box } from "@mui/material";
import { FormEvent, useState } from "react";

export function FolderDialog(props: {open: boolean, close: () => void, create: (name: string) => Promise<void>}){

	const [name, setName] = useState('');
	const [error, setError] = useState(false);
	const [querying, setQuerying] = useState(false);

	const onClose = () => {
		if(!querying) {
			props.close();
			setName('');
		}
	}

	const create = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
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
			<Box component='form' onSubmit={create}>
				<DialogTitle>Create new folder</DialogTitle>
				<DialogContent>
					<TextField
						disabled={querying} required variant='standard' label='Name' type='name' value={name} error={error} helperText={error ? 'Cannot create folder. Perhaps you already have a folder with that name?' : ' '} onChange={e => setName(e.currentTarget.value)}/>
				</DialogContent>
				<DialogActions>
					<Button disabled={querying} onClick={props.close}>Cancel</Button>
					<Button type='submit' disabled={name === '' || querying}>Create</Button>
				</DialogActions>
			</Box>
		</Dialog>
	)
}