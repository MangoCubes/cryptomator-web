import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button } from "@mui/material";
import { useEffect, useState } from "react";

export function VaultDialog(props: {open: boolean, close: () => void, decrypt: (password: string) => void}){

	const [password, setPassword] = useState('');

	useEffect(() => {
		return () => setPassword('');
	}, []);

	return (
		<Dialog open={props.open} onClose={props.close}>
			<DialogTitle>Decrypt vault</DialogTitle>
			<DialogContent>
				<TextField required variant='standard' label='Password' type='password' value={password} onChange={(e) => setPassword(e.currentTarget.value)}/>
			</DialogContent>
			<DialogActions>
				<Button onClick={props.close}>Cancel</Button>
				<Button disabled={password === ''} onClick={() => props.decrypt(password)}>Decrypt</Button>
			</DialogActions>
		</Dialog>
	)
}