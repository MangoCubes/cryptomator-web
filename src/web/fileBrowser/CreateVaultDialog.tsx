import { Help } from "@mui/icons-material";
import { Dialog, Box, DialogTitle, DialogContent, TextField, DialogActions, Button, Checkbox, FormControlLabel, DialogContentText, Stack, Tooltip, Typography } from "@mui/material";
import { CreationStep, ExistsError, Vault } from "cryptomator-ts";
import { useState, useEffect, FormEvent } from "react";
import { WebDAV } from "../../lib/cryptomator/WebDAV";


export function CreateVaultDialog(props: {open: boolean, close: () => void, dir: string[], client: WebDAV, setVault: (vault: Vault) => void}){
	const [name, setName] = useState('');
	const [password, setPassword] = useState('');
	const [cvh, setCvh] = useState(false);
	const [error, setError] = useState(false);
	const [status, setStatus] = useState('');
	const [querying, setQuerying] = useState(false);

	useEffect(() => {
		setName('');
		setPassword('');
		setError(false);
		setCvh(false);
		setStatus('');
	}, [props.open])

	const onClose = () => {
		if(!querying) props.close();
	}

	const statusUpdate = (step: CreationStep) => {
		if(step === CreationStep.CreatingFiles) setStatus('Creating vault key files...');
		if(step === CreationStep.CreatingRoot) setStatus('Creating root folder of the vault...');
		if(step === CreationStep.DupeCheck) setStatus('Checking if vault can be created here...');
		if(step === CreationStep.KeyGen) setStatus('Generating keys...');
	}

	const create = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError(false);
		try {
			setQuerying(true);
			const vault = await Vault.create(props.client, '/' + props.dir.join('/'), password, 
				cvh ? {
					name: null,
					createHere: true
				} : {
					name: name
				},
				statusUpdate
			)
			props.setVault(vault);
			props.close();
		} catch (e) {
			if(e instanceof ExistsError) setStatus(`The following items could not be created: ${e.which}`);
			else setStatus('Unknown error.');
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
					<Stack spacing={1}>
						{
							!cvh && <TextField
								disabled={querying || cvh}
								variant='standard'
								label='Name'
								value={name}
								onChange={e => setName(e.currentTarget.value)}
							/>
						}
						<FormControlLabel control={
							<Checkbox
								disabled={querying}
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
						<DialogContentText color={error ? 'error' : undefined}>{status}</DialogContentText>
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