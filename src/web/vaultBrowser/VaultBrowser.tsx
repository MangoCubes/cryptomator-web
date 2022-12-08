import { Add, ArrowBack, Article, Delete, Download, Folder, Refresh, Upload } from "@mui/icons-material";
import { Box, AppBar, Toolbar, Tooltip, IconButton } from "@mui/material";
import { DataGrid, GridActionsCellItem, GridRenderCellParams, GridRowParams, GridSelectionModel } from "@mui/x-data-grid";
import { DirID, EncryptedDir, EncryptedItem, ItemPath, Vault } from "cryptomator-ts";
import { useEffect, useMemo, useRef, useState } from "react";
import { WebDAV } from "../../lib/cryptomator/WebDAV";
import { DirCache, ExpStatus } from "../../types/types";
import { ItemDownloader } from "../ItemDownloader";
import { AddMenu } from "../shared/AddMenu";
import { DirBreadcrumbs } from "../shared/DirBreadcrumbs";
import { FolderDialog } from "../shared/FolderDialog";
import { SelectionToolbar } from "../shared/SelectionToolbar";
import { SingleLine } from "../shared/SingleLine";
import { UploadDialog } from "../shared/UploadDialog";
import { VaultSidebar } from "./VaultSidebar";

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

export type DirInfo = {
	name: string;
	id: DirID;
};

enum Dialog {
	None,
	// Dialog that shows content of a file, which can also be edited and saved
	File,
	// Dialog that asks user for folder name
	Folder,
	//Dialog that asks user for confirming delete operation
	DelConfirm,
	// Dialog that asks user for files to upload
	Upload
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
	const [querying, setQuerying] = useState<Querying>(Querying.None);
	const [sel, setSel] = useState<GridSelectionModel>([]);
	const [menu, setMenu] = useState<null | HTMLElement>(null);
	const [open, setOpen] = useState<Dialog>(Dialog.None);
	
	const itemsCache = useRef<DirCache<EncryptedItem>>({'': {explored: ExpStatus.NotStarted}});

	const columns = useMemo(() => [
		{field: 'type', headerName: '', width: 24, renderCell: (params: GridRenderCellParams<string>) => {
			if(params.row.type === 'AAparent') return <ArrowBack/>;
			else if(params.row.type === 'd') return <Folder/>;
			else return <Article/>;
		}},
		{field: 'name', headerName: 'Name', flex: 3},
		{
			field: 'actions',
			type: 'actions',
			getActions: (params: GridRowParams) => {
				const def = [];
				if(params.row.type === 'f') def.push(<GridActionsCellItem icon={<Download/>} disabled={querying !== Querying.None} onClick={() => props.download([params.row.obj], props.vault)} label='Download' />);
				if(params.row.type !== 'AAparent') def.push(<GridActionsCellItem icon={<Delete/>} disabled={querying !== Querying.None} label='Delete' showInMenu />);
				return def;
			}
		}
	], [props.download, querying]);

	useEffect(() => {
		loadItems('' as DirID, true);
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
				obj: item
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
			const newItems = await props.vault.listItems(dirId);
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
		setQuerying(Querying.Full);
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
		setQuerying(Querying.None);
	}

	const onRowClick = async (r: GridRowParams) => {
		if(querying !== Querying.None) return;
		if(r.row.type === 'AAparent') changeDir(null);
		else if(r.row.type === 'd') changeDir(r.row.obj);
	}

	const reload = async () => {
		setQuerying(Querying.Full);
		await loadItems(dir[dir.length - 1]?.id ?? '' as DirID, true);
		setQuerying(Querying.None);
	}

	const getSelectedItems = () => {
		const targets = [];
		for(const item of getDirItems()) if(sel.includes(item.fullName)) targets.push(item);
		return targets;
	}

	const getToolbar = () => {
		if(sel.length) return (
			<SelectionToolbar
				selected={sel.length}
				del={function (): void {
				throw new Error("Function not implemented.");
			} } download={() => props.download(getSelectedItems(), props.vault)} disabled={querying !== Querying.None}
			/>
		);
		else return (
			<Toolbar>
				<SingleLine variant='h5'>{`${[props.vault.name]}: ${dir.length === 0 ? 'Root' : dir[dir.length - 1].name}`}</SingleLine>
				<Box sx={{flex: 1}}/>
				<IconButton disabled={querying !== Querying.None} onClick={e => setOpen(Dialog.Upload)}>
					<Upload/>
				</IconButton>
				<IconButton disabled={querying !== Querying.None} onClick={e => setMenu(e.currentTarget)}>
					<Add/>
				</IconButton>
				<Tooltip title='Refresh'>
					<span>
						<IconButton edge='end' onClick={reload} disabled={querying !== Querying.None}>
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
				createFile={() => setOpen(Dialog.File)}
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
						isRowSelectable={(params: GridRowParams) => params.row.type === 'f'}
						columns={columns}
						rows={rows}
						loading={querying === Querying.Full}
						checkboxSelection
						selectionModel={sel}
						onSelectionModelChange={items => {
							if(querying === Querying.None) setSel(items);
						}}
					/>
				</Box>
			</Box>
		</Box>
	);
}