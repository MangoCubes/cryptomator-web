import { Dialog, DialogTitle, DialogContent, CircularProgress, DialogContentText } from "@mui/material";

export function DeleteProgressDialog(props: {open: boolean, discovered: number, toDiscover: number}){
	return (
		<Dialog open={props.open}>
			<DialogTitle>Delete in progress...</DialogTitle>
			<DialogContent>
				<CircularProgress/>
				<DialogContentText>{`Finding all files and folders to delete (${props.discovered} searched, ${props.toDiscover} left to search)`}</DialogContentText>
			</DialogContent>
		</Dialog>
	);
}