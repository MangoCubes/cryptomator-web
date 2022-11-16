import { ArrowBack, Folder, Article, Refresh, Lock, LockOpen, Key } from "@mui/icons-material";
import { Box, AppBar, Toolbar, Typography, IconButton, Tooltip, Fab, Zoom } from "@mui/material";
import { GridSelectionModel, DataGrid, GridRowParams, GridRenderCellParams } from "@mui/x-data-grid";
import { Item, Vault } from "cryptomator-ts";
import { useEffect, useState } from "react";
import { WebDAV } from "../../lib/cryptomator/WebDAV";
import { VaultDialog } from "./VaultDialog";
const columns = [
	{field: 'type', headerName: '', width: 24, renderCell: (params: GridRenderCellParams<string>) => {
		if(params.row.type === 'parent') return <ArrowBack/>;
		else if(params.row.name === 'masterkey.cryptomator') return <Key/>;
		else if(params.row.name.endsWith('.c9r')) return <Lock/>;
		else if(params.row.type === 'd') return <Folder/>;
		else return <Article/>;
	}},
	{field: 'name', headerName: 'Name', flex: 3},
];

export function FileBrowser(props: {client: WebDAV}){

	const [dir, setDir] = useState<string[]>([]);
	const [items, setItems] = useState<Item[]>([]);
	const [querying, setQuerying] = useState(false);
	const [sel, setSel] = useState<GridSelectionModel>([]);
	const [open, setOpen] = useState(false);
	const [vault, setVault] = useState<Vault | null>(null);
	
	useEffect(() => {
		loadItems(dir);
	}, []);

	useEffect(() => {
		console.log(vault)
	}, [vault])

	const loadItems = async (absDir: string[]) => {
		const temp = [...items];
		try {
			setQuerying(true);
			setItems([]);
			setItems(await props.client.listItems('/' + absDir.join('/')));
			setDir(absDir);
		} catch(e) {
			setItems(temp);
		} finally {
			setQuerying(false);
		}
	}

	const loadSubDir = async (subDir: string | null) => {
		if (subDir === null) await loadItems(dir.slice(0, -1));
		else await loadItems([...dir, subDir]);
	}

	const reload = async () => {
		await loadItems(dir);
	}

	const getRows = () => {
		if (querying) return [];
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
					type: item.type
				});
			}
			return rows;
		}
	}

	const onRowClick = (r: GridRowParams) => {
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

	// const decrypt = async (password: string) => {
	// 	const vault = new Vault(props.client, '/' + dir.join('/'));
	// 	await vault.open(password);
	// 	return vault;
	// }

	return (
		<Box sx={{display: 'flex', flexDirection: 'column', height: '100%', flex: 1}}>
			<AppBar position='static'>
				<Toolbar>
					<Typography variant='h5'>{dir.length === 0 ? 'Root' : dir[dir.length - 1]}</Typography>
					<Box sx={{flex: 1}}/>
					<Tooltip title='Refresh'>
						<span>
							<IconButton edge='end' onClick={reload} disabled={querying}>
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
					rows={getRows()}
					loading={querying}
					checkboxSelection
					selectionModel={sel}
					onSelectionModelChange={items => {
						if(!querying) setSel(items);
					}}
				/>
			</Box>
			<Zoom in={showButton()}>
				<Fab onClick={() => setOpen(true)} variant='extended' sx={{position: 'fixed', top: 'auto', left: 'auto', right: 20, bottom: 80}}>
					<LockOpen/>
					Unlock
				</Fab>
			</Zoom>
			{/* <VaultDialog open={open} close={() => setOpen(false)} decrypt={decrypt} setVault={setVault}/> */}
		</Box>
	)
}