import { Help } from "@mui/icons-material";
import { Button, Card, CardContent, FormControl, FormHelperText, IconButton, Input, InputAdornment, InputLabel, Stack, TextField, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { FormEvent, useState } from "react";
import { WebDAV } from "../lib/cryptomator/storage-adapters/WebDAV";
import { UrlHelperDialog } from "./helperDialog/UrlHelperDialog";

enum LoginErr {
	Incorrect,
	Unknown
}

export function Login(props: {setClient: (client: WebDAV) => void}){

	const [url, setUrl] = useState(sessionStorage.getItem('url') ?? '');
	const [username, setUsername] = useState(sessionStorage.getItem('username') ?? '');
	const [password, setPassword] = useState('');
	const [querying, setQuerying] = useState(false);
	const [open, setOpen] = useState(false);
	const [error, setError] = useState<LoginErr | null>(null);

	const login = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setQuerying(true);
		setError(null);
		const client = new WebDAV(url, username, password);
		try {
			await client.list('/'); // Test query
			sessionStorage.setItem('url', url);
			sessionStorage.setItem('username', username);
			props.setClient(client);
		} catch (e) {
			let err = LoginErr.Unknown;
			if(e instanceof Error){
				if((e as Error & {status: number}).status === 401) err = LoginErr.Incorrect;
			}
			setError(err);
			setQuerying(false);
		}
	}

	const getHelperText = () => {
		if(error === LoginErr.Unknown) return 'Cannot connect to server. Check the entered URL, or check CORS policy.';
		else return ' ';
	}

	return (
		<Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
			<Card sx={{width: '40%', height: '60%'}}>
				<CardContent sx={{width: '60%', margin: '0 auto'}}>
					<Stack component='form' onSubmit={login} spacing={2}>
						<Typography variant='h5'>Enter WebDAV credentials</Typography>
						<FormControl variant='standard'>
							<InputLabel required>WebDAV URL</InputLabel>
							<Input
								required
								disabled={querying}
								value={url}
								onChange={(e) => setUrl(e.currentTarget.value)}
								endAdornment={
									<InputAdornment position='end'>
										<IconButton onClick={() => setOpen(true)}><Help/></IconButton>
									</InputAdornment>
								}
								error={error === LoginErr.Unknown}
							/>
							<FormHelperText>{getHelperText()}</FormHelperText>
						</FormControl>
						<TextField required disabled={querying} error={error === LoginErr.Incorrect} variant='standard' label='Username' autoFocus value={username} onChange={(e) => setUsername(e.currentTarget.value)}/>
						<TextField required disabled={querying} error={error === LoginErr.Incorrect} helperText={error === LoginErr.Incorrect ? 'Incorrect username or password.' : ' '} variant='standard' label='Password' type='password' value={password} onChange={(e) => setPassword(e.currentTarget.value)}/>
						<Button disabled={querying} type='submit' fullWidth>Connect</Button>
					</Stack>
				</CardContent>
			</Card>
			<UrlHelperDialog open={open} close={() => setOpen(false)} setUrl={setUrl}/>
		</Box>
	);
}