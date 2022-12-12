import { CreateNewFolder, EnhancedEncryption } from "@mui/icons-material";
import { Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";

export function AddMenu(props: {
	createVault?: () => void,
	anchor: HTMLElement | null,
	onClose: () => void,
	createFolder: () => void
}){
	const createFolder = () => {
		props.createFolder();
		props.onClose();
	}

	const createVault = () => {
		if(!props.createVault) return;
		props.createVault();
		props.onClose();
	}
	
	return (
		<Menu
			anchorEl={props.anchor}
        	open={props.anchor !== null}
        	onClose={props.onClose}
		>
			<MenuItem onClick={createFolder}>
				<ListItemIcon>
					<CreateNewFolder/>
				</ListItemIcon>
				<ListItemText>Folder</ListItemText>
			</MenuItem>
			{
				props.createVault
				&& (
					<MenuItem onClick={createVault}>
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