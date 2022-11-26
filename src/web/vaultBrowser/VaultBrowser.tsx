import { ArrowBack, Article, Delete, Download, Folder, Refresh } from "@mui/icons-material";
import { Box, AppBar, Toolbar, Typography, Tooltip, IconButton } from "@mui/material";
import { DataGrid, GridActionsCellItem, GridRenderCellParams, GridRowParams, GridSelectionModel } from "@mui/x-data-grid";
import { DirID, EncryptedDir, EncryptedItem, ItemPath, Vault } from "cryptomator-ts";
import { useEffect, useMemo, useRef, useState } from "react";
import { WebDAV } from "../../lib/cryptomator/WebDAV";
import { DirCache, ExpStatus } from "../../types/types";
import { ItemDownloader } from "../ItemDownloader";
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
	
	const itemsCache = useRef<DirCache<EncryptedItem>>({'': {explored: ExpStatus.NotStarted}});

	const columns = useMemo(() => [
		{field: 'type', headerName: '', width: 24, renderCell: (params: GridRenderCellParams<string>) => {
			if(params.row.type === 'parent') return <ArrowBack/>;
			else if(params.row.type === 'd') return <Folder/>;
			else return <Article/>;
		}},
		{field: 'name', headerName: 'Name', flex: 3},
		{
			field: 'actions',
			type: 'actions',
			getActions: (params: GridRowParams) => {
				const def = [];
				if(params.row.type === 'f') def.push(<GridActionsCellItem icon={<Download/>} onClick={() => props.download([params.row.obj], props.vault)} label='Download' />);
				if(params.row.type !== 'parent') def.push(<GridActionsCellItem icon={<Delete/>} label='Delete' showInMenu />);
				return def;
			}
		}
	], [props.download]);

	useEffect(() => {
		loadItems('' as DirID, true);
	}, [])

	const rows = useMemo(() => {
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
		const currentDirId = dir.length === 0 ? '' as DirID : dir[dir.length - 1].id;
		const currentItems = items[currentDirId];
		if(currentItems?.explored !== ExpStatus.Ready) return [];
		for(const item of currentItems.child){
			rows.push({
				id: item.fullName,
				name: item.decryptedName,
				type: item.type,
				obj: item
			});
		}
		return rows;
	}, [items]);

	const saveItems = (data: DirCache<EncryptedItem>) => {
		for(const k in data) itemsCache.current[k] = data[k];
		setItems({...itemsCache.current});
	}

	const loadItems = async (dirId: DirID, bypassCache?: boolean) => {
		const temp = itemsCache.current[dirId] ?? {
			child: [],
			explored: ExpStatus.NotStarted
		};
		if(temp.explored === ExpStatus.Ready && !bypassCache) return;
		try {
			const update: DirCache<EncryptedItem> = {};
			update[dirId] = {explored: ExpStatus.Querying};
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
		if(r.row.type === 'parent') changeDir(null);
		else if(r.row.type === 'd') changeDir(r.row.obj);
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
			<Box sx={{display: 'flex', flexDirection: 'column', height: '100%', flex: 1}}>
				<AppBar position='static'>
					<Toolbar>
						<Typography variant='h5'>{`${[props.vault.name]}: ${dir.length === 0 ? 'Root' : dir[dir.length - 1].name}`}</Typography>
						<Box sx={{flex: 1}}/>
						<Tooltip title='Refresh'>
							<span>
								<IconButton edge='end'>
									<Refresh/>
								</IconButton>
							</span>
						</Tooltip>
					</Toolbar>
				</AppBar>
				<Box m={1} sx={{flex: 1}}>
					<DataGrid
						onRowClick={onRowClick}
						disableSelectionOnClick
						isRowSelectable={(params: GridRowParams) => params.row.type !== 'parent'}
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
	)
}