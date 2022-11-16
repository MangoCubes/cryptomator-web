import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button } from "@mui/material";
import { Vault } from "cryptomator-ts";
import { useEffect, useState } from "react";

export function VaultDialog(props: {open: boolean, close: () => void, decrypt: (password: string) => Promise<Vault>, setVault: (vault: Vault) => void}){

	const [password, setPassword] = useState('');
	const [error, setError] = useState(false);
	const [querying, setQuerying] = useState(false);

	useEffect(() => {
		return () => setPassword('');
	}, []);

	const onClose = () => {
		if(!querying) props.close();
	}

	const decrypt = async () => {
		try {
			setQuerying(true);
			setError(false);
			const vault = await props.decrypt(password);
			props.setVault(vault);
		} catch (e) {
			if(e instanceof DOMException) setError(true);
		} finally {
			setQuerying(false);
		}
	}

	return (
		<Dialog open={props.open} onClose={onClose}>
			<DialogTitle>Decrypt vault</DialogTitle>
			<DialogContent>
				<TextField disabled={querying} required variant='standard' label='Password' type='password' value={password} error={error} helperText={error ? 'Wrong password.' : ' '} onChange={(e) => setPassword(e.currentTarget.value)}/>
			</DialogContent>
			<DialogActions>
				<Button disabled={querying} onClick={props.close}>Cancel</Button>
				<Button disabled={password === '' || querying} onClick={decrypt}>Decrypt</Button>
			</DialogActions>
		</Dialog>
	)
}

//qq11@@11