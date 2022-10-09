import { Dialog, DialogTitle, FormControl, InputLabel, Select, MenuItem, Button, DialogActions, DialogContent, Box } from "@mui/material";
import { useState } from "react";

export function UrlHelperDialog(props: {open: boolean, close: () => void, setUrl: (url: string) => void}){

	const [prov, setProv] = useState('');
	const [url, setUrl] = useState('');

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
			</DialogContent>
			<DialogActions>
					<Button onClick={() => {
						props.setUrl(url);
						props.close();
					}}>Confirm</Button>
					<Button onClick={props.close}>Cancel</Button>
				</DialogActions>
		</Dialog>
	)
}