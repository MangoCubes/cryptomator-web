import { Download } from "@mui/icons-material";
import { Drawer, Toolbar, ListItem, ListItemText, Divider, Box, List, ListItemIcon } from "@mui/material";

export function DownloadProgress(props: {open: boolean, onClose: () => void}){
	return (
		<Drawer anchor='right' open={props.open} onClose={props.onClose}>
			<Toolbar>
				<ListItem>
					<ListItemText primary={'Downloads'}/>
				</ListItem>
			</Toolbar>
			<Divider/>
			<Box sx={{display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden'}}>
				<Box sx={{flex: 1}}/>
				<List sx={{ overflow: 'auto'}}>
					<ListItem>
						<ListItemIcon>
							<Download/>
						</ListItemIcon>
						<ListItemText primary={'Downloads'}/>
					</ListItem>
				</List>
			</Box>
		</Drawer>
	)
}