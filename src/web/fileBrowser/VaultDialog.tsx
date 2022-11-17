import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button } from "@mui/material";
import { DecryptionError, Vault } from "cryptomator-ts";
import { ChangeEvent, useEffect, useState } from "react";

export function VaultDialog(props: {open: boolean, close: () => void, decrypt: (password: string) => Promise<Vault>, setVault: (vault: Vault) => void}){

	const [password, setPassword] = useState('');
	const [error, setError] = useState(false);
	const [querying, setQuerying] = useState(false);
	const [help, setHelp] = useState(' ');

	useEffect(() => {
		return () => setPassword('');
	}, []);

	const onClose = () => {
		if(!querying) {
			setHelp(' ');
			setPassword('');
			setError(false);
			props.close();
		}
	}

	const decrypt = async () => {
		try {
			setQuerying(true);
			setError(false);
			setHelp('Decrypting...');
			const vault = await props.decrypt(password);
			props.setVault(vault);
		} catch (e) {
			if(e instanceof DecryptionError) {
				setError(true);
				setHelp('Wrong password.');
			}
		} finally {
			setQuerying(false);
		}
	}

	const onChange = (e: ChangeEvent<HTMLInputElement>) => {
		setPassword(e.currentTarget.value);
		setHelp(' ');
	}

	return (
		<Dialog open={props.open} onClose={onClose}>
			<DialogTitle>Decrypt vault</DialogTitle>
			<DialogContent>
				<TextField disabled={querying} required variant='standard' label='Password' type='password' value={password} error={error} helperText={help} onChange={onChange}/>
			</DialogContent>
			<DialogActions>
				<Button disabled={querying} onClick={props.close}>Cancel</Button>
				<Button disabled={password === '' || querying} onClick={decrypt}>Decrypt</Button>
			</DialogActions>
		</Dialog>
	)
}