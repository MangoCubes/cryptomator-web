import { ArrowBack, Folder, Article, Refresh, Lock, LockOpen, Key, Download, Delete, MoreVert } from "@mui/icons-material";
import { Box, AppBar, Toolbar, Typography, IconButton, Tooltip, Fab, Zoom, Menu, ListItemIcon, ListItemText, MenuItem } from "@mui/material";
import { GridSelectionModel, DataGrid, GridRowParams, GridRenderCellParams, GridActionsCellItem } from "@mui/x-data-grid";
import { Item, ItemPath, Vault } from "cryptomator-ts";
import { useEffect, useState, useMemo } from "react";
import { WebDAV } from "../../lib/cryptomator/WebDAV";
import { ItemDownloader } from "../ItemDownloader";
import { FileSidebar } from "./FileSidebar";
import { VaultDialog } from "./VaultDialog";

export type DirCache = {[key: string]: {
	child: Item[];
	explored: boolean;
}}

export function FileBrowser(props: {
	client: WebDAV,
	setVault: (vault: Vault) => void,
	download: (item: Item[]) => void,
	logout: () => void,
	downloads: {[path: ItemPath]: ItemDownloader},
	openDownloads: () => void
}){

	const [dir, setDir] = useState<string[]>([]);
	const [items, setItems] = useState<Item[]>([]);
	const [loading, setLoading] = useState(false);
	const [sel, setSel] = useState<GridSelectionModel>([]);
	const [open, setOpen] = useState(false);
	const [querying, setQuerying] = useState(false);
	const [cache, setCache] = useState<DirCache>({'/': {child: [], explored: false}});

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
				if(params.row.type === 'f') def.push(<GridActionsCellItem icon={<Download/>} onClick={() => props.download([params.row.obj])} label='Download' disabled={querying}/>);
				if(params.row.type !== 'parent') def.push(<GridActionsCellItem icon={<Delete/>} label='Delete' onClick={() => onDelete(params.row.obj)} showInMenu disabled={querying}/>);
				return def;
			}
		}
	], [props.download, dir, querying]);
	
	useEffect(() => {
		loadItems(dir);
	}, []);

	const loadItems = async (absDir: string[]) => {
		const temp = [...items];
		try {
			setLoading(true);
			setItems([]);
			const dir = '/' + absDir.join('/');
			const res = await props.client.listItems(dir);
			setItems(res);
			setDir(absDir);
			const copy = {...cache};
			copy[dir] = {
				child: res,
				explored: true
			}
			setCache(copy);
		} catch(e) {
			setItems(temp);
		} finally {
			setLoading(false);
		}
	}

	const loadSubDir = async (subDir: string | null) => {
		if (querying) return;
		if (subDir === null) await loadItems(dir.slice(0, -1));
		else await loadItems([...dir, subDir]);
	}
	
	const delItems = async (item: Item) => {
		if(item.type === 'f') await props.client.removeFile(item.fullName);
		else await props.client.removeDir(item.fullName);
	}

	const getSelectedItems = () => {
		const targets = [];
		for(const item of items) if(sel.includes(item.fullName)) targets.push(item);
		return targets;
	}

	const downloadSelected = () => {
		props.download(getSelectedItems());
	}

	const onDelete = async (item?: Item) => {
		setQuerying(true);
		if(item) await delItems(item);
		else {
			const targets = getSelectedItems();
			const tasks: Promise<void>[] = [];
			for(const t of targets) tasks.push(delItems(t));
			await Promise.all(tasks);
		}
		setQuerying(false);
		await reload();
	}

	const reload = async () => {
		await loadItems(dir);
	}

	const getRows = () => {
		if (loading) return [];
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
			for(const item of items){
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
		for (const i of items){
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
		if(sel.length) return <SelectionToolbar selected={sel.length} del={onDelete} download={downloadSelected} disabled={querying}/>;
		else return (
			<Toolbar>
				<Typography variant='h5'>{dir.length === 0 ? 'Root' : dir[dir.length - 1]}</Typography>
				<Box sx={{flex: 1}}/>
				<Tooltip title='Refresh'>
					<span>
						<IconButton edge='end' onClick={reload} disabled={loading || querying}>
							<Refresh/>
						</IconButton>
					</span>
				</Tooltip>
			</Toolbar>
		);
	}

	return (
		<Box sx={{display: 'flex', width: '100vw', height: '100vh'}}>
			<FileSidebar logout={props.logout} downloads={props.downloads} openDownloads={props.openDownloads} tree={cache} dir={dir} setDir={setDir}/>
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
						loading={loading}
						checkboxSelection
						selectionModel={sel}
						onSelectionModelChange={items => {
							if(!loading) setSel(items);
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