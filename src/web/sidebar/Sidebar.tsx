import { Logout } from "@mui/icons-material";
import { Drawer, Toolbar, ListItem, ListItemText, Divider, Box, List, ListItemButton, ListItemIcon } from "@mui/material";

export function Sidebar(props: {logout: () => void}){

	const drawer = 240;

	return (
	<Drawer variant='permanent' sx={{ width: drawer }} open={true} anchor='left'>
		<Toolbar sx={{ maxWidth: drawer }}>
			<ListItem>
				<ListItemText primary='No vault selected'/>
			</ListItem>
		</Toolbar>
		<Divider/>
		<Box sx={{display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden'}}>
			<Box sx={{flex: 1}}/>
			<List sx={{ width: drawer, overflow: 'auto'}}>
				<ListItemButton onClick={props.logout}>
					<ListItemIcon>
						<Logout/>
					</ListItemIcon>
					<ListItemText primary='Logout'/>
				</ListItemButton>
			</List>
		</Box>
	</Drawer>
	)
}