import { Add, ArrowBack, Article, ContentPaste, Delete, Download, Folder, Refresh, Upload } from "@mui/icons-material";
import { Box, AppBar, Toolbar, Tooltip, IconButton, Stack, CircularProgress, Typography, Backdrop } from "@mui/material";
import { DataGrid, GridActionsCellItem, GridRenderCellParams, GridRowParams, GridSelectionModel, GridValueFormatterParams } from "@mui/x-data-grid";
import { DirID, EncryptedDir, EncryptedItem, ItemPath, ProgressCallback, Vault } from "cryptomator-ts";
import { useEffect, useMemo, useRef, useState } from "react";
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
import { DeleteProgressDialog } from "./DeleteProgressDialog";
import { VaultSidebar } from "./VaultSidebar";

enum QueryStatus {
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

type Querying = {
	status: Exclude<QueryStatus, QueryStatus.Full>;
} | {
	status: QueryStatus.Full;
	total: null;
} | {
	status: QueryStatus.Full;
	total: number;
	current: number;
};

export type DirInfo = {
	name: string;
	id: DirID;
};

enum Dialog {
	None,
	// Dialog that asks user for folder name
	Folder,
	// Dialog that asks user for confirming delete operation
	DelConfirm,
	// Dialog that shows how much delete needs to be done
	DelProgress,
	// Dialog that asks user for files to upload
	Upload,
}

type Clipboard = {
	items: EncryptedItem[];
	exclude: DirID[];
	from: DirID;
}

/**
 * The following approach is used for this component:
 * Encrypted directory can be loaded independently from current directory
 * If the changed directory is not loaded, it will trigger loading
 * Otherwise, it uses cache
 * Force reload will always bypass and override cache
 */

export function VaultBrowser(props: {
	vault: Vault,
	client: WebDAV,
	download: (item: EncryptedItem[], vault: Vault) => void,
	downloads: {[path: ItemPath]: ItemDownloader},
	lock: () => void,
	openDownloads: () => void
}){

	const [dir, setDir] = useState<DirInfo[]>([]);
	const [items, setItems] = useState<DirCache<EncryptedItem>>({});
	const [querying, setQuerying] = useState<Querying>({status: QueryStatus.None});
	const [sel, setSel] = useState<GridSelectionModel>([]);
	const [menu, setMenu] = useState<null | HTMLElement>(null);
	const [open, setOpen] = useState<Dialog>(Dialog.None);
	const [delTargets, setDelTargets] = useState<EncryptedItem[]>([]);
	const [discovery, setDiscovery] = useState<[number, number]>([0, 0]);
	const [clipboard, setClipboard] = useState<Clipboard | null>(null);
	
	const itemsCache = useRef<DirCache<EncryptedItem>>({'': {explored: ExpStatus.NotStarted}});

	const columns = useMemo(() => [
		{field: 'type', headerName: '', width: 24, renderCell: (params: GridRenderCellParams<string>) => {
			if(params.row.type === 'AAparent') return <ArrowBack/>;
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
				if(params.row.type === 'f') def.push(
					<GridActionsCellItem
						icon={<Download/>}
						disabled={querying.status !== QueryStatus.None}
						onClick={() => props.download([params.row.obj], props.vault)}
						label='Download' 
					/>
				);
				if(params.row.type !== 'AAparent') def.push(
					<GridActionsCellItem
						icon={<Delete/>}
						disabled={querying.status !== QueryStatus.None}
						label='Delete'
						showInMenu
						onClick={() => {
							setDelTargets([params.row.obj]);
							setOpen(Dialog.DelConfirm);
						}}
					/>
				);
				return def;
			}
		}
	], [props.download, querying]);

	useEffect(() => {
		setQuerying({
			status: QueryStatus.Full,
			total: null
		});
		loadItems('' as DirID, true).then(() => setQuerying({status: QueryStatus.None}));
	}, []);

	const getDirItems = () => {
		const currentDirId = dir.length === 0 ? '' as DirID : dir[dir.length - 1].id;
		const currentItems = items[currentDirId];
		if(currentItems?.explored !== ExpStatus.Ready) return [];
		else return currentItems.child;
	}

	const rows = useMemo(() => {
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
				name: item.decryptedName,
				type: item.type,
				obj: item,
				lastMod: item.lastMod
			});
		}
		return rows;
	}, [items, dir]);

	const saveItems = (data: DirCache<EncryptedItem>) => {
		for(const k in data) itemsCache.current[k] = data[k];
		setItems({...itemsCache.current});
	}

	const createFolder = async (name: string) => {
		await props.vault.createDirectory(name, dir[dir.length - 1]?.id ?? '' as DirID);
		setOpen(Dialog.None);
		await reload();
	}

	const loadItems = async (dirId: DirID, bypassCache?: boolean) => {
		const temp = itemsCache.current[dirId] ?? {explored: ExpStatus.NotStarted};
		if(temp.explored === ExpStatus.Ready && !bypassCache) return;
		try {
			const update: DirCache<EncryptedItem> = {};
			const existing = (
				(temp.explored === ExpStatus.Ready || temp.explored === ExpStatus.Querying)
				? temp.child
				: []
			);
			update[dirId] = {
				child: existing,
				explored: ExpStatus.Querying
			};
			saveItems(update);
			const newItems = await props.vault.listItems(dirId, {
				type: (current, total) => setQuerying({
					status: QueryStatus.Full,
					total: total * 2,
					current: current + total
				}),
				name: (current, total) => setQuerying({
					status: QueryStatus.Full,
					total: total * 2,
					current: current
				})
			});
			console.log('done')
			update[dirId] = {
				child: newItems,
				explored: ExpStatus.Ready
			}
			saveItems(update);
		} catch(e) {
			const delta: DirCache<EncryptedItem> = {};
			delta[dirId] = {explored: ExpStatus.Error};
			saveItems(delta);
		}
	}

	const changeDir = async (subDir: EncryptedDir | null) => {
		setQuerying({
			status: QueryStatus.Full,
			total: null
		});
		if (subDir === null) {
			const newDir = dir.slice(0, -1);
			await loadItems(dir[dir.length - 1].id);
			setDir(newDir);
		} else {
			const dirInfo = {
				name: subDir.decryptedName,
				id: await subDir.getDirId()
			}
			await loadItems(dirInfo.id);
			setDir([...dir, dirInfo]);
		}
		setQuerying({status: QueryStatus.None});
	}

	const onRowClick = async (r: GridRowParams) => {
		if(querying.status !== QueryStatus.None) return;
		if(r.row.type === 'AAparent') changeDir(null);
		else if(r.row.type === 'd') changeDir(r.row.obj);
	}

	const reload = async () => {
		setQuerying({
			status: QueryStatus.Full,
			total: null
		});
		await loadItems(dir[dir.length - 1]?.id ?? '' as DirID, true);
		setQuerying({status: QueryStatus.None});
	}

	const getSelectedItems = () => {
		const targets = [];
		for(const item of getDirItems()) if(sel.includes(item.fullName)) targets.push(item);
		return targets;
	}

	const delItem = async (item: EncryptedItem, onDiscover: ProgressCallback) => {
		if(item.type === 'f') await props.vault.deleteFile(item);
		else await props.vault.deleteDir(item, onDiscover);
	}

	const delSelected = async () => {
		setQuerying({status: QueryStatus.Partial});
		const tasks: Promise<void>[] = [];
		const discoveryProgress: {[id: number]: [number, number]} = {};
		const discoveryCallback = (index: number): ProgressCallback => {
			return (discovered, toDiscover) => {
				discoveryProgress[index] = [discovered, toDiscover];
				let totalDiscovered = 0;
				let totalToDiscover = 0;
				for(const k in discoveryProgress) {
					const [d, td] = discoveryProgress[k];
					totalDiscovered += d;
					totalToDiscover += td;
				}
				setDiscovery([totalDiscovered, totalToDiscover]);
			}
		}
		delTargets.forEach((item, index) => tasks.push(delItem(item, discoveryCallback(index))));
		setOpen(Dialog.DelProgress);
		try {
			await Promise.all(tasks);
			setSel([]);
			await reload();
		} catch (e) {
			toast.error('Failed to delete items.');
		} finally {
			setDiscovery([0, 0]);
			setOpen(Dialog.None);
			setQuerying({status: QueryStatus.None});
		}
	}

	const moveSelected = async () => {
		if(!clipboard) return;
		setQuerying({status: QueryStatus.Partial});
		try {
			await Vault.move(clipboard.items, dir[dir.length - 1].id);
			loadItems(clipboard.from, true);
			setClipboard(null);
			await reload();
		} catch (e) {
			toast.success('Failed to move items.');
		} finally {
			setQuerying({status: QueryStatus.None});
		}
	}

	const setMoveTargets = async () => {
		const items = getSelectedItems();
		const dirs = items.filter(i => i.type === 'd') as EncryptedDir[];
		setSel([]);
		setClipboard({
			items: items,
			exclude: await Promise.all(dirs.map(d => d.getDirId())),
			from: dir[dir.length - 1]?.id ?? '' as DirID
		});
	}

	const canBeMoved = () => {
		const current = dir.map(d => d.id);
		return !clipboard?.exclude.some(d => current.includes(d));
	}

	const getToolbar = () => {
		if(sel.length) return (
			<SelectionToolbar
				selected={sel.length}
				del={() => {
					setDelTargets(getSelectedItems());
					setOpen(Dialog.DelConfirm);
				} }
				download={() => props.download(getSelectedItems(), props.vault)}
				disabled={querying.status !== QueryStatus.None}
				disableDownloadOnly={getSelectedItems().some(v => v.type === 'd')}
				clipboard={setMoveTargets}
			/>
		);
		else return (
			<Toolbar>
				<SingleLine variant='h5'>{`${[props.vault.name]}: ${dir.length === 0 ? 'Root' : dir[dir.length - 1].name}`}</SingleLine>
				<Box sx={{flex: 1}}/>
				<IconButton disabled={querying.status !== QueryStatus.None} onClick={e => setOpen(Dialog.Upload)}>
					<Upload/>
				</IconButton>
				<IconButton disabled={querying.status !== QueryStatus.None} onClick={e => setMenu(e.currentTarget)}>
					<Add/>
				</IconButton>
				{
					clipboard && <Tooltip title={'Move to here'}>
						<span>
							<IconButton onClick={moveSelected} disabled={querying.status !== QueryStatus.None || !canBeMoved()}>
								<ContentPaste/>
							</IconButton>
						</span>
					</Tooltip>
				}
				<Tooltip title='Refresh'>
					<span>
						<IconButton edge='end' onClick={reload} disabled={querying.status !== QueryStatus.None}>
							<Refresh/>
						</IconButton>
					</span>
				</Tooltip>
			</Toolbar>
		)
	}

	return (
		<Box sx={{display: 'flex', width: '100vw', height: '100vh'}}>
			<VaultSidebar
				lock={props.lock}
				downloads={props.downloads}
				openDownloads={props.openDownloads}
				tree={items}
				dir={dir}
				setDir={setDir}
				loadDir={loadItems}
				vault={props.vault}
			/>
			<AddMenu
				anchor={menu}
				onClose={() => setMenu(null)}
				createFolder={() => setOpen(Dialog.Folder)}
			/>
			<UploadDialog
				open={open === Dialog.Upload}
				close={() => setOpen(Dialog.None)}
				uploadDest={{
					encrypted: true,
					vault: props.vault,
					id: dir[dir.length - 1]?.id ?? '' as DirID
				}} refresh={reload}
			/>
			<FolderDialog open={open === Dialog.Folder} close={() => setOpen(Dialog.None)} create={createFolder}/>
			<DeleteProgressDialog open={open === Dialog.DelProgress} discovered={discovery[0]} toDiscover={discovery[1]}/>
			<DeleteDialog
				open={open === Dialog.DelConfirm}
				close={() => setOpen(Dialog.None)}
				del={delSelected}
				targets={delTargets}
			/>
			<Box sx={{display: 'flex', flexDirection: 'column', height: '100%', flex: 1, minWidth: 0}}>
				<AppBar position='static'>
					{getToolbar()}
				</AppBar>
				<DirBreadcrumbs dir={dir.map(d => d.name)} cd={(i) => setDir(dir.slice(0, i))}/>
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
						rows={rows}
						loading={querying.status === QueryStatus.Full}
						checkboxSelection
						selectionModel={sel}
						onSelectionModelChange={items => {
							if(querying.status === QueryStatus.None) setSel(items);
						}}
						components={{
							LoadingOverlay: LoadingOverlay
						}}
						componentsProps={{
							loadingOverlay: querying
						}}
					/>
				</Box>
			</Box>
		</Box>
	);
}

function LoadingOverlay(props: Querying & {status: QueryStatus.Full}){
	return(
		<Backdrop open={true} sx={{height: '100%', width: '100%', zIndex: (theme) => theme.zIndex.drawer - 1 }}>
			<Stack sx={{height: '100%', width: '100%'}} spacing={1} alignItems='center' justifyContent='center'>
				{
					props.total !== null
					? (
						<>
							<CircularProgress variant='determinate' value={Math.floor(props.current * 100 / props.total)}/>
							<Typography>
							{
								props.current * 2 < props.total
								? 'Decrypting names...'
								: 'Determining file type...'
							}
							</Typography>
						</>
					)
					: (
						<>
							<CircularProgress/>
							<Typography>Listing files...</Typography>
						</>
					)
				}
			</Stack>
		</Backdrop>
	)
}