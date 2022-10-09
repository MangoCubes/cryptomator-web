import { Button, Card, CardContent, Stack, TextField, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { useState } from "react";
import { WebDAV } from "../cryptomator/storage-adapters/WebDAV";

export function Login(props: {setClient: (client: WebDAV) => void}){

	const [url, setUrl] = useState('');
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [querying, setQuerying] = useState(false);

	const login = () => {

	}

	return (
		<Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
    		<Card sx={{width: '40%', height: '60%'}}>
				<CardContent sx={{width: '60%', margin: '0 auto'}}>
					<Stack component='form' onSubmit={login} spacing={2}>
						<Typography variant='h5'>Enter WebDAV credentials</Typography>
						<TextField required disabled={querying} variant='standard' label='WebDAV URL' value={url} onChange={(e) => setUrl(e.currentTarget.value)}/>
						<TextField required disabled={querying} variant='standard' label='Username' autoFocus value={username} onChange={(e) => setUsername(e.currentTarget.value)}/>
						<TextField required disabled={querying} variant='standard' label='Password' type='password' value={password} onChange={(e) => setPassword(e.currentTarget.value)}/>
						<Button disabled={querying} type='submit' fullWidth>Connect</Button>
					</Stack>
				</CardContent>
			</Card>
		</Box>
	)
}