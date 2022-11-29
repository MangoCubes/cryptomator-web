import { InsertDriveFile, CreateNewFolder, EnhancedEncryption } from "@mui/icons-material";
import { Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";

export function AddMenu(props: {
	createVault?: () => void,
	anchor: HTMLElement | null,
	onClose: () => void,
	createFile: () => void,
	createFolder: () => void
}){
	return (
		<Menu
			anchorEl={props.anchor}
        	open={props.anchor !== null}
        	onClose={props.onClose}
		>
			<MenuItem onClick={props.createFile}>
				<ListItemIcon>
					<InsertDriveFile/>
				</ListItemIcon>
				<ListItemText>File</ListItemText>
			</MenuItem>
			<MenuItem onClick={props.createFolder}>
				<ListItemIcon>
					<CreateNewFolder/>
				</ListItemIcon>
				<ListItemText>Folder</ListItemText>
			</MenuItem>
			{
				props.createVault
				&& (
					<MenuItem onClick={props.createVault}>
						<ListItemIcon>
							<EnhancedEncryption/>
						</ListItemIcon>
						<ListItemText>Vault</ListItemText>
					</MenuItem>
				)
			}
		</Menu>
	)
}