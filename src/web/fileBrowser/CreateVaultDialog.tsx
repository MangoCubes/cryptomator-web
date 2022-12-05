import { Help } from "@mui/icons-material";
import { Dialog, Box, DialogTitle, DialogContent, TextField, DialogActions, Button, Checkbox, FormControlLabel, DialogContentText, Stack, Tooltip, Typography } from "@mui/material";
import { ExistsError, Vault } from "cryptomator-ts";
import { useState, useEffect, FormEvent } from "react";
import { WebDAV } from "../../lib/cryptomator/WebDAV";


export function CreateVaultDialog(props: {open: boolean, close: () => void, dir: string[], client: WebDAV, setVault: (vault: Vault) => void}){
	const [name, setName] = useState('');
	const [password, setPassword] = useState('');
	const [cvh, setCvh] = useState(false);
	const [error, setError] = useState(' ');
	const [querying, setQuerying] = useState(false);

	useEffect(() => {
		setName('');
		setPassword('');
		setError(' ');
		setCvh(false);
	}, [props.open])

	const onClose = () => {
		if(!querying) props.close();
	}

	const create = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError(' ');
		try {
			setQuerying(true);
			const vault = await Vault.create(props.client, '/' + props.dir.join('/'), password, 
				cvh ? {
					name: null,
					createHere: true
				} : {
					name: name
				}
			)
			props.setVault(vault);
			props.close();
		} catch (e) {
			if(e instanceof ExistsError) setError(`The following items could not be created: ${e.which}`);
			else setError('Unknown error.');
		} finally {
			setQuerying(false);
		}
	}

	return (
		<Dialog open={props.open} onClose={onClose}>
			<Box component='form' onSubmit={create}>
				<DialogTitle>Create new vault</DialogTitle>
				<DialogContent>
					<Stack spacing={1}>
						{
							!cvh && <TextField
								disabled={querying || cvh}
								variant='standard'
								label='Name'
								value={name}
								error={error !== ' '}
								helperText={error}
								onChange={e => setName(e.currentTarget.value)}
							/>
						}
						<FormControlLabel control={
							<Checkbox
								checked={cvh}
								onChange={e => setCvh(e.target.checked)}
							/>
						} label={
							<Stack spacing={1} direction='row'>
								<Typography>Create vault here</Typography>
								<Tooltip title='All files that make up Cryptomator vault (.cryptomator files, "d" folder) will be created in the current directory instead of creating a directory, and putting contents in it.'>
									<Help/>
								</Tooltip>
							</Stack>
						} />
						<TextField
							disabled={querying}
							required
							variant='standard'
							label='Password'
							type='password'
							value={password}
							onChange={e => setPassword(e.currentTarget.value)}
						/>
					</Stack>
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