import { ChevronRight, Download, ExpandMore, Lock } from "@mui/icons-material";
import { Drawer, Toolbar, ListItem, ListItemText, Divider, Box, List, ListItemButton, ListItemIcon, Badge } from "@mui/material";
import { DirID, EncryptedDir, EncryptedItem, Item, ItemPath, Vault } from "cryptomator-ts";
import { DirCache, ExpStatus } from "../../types/types";
import { DirInfo } from "./VaultBrowser";
import { TreeItem, TreeView } from "@mui/lab";
import { SyntheticEvent, useState } from "react";
import { AsyncSidebarItem } from "./AsyncSidebarItem";

export function VaultSidebar(props: {
	vault: Vault,
	lock: () => void,
	downloads: {[key: ItemPath]: Item},
	openDownloads: () => void,
	tree: DirCache<EncryptedItem>,
	dir: DirInfo[],
	setDir: (dirId: DirInfo[]) => void,
	loadDir: (dirId: DirID) => void
}){

	const drawer = 240;

	const [expanded, setExpanded] = useState<string[]>([]);

	const getTreeItems = () => {
		const subDir = props.tree[''];
		if(!subDir) return [
			<TreeItem nodeId='Loading' key='Loading' label='Loading...'/>
		];
		if(subDir.explored === ExpStatus.Ready) {
			const dirs = subDir.child.filter(i => i.type === 'd') as EncryptedDir[];
			if(dirs.length === 0) return <TreeItem nodeId='None' key='None' label='No folders'/>
			return dirs.map(dir =>
				<AsyncSidebarItem dir={dir} key={dir.fullName} tree={props.tree}/>
			);
		} else if(subDir.explored === ExpStatus.Error) {
			return [
				<TreeItem nodeId='Error' key='Error' label='Error loading'/>
			];
		} else {
			return [
				<TreeItem nodeId='Loading' key='Loading' label='Loading...'/>
			];
		}
	}

	const onNodeToggle = (e: SyntheticEvent, ids: string[]) => {
		setExpanded(ids);
		for(const id of ids){
			if(!props.tree[id] || props.tree[id].explored === ExpStatus.NotStarted) {
				props.loadDir(id as DirID);
			}
		}
	}

	return (
	<Drawer variant='permanent' sx={{ width: drawer }} open={true} anchor='left'>
		<Toolbar sx={{ width: drawer }}>
			<ListItem>
				<ListItemText primary={props.vault.name}/>
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
				{getTreeItems()}	
			</TreeView>
			<List sx={{ maxWidth: drawer, overflow: 'auto'}}>
				<ListItemButton onClick={props.openDownloads}>
					<ListItemIcon>
						<Badge badgeContent={Object.keys(props.downloads).length} color='primary'>
							<Download/>
						</Badge>
					</ListItemIcon>
					<ListItemText primary={'Downloads'}/>
				</ListItemButton>
				<ListItemButton onClick={props.lock}>
					<ListItemIcon>
						<Lock/>
					</ListItemIcon>
					<ListItemText primary={'Close vault'}/>
				</ListItemButton>
			</List>
		</Box>
	</Drawer>
	)
}