import { ChevronRight, Download, ExpandMore, Lock } from "@mui/icons-material";
import { TreeItem, TreeView } from "@mui/lab";
import { Badge, Box, Divider, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar } from "@mui/material";
import { DirID, EncryptedDir, EncryptedItem, ItemPath, Vault } from "cryptomator-ts";
import { SyntheticEvent, useState } from "react";
import { DirCache, ExpStatus } from "../../types/types";
import { ItemDownloader, Progress } from "../ItemDownloader";
import { AsyncSidebarItem } from "./AsyncSidebarItem";
import { DirInfo } from "./VaultBrowser";

export function VaultSidebar(props: {
	vault: Vault,
	lock: () => void,
	downloads: {[path: ItemPath]: ItemDownloader},
	openDownloads: () => void,
	tree: DirCache<EncryptedItem>,
	dir: DirInfo[],
	setDir: (dirId: DirInfo[]) => void,
	loadDir: (dirId: DirID) => void
}){

	const drawer = 240;

	const [expanded, setExpanded] = useState<string[]>([]);

	const getMessage = () => {
		let done = 0;
		let inProgress = 0;
		for(const k in props.downloads){
			const item = props.downloads[k as ItemPath];
			if(item.progress.current === Progress.Done) done++;
			else if(item.progress.current === Progress.Running) inProgress++;
		}
		const res = [];
		if(inProgress !== 0) res.push(`${inProgress} in progress`);
		if(done !== 0) res.push(`${done} completed`);
		return res.join(', ');
	}

	const getCount = () => {
		let inProgress = 0;
		for(const k in props.downloads){
			const item = props.downloads[k as ItemPath];
			if(item.progress.current === Progress.Running) inProgress++;
		}
		return inProgress;
	}

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
						<Badge badgeContent={getCount()} color='primary'>
							<Download/>
						</Badge>
					</ListItemIcon>
					<ListItemText primary={'Downloads'} secondary={getMessage()}/>
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