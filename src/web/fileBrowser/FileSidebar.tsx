import { ChevronRight, Download, ExpandMore, Logout } from "@mui/icons-material";
import { TreeItem, TreeView } from "@mui/lab";
import { Drawer, Toolbar, ListItem, ListItemText, Divider, Box, List, ListItemButton, ListItemIcon, Badge } from "@mui/material";
import { Item, ItemPath } from "cryptomator-ts";
import { SyntheticEvent, useState } from "react";
import { DirCache, ExpStatus } from "../../types/types";
import { SingleLine } from "../shared/SingleLine";

export function FileSidebar(props: {
	logout: () => void,
	downloads: Item[],
	openDownloads: () => void,
	tree: DirCache<Item>,
	dir: string[],
	setDir: (dir: string[]) => void,
	loadDir: (dir: string[]) => void
}){

	const drawer = 240;

	const [expanded, setExpanded] = useState<string[]>([]);

	const getTreeItems = (dirKey: string) => {
		const subDir = props.tree[dirKey];
		if(!subDir){
			return [
				<TreeItem nodeId={dirKey + 'Loading'} key={dirKey + 'Loading'} label={<SingleLine>Loading...</SingleLine>}/>
			];
		}
		if(subDir.explored === ExpStatus.Ready) {
			const dirs = subDir.child.filter(i => i.type === 'd');
			if(dirs.length === 0) return <TreeItem nodeId={dirKey + 'None'} key={dirKey + 'None'} label={<SingleLine>No folders</SingleLine>}/>
			return dirs.map(dir =>
				<TreeItem nodeId={dir.fullName} key={dir.fullName} label={<SingleLine>{dir.name}</SingleLine>}>
					{getTreeItems(dir.fullName)}
				</TreeItem>
			);
		} else if(subDir.explored === ExpStatus.Error) {
			return [
				<TreeItem nodeId={dirKey + 'Error'} key={dirKey + 'Error'} label={<SingleLine>Error loading</SingleLine>}/>
			];
		} else {
			return [
				<TreeItem nodeId={dirKey + 'Loading'} key={dirKey + 'Loading'} label={<SingleLine>Loading...</SingleLine>}/>
			];
		}
	}

	const onNodeToggle = (e: SyntheticEvent, ids: string[]) => {
		setExpanded(ids);
		for(const id of ids){
			if(!props.tree[id] || props.tree[id].explored === ExpStatus.NotStarted){
				const splitted = id.split('/').splice(1);
				props.loadDir(splitted);
			}
		}
	}

	return (
	<Drawer variant='permanent' sx={{ width: drawer }} open={true} anchor='left'>
		<Toolbar sx={{ width: drawer }}>
			<ListItem>
				<ListItemText primary={'No vault selected'}/>
			</ListItem>
		</Toolbar>
		<Divider/>
		<Box sx={{display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden'}}>
			<TreeView
				sx={{flex: 1, maxWidth: drawer, overflow: 'auto'}}
				expanded={expanded}
				onNodeToggle={onNodeToggle}
				defaultCollapseIcon={<ExpandMore/>}
				defaultExpandIcon={<ChevronRight/>}
			>
				{getTreeItems('/')}	
			</TreeView>
			<List sx={{ maxWidth: drawer, overflow: 'auto'}}>
				<ListItemButton onClick={props.openDownloads}>
					<ListItemIcon>
						<Badge badgeContent={props.downloads.length} color='primary'>
							<Download/>
						</Badge>
					</ListItemIcon>
					<ListItemText primary={'Downloads'}/>
				</ListItemButton>
				<ListItemButton onClick={props.logout}>
					<ListItemIcon>
						<Logout/>
					</ListItemIcon>
					<ListItemText primary={'Logout'}/>
				</ListItemButton>
			</List>
		</Box>
	</Drawer>
	)
}