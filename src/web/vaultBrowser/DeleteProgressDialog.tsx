import { Dialog, DialogTitle, DialogContent, CircularProgress, DialogContentText } from "@mui/material";

export function DeleteProgressDialog(props: {open: boolean, current: number, total: number}){
	return (
		<Dialog open={props.open}>
			<DialogTitle>Delete in progress...</DialogTitle>
			<DialogContent>
				<CircularProgress variant='determinate' value={Math.floor(props.current * 100 / props.total)}/>
				<DialogContentText>{`Discovering and deleting files... (${props.current} / ${props.total})`}</DialogContentText>
			</DialogContent>
		</Dialog>
	);
}