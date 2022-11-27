import { TreeItem } from "@mui/lab";
import { Typography } from "@mui/material";

export function FolderItem(props: {id: string, text: string, inner?: JSX.Element[] | JSX.Element}){
	return (
		<TreeItem nodeId={props.id} key={props.id} label={
			<Typography sx={{
				textOverflow: 'ellipsis',
				whiteSpace: 'nowrap',
				overflow: 'hidden'
			}}>{props.text}</Typography>
		}>
			{props.inner}
		</TreeItem>
	);
}