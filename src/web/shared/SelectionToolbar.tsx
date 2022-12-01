import { Download, MoreVert, Delete } from "@mui/icons-material";
import { Toolbar, Box, Tooltip, IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import { useState } from "react";
import { SingleLine } from "./SingleLine";

export function SelectionToolbar(props: {selected: number, del: () => void, download: () => void, disabled: boolean}){

	const [anchor, setAnchor] = useState<null | HTMLElement>(null);

	return (
		<Toolbar>
			<SingleLine variant='h5'>{`${props.selected} items selected`}</SingleLine>
			<Box sx={{flex: 1}}/>
			<Tooltip title='Download selected'>
				<span>
					<IconButton onClick={props.download} disabled={props.disabled}>
						<Download/>
					</IconButton>
				</span>
			</Tooltip>
			<IconButton onClick={(e) => setAnchor(e.currentTarget)} disabled={props.disabled}>
				<MoreVert/>
			</IconButton>
			<Menu anchorEl={anchor} open={anchor !== null} onClose={() => setAnchor(null)}>
				<MenuItem onClick={() => props.del()}>
					<ListItemIcon>
						<Delete/>
					</ListItemIcon>
					<ListItemText>Delete selected</ListItemText>
				</MenuItem>
			</Menu>
		</Toolbar>
	)
}