import { ArrowBack, Folder, Article, Refresh, Lock, LockOpen, Key, Download, Delete, Add, Upload, ContentPaste } from "@mui/icons-material";
import { Box, AppBar, Toolbar, IconButton, Tooltip, Fab, Zoom, Badge } from "@mui/material";
import { GridSelectionModel, DataGrid, GridRowParams, GridRenderCellParams, GridActionsCellItem, GridValueFormatterParams } from "@mui/x-data-grid";
import { Directory, Item, ItemPath, Vault } from "cryptomator-ts";
import { useEffect, useState, useMemo, useRef } from "react";
import { toast } from "react-toastify";
import { WebDAV } from "../../lib/cryptomator/WebDAV";
import { DirCache, ExpStatus } from "../../types/types";
import { ItemDownloader } from "../ItemDownloader";
import { AddMenu } from "../shared/AddMenu";
import { DeleteDialog } from "../shared/DeleteDialog";
import { DirBreadcrumbs } from "../shared/DirBreadcrumbs";
import { FolderDialog } from "../shared/FolderDialog";
import { SelectionToolbar } from "../shared/SelectionToolbar";
import { SingleLine } from "../shared/SingleLine";
import { UploadDialog } from "../shared/UploadDialog";
import { CreateVaultDialog } from "./CreateVaultDialog";
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

enum Dialog {
	None,
	// Dialog that unlocks vault
	Password,
	// Dialog that asks user for folder name
	Folder,
	// Dialog that asks user for password for a new vault
	Vault,
	//Dialog that asks user for confirming delete operation
	DelConfirm,
	// Dialog that asks user for files to upload
	Upload,
}

