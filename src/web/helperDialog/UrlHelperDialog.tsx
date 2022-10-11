import { Dialog, DialogTitle, FormControl, InputLabel, Select, MenuItem, Button, DialogActions, DialogContent, Box, DialogContentText } from "@mui/material";
import { useState } from "react";
import { Nextcloud } from "./Nextcloud";

export function UrlHelperDialog(props: {open: boolean, close: () => void, setUrl: (url: string) => void}){

	const [prov, setProv] = useState('');
	const [url, setUrl] = useState('');

	const getProviderForm = () => {
		let form;
		if (prov === 'Nextcloud') form = <Nextcloud setUrl={setUrl}/>
		else return <></>;
		return (
			<Box mt={2}>
				{form}
				<DialogContentText mt={2}>WebDAV URL: {url}</DialogContentText>
			</Box>
		)
	}

	return (
		<Dialog open={props.open} onClose={props.close}>
			<DialogTitle>Select WebDAV provider</DialogTitle>
			<DialogContent>
				<Box>
					<FormControl variant='standard'>
						<InputLabel>Provider Name</InputLabel>
						<Select
							value={prov}
							onChange={(e) => setProv(e.target.value)}
							sx={{minWidth: 150}}
						>
							<MenuItem value='Nextcloud'>Nextcloud</MenuItem>
						</Select>
					</FormControl>
				</Box>
				{getProviderForm()}
			</DialogContent>
			<DialogActions>
				<Button onClick={props.close}>Cancel</Button>
				<Button disabled={url === ''} onClick={() => {
					props.setUrl(url);
					props.close();
				}}>Confirm</Button>
			</DialogActions>
		</Dialog>
	)
}