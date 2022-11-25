import { ArrowBack, Folder, Article, Refresh, Lock, LockOpen, Key, Download, Delete, MoreVert } from "@mui/icons-material";
import { Box, AppBar, Toolbar, Typography, IconButton, Tooltip, Fab, Zoom, Menu, ListItemIcon, ListItemText, MenuItem } from "@mui/material";
import { GridSelectionModel, DataGrid, GridRowParams, GridRenderCellParams, GridActionsCellItem } from "@mui/x-data-grid";
import { Item, ItemPath, Vault } from "cryptomator-ts";
import { useEffect, useState, useMemo, useRef } from "react";
import { WebDAV } from "../../lib/cryptomator/WebDAV";
import { DirCache, ExpStatus } from "../../types/types";
import { ItemDownloader } from "../ItemDownloader";
import { FileSidebar } from "./FileSidebar";
import { VaultDialog } from "./VaultDialog";

enum Querying {
	/**
	 * Disable nothing
	 */
	None,
	/**
	 * Show items, but disallow changing dir and interacting with buttons
	 */
	Partial,
	/**
	 * Hide items and show loading icon instead
	 */
	Full
}

export function FileBrowser(props: {
	client: WebDAV,
	setVault: (vault: Vault) => void,
	download: (item: Item[]) => void,
	logout: () => void,
	downloads: {[path: ItemPath]: ItemDownloader},
	openDownloads: () => void
}){

	// Note to self: Uses of path notation through string array should be kept to minimum
	const [dir, setDir] = useState<string[]>([]);

	// setItems should never be used outside saveItems
	const [items, setItems] = useState<DirCache<Item>>({});
	const [sel, setSel] = useState<GridSelectionModel>([]);
	const [open, setOpen] = useState(false);
	const [querying, setQuerying] = useState<Querying>(Querying.None);

	/**
	 * To handle multiple queries running asynchronously, the following approach is used:
	 * 1. Whenever a query is done, its result is stored in itemsCache
	 * 2. Whenever itemsCache gets updated, it is copied over to items using setItems
	 * This removes potential conflict and race conditions by making sure there are no two conflicting instances of the items that needs to be written into the state
	 */
	const itemsCache = useRef<DirCache<Item>>({'/': {child: [], explored: ExpStatus.NotStarted}});

	const saveItems = (data: DirCache<Item>) => {
		for (const k in data) itemsCache.current[k] = data[k];
		setItems({...itemsCache.current});
	}

	const columns = useMemo(() => [
		{field: 'type', headerName: '', width: 24, renderCell: (params: GridRenderCellParams<string>) => {
			if(params.row.type === 'parent') return <ArrowBack/>;
			else if(params.row.name === 'masterkey.cryptomator') return <Key/>;
			else if(params.row.name.endsWith('.c9r')) return <Lock/>;
			else if(params.row.type === 'd') return <Folder/>;
			else return <Article/>;
		}},
		{field: 'name', headerName: 'Name', flex: 3},
		{
			field: 'actions',
			type: 'actions',
			getActions: (params: GridRowParams) => {
				const def = [];
				if(params.row.type === 'f') def.push(<GridActionsCellItem icon={<Download/>} onClick={() => props.download([params.row.obj])} label='Download' disabled={querying !== Querying.None}/>);
				if(params.row.type !== 'parent') def.push(<GridActionsCellItem icon={<Delete/>} label='Delete' onClick={() => onDelete(params.row.obj)} showInMenu disabled={querying !== Querying.None}/>);
				return def;
			}
		}
	], [props.download, dir, querying]);
	
	useEffect(() => {
		loadItems([]);
	}, []);

	const getDirItems = (absDir?: string[]) => {
		const concated = '/' + (absDir ?? dir).join('/');
		return items[concated]?.child ?? [];
	}

	const loadItems = async (absDir: string[], controlBrowser?: boolean, bypassCache?: boolean) => {
		const dir = '/' + absDir.join('/');
		const temp = getDirItems(absDir);
		try {
			if (bypassCache || items[dir]?.explored !== ExpStatus.Ready) {
				if (controlBrowser) setQuerying(Querying.Full);
				const status: DirCache<Item> = {};
				status[dir] = {
					explored: ExpStatus.Querying,
					child: []
				};
				saveItems(status);
				const res = await props.client.listItems(dir);
				const copy: DirCache<Item> = {};
				copy[dir] = {
					child: res,
					explored: ExpStatus.Ready
				}
				for(const r of res){
					if (r.type === 'd') copy[r.fullName] = {
						child: [],
						explored: ExpStatus.NotStarted
					}
				}
				saveItems(copy);
			}
			if (controlBrowser) setDir(absDir);
		} catch(e) {
			const copy = {...items};
			copy[dir] = {
				child: temp,
				explored: ExpStatus.Error
			}
		} finally {
			if (controlBrowser) setQuerying(Querying.None);
		}
	}

	const loadSubDir = async (subDir: string | null) => {
		if (querying !== Querying.None) return;
		if (subDir === null) await loadItems(dir.slice(0, -1), true);
		else await loadItems([...dir, subDir], true);
	}
	
	const delItems = async (item: Item) => {
		if(item.type === 'f') await props.client.removeFile(item.fullName);
		else await props.client.removeDir(item.fullName);
	}

	const getSelectedItems = () => {
		const targets = [];
		for(const item of getDirItems()) if(sel.includes(item.fullName)) targets.push(item);
		return targets;
	}

	const downloadSelected = () => {
		props.download(getSelectedItems());
	}

	const onDelete = async (item?: Item) => {
		setQuerying(Querying.Partial);
		if(item) await delItems(item);
		else {
			const targets = getSelectedItems();
			const tasks: Promise<void>[] = [];
			for(const t of targets) tasks.push(delItems(t));
			await Promise.all(tasks);
		}
		setQuerying(Querying.None);
		await reload();
	}

	const reload = async () => {
		await loadItems(dir, true, true);
	}

	const getRows = () => {
		if (querying === Querying.Full) return [];
		else {
			const rows = [];
			if(dir.length){
				rows.push(
					{
						id: 'parent',
						name: 'Up one level',
						type: 'parent'
					}
				);
			}
			for(const item of getDirItems()){
				rows.push({
					id: item.fullName,
					name: item.name,
					type: item.type,
					obj: item
				});
			}
			return rows;
		}
	}

	const onRowClick = (r: GridRowParams) => {
		if(sel.length) return;
		if(r.row.type === 'parent') loadSubDir(null);
		else if(r.row.type === 'd') loadSubDir(r.row.name);
	}

	const showButton = () => {
		let count = 0;
		for (const i of getDirItems()){
			if(i.type === 'f' && i.name === 'masterkey.cryptomator') count++;
			else if(i.type === 'f' && i.name === 'vault.cryptomator') count++;
			else if(i.type === 'd' && i.name === 'd') count++;
		}
		return count === 3;
	}

	const decrypt = async (password: string) => {
		const vault = await Vault.open(props.client, '/' + dir.join('/'), password, dir[dir.length - 1]);
		return vault;
	}
	
	const toolbar = () => {
		if(sel.length) return <SelectionToolbar selected={sel.length} del={onDelete} download={downloadSelected} disabled={querying !== Querying.None}/>;
		else return (
			<Toolbar>
				<Typography variant='h5'>{dir.length === 0 ? 'Root' : dir[dir.length - 1]}</Typography>
				<Box sx={{flex: 1}}/>
				<Tooltip title='Refresh'>
					<span>
						<IconButton edge='end' onClick={reload} disabled={querying !== Querying.None}>
							<Refresh/>
						</IconButton>
					</span>
				</Tooltip>
			</Toolbar>
		);
	}

	return (
		<Box sx={{display: 'flex', width: '100vw', height: '100vh'}}>
			<FileSidebar
				logout={props.logout}
				downloads={props.downloads}
				openDownloads={props.openDownloads}
				tree={items}
				dir={dir}
				setDir={setDir}
				loadDir={loadItems}
			/>
			<Box sx={{display: 'flex', flexDirection: 'column', height: '100%', flex: 1}}>
				<AppBar position='static'>
					{toolbar()}
				</AppBar>
				<Box m={1} sx={{flex: 1}}>
					<DataGrid
						onRowClick={onRowClick}
						disableSelectionOnClick
						isRowSelectable={(params: GridRowParams) => params.row.type !== 'parent'}
						columns={columns}
						rows={getRows()}
						loading={querying === Querying.Full}
						checkboxSelection
						selectionModel={sel}
						onSelectionModelChange={items => {
							if(querying !== Querying.None) setSel(items);
						}}
					/>
				</Box>
				<Zoom in={showButton()}>
					<Fab onClick={() => setOpen(true)} variant='extended' sx={{position: 'fixed', top: 'auto', left: 'auto', right: 20, bottom: 80}}>
						<LockOpen/>
						Unlock
					</Fab>
				</Zoom>
				<VaultDialog open={open} close={() => setOpen(false)} decrypt={decrypt} setVault={props.setVault}/>
			</Box>
		</Box>
	);
}

function SelectionToolbar(props: {selected: number, del: () => void, download: () => void, disabled: boolean}){

	const [anchor, setAnchor] = useState<null | HTMLElement>(null);

	return (
		<Toolbar>
			<Typography variant='h5'>{`${props.selected} items selected`}</Typography>
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