type Clipboard = {
	items: Item[];
	exclude: string[];
	from: string[];
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
	const [open, setOpen] = useState<Dialog>(Dialog.None);
	const [querying, setQuerying] = useState<Querying>(Querying.None);
	const [menu, setMenu] = useState<null | HTMLElement>(null);
	const [delTargets, setDelTargets] = useState<Item[]>([]);
	const [clipboard, setClipboard] = useState<Clipboard | null>(null);

	/**
	 * To handle multiple queries running asynchronously, the following approach is used:
	 * 1. Whenever a query is done, its result is stored in itemsCache
	 * 2. Whenever itemsCache gets updated, it is copied over to items using setItems
	 * This removes potential conflict and race conditions by making sure there are no two conflicting instances of the items that needs to be written into the state
	 */
	const itemsCache = useRef<DirCache<Item>>({'/': {explored: ExpStatus.NotStarted}});

	const saveItems = (data: DirCache<Item>) => {
		for (const k in data) itemsCache.current[k] = data[k];
		setItems({...itemsCache.current});
	}

	const columns = useMemo(() => [
		{field: 'type', headerName: '', width: 24, renderCell: (params: GridRenderCellParams<string>) => {
			if(params.row.type === 'AAparent') return <ArrowBack/>;
			else if(params.row.name === 'masterkey.cryptomator') return <Key/>;
			else if(params.row.name.endsWith('.c9r')) return <Lock/>;
			else if(params.row.type === 'd') return <Folder/>;
			else return <Article/>;
		}},
		{field: 'name', headerName: 'Name', flex: 3},
		{
			field: 'lastMod',
			headerName: 'Last Modified',
			flex: 4,
			valueFormatter: (params: GridValueFormatterParams<Date>) => params.value?.toLocaleString()
		},
		{
			field: 'actions',
			type: 'actions',
			getActions: (params: GridRowParams) => {
				const def = [];
				if(params.row.type === 'f') def.push(<GridActionsCellItem icon={<Download/>} onClick={() => props.download([params.row.obj])} label='Download' disabled={querying !== Querying.None}/>);
				if(params.row.type !== 'AAparent') def.push(
					<GridActionsCellItem
						icon={<Delete/>}
						label='Delete'
						onClick={() => {
							setDelTargets([params.row.obj]);
							setOpen(Dialog.DelConfirm);
						}}
						showInMenu disabled={querying !== Querying.None}
					/>
				);
				return def;
			}
		}
	], [props.download, querying]);
	
	useEffect(() => {
		setQuerying(Querying.Full);
		loadItems([]).then(() => setQuerying(Querying.None));
	}, []);

	const getDirItems = (absDir?: string[]) => {
		const concated = '/' + (absDir ?? dir).join('/');
		const current = items[concated];
		if(current?.explored === ExpStatus.Ready) return current.child;
		return [];
	}

	const loadItems = async (absDir: string[], bypassCache?: boolean) => {
		const dir = '/' + absDir.join('/');
		const temp = items[dir] ?? {explored: ExpStatus.NotStarted};
		if(temp.explored === ExpStatus.Ready && !bypassCache) return;
		try {
			const update: DirCache<Item> = {};
			const existing = (
				(temp.explored === ExpStatus.Ready || temp.explored === ExpStatus.Querying)
				? temp.child
				: []
			);
			update[dir] = {
				child: existing,
				explored: ExpStatus.Querying
			};
			saveItems(update);
			const res = await props.client.listItems(dir);
			update[dir] = {
				child: res,
				explored: ExpStatus.Ready
			}
			saveItems(update);
		} catch(e) {
			const copy = {...items};
			copy[dir] = {explored: ExpStatus.Error};
		}
	}

	const loadSubDir = async (subDir: string | null) => {
		if (querying !== Querying.None) return;
		setQuerying(Querying.Full);
		let newDir: string[];
		if (subDir === null) newDir = dir.slice(0, -1);
		else newDir = [...dir, subDir];
		await loadItems(newDir);
		setDir(newDir);
		setQuerying(Querying.None);
	}

	const getSelectedItems = () => {
		const targets = [];
		for(const item of getDirItems()) if(sel.includes(item.fullName)) targets.push(item);
		return targets;
	}

	const downloadSelected = () => {
		props.download(getSelectedItems());
	}

	const delItem = async (item: Item) => {
		if(item.type === 'f') await props.client.removeFile(item.fullName);
		else await props.client.removeDir(item.fullName);
	}

	const delSelected = async () => {
		setQuerying(Querying.Partial);
		const tasks: Promise<void>[] = [];
		for(const t of delTargets) tasks.push(delItem(t));
		setOpen(Dialog.None);
		try{
			await Promise.all(tasks);
			toast.success(`Successfully deleted ${delTargets.length} items.`);
			setSel([]);
			await reload();
		} catch (e) {
			toast.error('Failed to delete items.');
		} finally {
			setQuerying(Querying.None);
		}
		
	}

	const reload = async () => {
		setQuerying(Querying.Full);
		await loadItems(dir, true);
		setQuerying(Querying.None);
	}

	const getRows = () => {
		const rows = [];
		if(dir.length){
			rows.push(
				{
					id: 'AAparent',
					name: 'Up one level',
					type: 'AAparent'
				}
			);
		}
		for(const item of getDirItems()){
			rows.push({
				id: item.fullName,
				name: item.name,
				type: item.type,
				obj: item,
				lastMod: item.lastMod
			});
		}
		return rows;
	}

	const onRowClick = (r: GridRowParams) => {
		if(sel.length) return;
		if(r.row.type === 'AAparent') loadSubDir(null);
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

	const moveSelected = async () => {
		if(!clipboard) return;
		setQuerying(Querying.Partial);
		const move = async (file: Item) => {
			const newFileName = `/${dir.join('/')}/${file.name}`;
			await props.client.move(file.fullName, newFileName);
		}
		try {
			await Promise.all(clipboard.items.map(i => move(i)));
			toast.success(`Successfully moved ${clipboard.items.length} items.`);
			loadItems(clipboard.from, true);
			setClipboard(null);
			await reload();
		} catch (e) {
			toast.error('Failed to move items.');
		} finally {
			setQuerying(Querying.None);
		}
	}

	const setMoveTargets = () => {
		const items = getSelectedItems();
		const dirs = items.filter(i => i.type ==='d') as Directory[];
		setClipboard({
			items: items,
			exclude: dirs.map(d => d.fullName),
			from: dir
		});
		setSel([]);
	}

	const canBeMoved = () => {
		const current = '/' + dir.join('/');
		return !clipboard?.exclude.some(d => current.startsWith(d));
	}

	const pasteButton = () => {
		const enabled = canBeMoved();
		let msg;
		if(!clipboard || clipboard.items.length === 0) msg = 'No items selected';
		else if(!enabled) msg = 'Cannot move folders into itself';
		else msg = 'Move to here';
		return (
			<Tooltip title={msg}>
				<span>
					<IconButton onClick={moveSelected} disabled={querying !== Querying.None || !canBeMoved() || !clipboard}>
						<Badge badgeContent={clipboard?.items.length ?? 0} color='primary'>
							<ContentPaste/>
						</Badge>
					</IconButton>
				</span>
			</Tooltip>
		)
	}
	
	const toolbar = () => {
		if(sel.length) return (
			<SelectionToolbar
				selected={sel.length}
				del={() => {
					setDelTargets(getSelectedItems());
					setOpen(Dialog.DelConfirm);
				} }
				download={downloadSelected}
				disabled={querying !== Querying.None}
				disableDownloadOnly={getSelectedItems().some(v => v.type === 'd')}
				clipboard={setMoveTargets}
			/>
		);
		else return (
			<Toolbar>
				<SingleLine variant='h5'>{dir.length === 0 ? 'Root' : dir[dir.length - 1]}</SingleLine>
				<Box sx={{flex: 1}}/>
				<IconButton disabled={querying !== Querying.None} onClick={() => setOpen(Dialog.Upload)}>
					<Upload/>
				</IconButton>
				<IconButton disabled={querying !== Querying.None} onClick={e => setMenu(e.currentTarget)}>
					<Add/>
				</IconButton>
				{pasteButton()}
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

	const createFolder = async (name: string) => {
		await props.client.createDir('/' + [...dir, name].join('/'), false);
		setOpen(Dialog.None);
		await reload();
	}

	return (
		<Box sx={{display: 'flex', width: '100vw', height: '100vh'}}>
			<AddMenu
				anchor={menu}
				onClose={() => setMenu(null)}
				createFolder={() => setOpen(Dialog.Folder)}
				createVault={() => setOpen(Dialog.Vault)}
			/>
			<FileSidebar
				logout={props.logout}
				downloads={props.downloads}
				openDownloads={props.openDownloads}
				tree={items}
				dir={dir}
				setDir={setDir}
				loadDir={loadItems}
			/>
			<CreateVaultDialog open={open === Dialog.Vault} close={() => setOpen(Dialog.None)} dir={dir} client={props.client} setVault={props.setVault}/>
			<FolderDialog open={open === Dialog.Folder} close={() => setOpen(Dialog.None)} create={createFolder}/>
			<DeleteDialog
				open={open === Dialog.DelConfirm}
				close={() => setOpen(Dialog.None)}
				del={delSelected}
				targets={delTargets}
			/>
			<UploadDialog
				open={open === Dialog.Upload}
				close={() => setOpen(Dialog.None)}
				uploadDest={{
					encrypted: false,
					client: props.client,
					currentPath: '/' + dir.join('/')
				}} refresh={reload}
			/>
			<Box sx={{display: 'flex', flexDirection: 'column', height: '100%', flex: 1, minWidth: 0}}>
				<AppBar position='static'>
					{toolbar()}
				</AppBar>
				<DirBreadcrumbs dir={dir} cd={(i) => setDir(dir.slice(0, i))}/>
				<Box m={1} sx={{flex: 1}}>
					<DataGrid
						initialState={{
							sorting: {
								sortModel: [
									{field: 'type', sort: 'asc'},
									{field: 'name', sort: 'desc'}
								],
							}
						}}
						onRowClick={onRowClick}
						disableSelectionOnClick
						isRowSelectable={(params: GridRowParams) => params.row.type !== 'AAparent'}
						columns={columns}
						rows={getRows()}
						loading={querying === Querying.Full}
						checkboxSelection
						selectionModel={sel}
						onSelectionModelChange={items => {
							if(querying === Querying.None) setSel(items);
						}}
					/>
				</Box>
				<Zoom in={showButton()}>
					<Fab onClick={() => setOpen(Dialog.Password)} variant='extended' sx={{position: 'fixed', top: 'auto', left: 'auto', right: 20, bottom: 80}}>
						<LockOpen/>
						Unlock
					</Fab>
				</Zoom>
				<VaultDialog open={open === Dialog.Password} close={() => setOpen(Dialog.None)} dir={dir} client={props.client} setVault={props.setVault}/>
			</Box>
		</Box>
	);
}