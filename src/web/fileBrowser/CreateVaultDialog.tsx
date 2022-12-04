import { Dialog, Box, DialogTitle, DialogContent, TextField, DialogActions, Button, Checkbox, FormControlLabel } from "@mui/material";
import { Vault } from "cryptomator-ts";
import { useState, useEffect, FormEvent } from "react";
import { WebDAV } from "../../lib/cryptomator/WebDAV";


export function CreateVaultDialog(props: {open: boolean, close: () => void, dir: string[], client: WebDAV, setVault: (vault: Vault) => void}){
	const [name, setName] = useState('');
	const [password, setPassword] = useState('');
	const [cvh, setCvh] = useState(false);
	const [error, setError] = useState(false);
	const [querying, setQuerying] = useState(false);

	useEffect(() => {
		setName('');
		setPassword('');
		setError(false);
		setCvh(false);
	}, [props.open])

	const onClose = () => {
		if(!querying) props.close();
	}

	const create = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		try {
			setQuerying(true);
			
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
				<DialogTitle>Create new vault</DialogTitle>
				<DialogContent>
					<TextField
						disabled={querying || cvh}
						variant='standard'
						label='Name'
						value={name}
						error={error}
						helperText={error ? 'Cannot create vault due to duplicate items.' : ' '}
						onChange={e => setName(e.currentTarget.value)}
					/>
					<FormControlLabel control={
						<Checkbox
							checked={cvh}
							onChange={e => setCvh(e.target.checked)}
						/>
					} label='Create vault here' />
					<TextField
						disabled={querying}
						required
						variant='standard'
						label='Password'
						type='password'
						value={password}
						onChange={e => setPassword(e.currentTarget.value)}
					/>
				</DialogContent>
				<DialogActions>
					<Button disabled={querying} onClick={props.close}>Cancel</Button>
					<Button type='submit' disabled={
						querying || password === '' || (!cvh && name === '')
					}>Create</Button>
				</DialogActions>
			</Box>
		</Dialog>
	)
}