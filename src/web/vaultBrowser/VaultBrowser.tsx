import { ArrowBack, Article, Folder, Refresh } from "@mui/icons-material";
import { Box, AppBar, Toolbar, Typography, Tooltip, IconButton } from "@mui/material";
import { DataGrid, GridRenderCellParams, GridRowParams, GridSelectionModel } from "@mui/x-data-grid";
import { DirID, EncryptedDir, EncryptedItem, Vault } from "cryptomator-ts";
import { useEffect, useMemo, useState } from "react";
import { WebDAV } from "../../lib/cryptomator/WebDAV";

const columns = [
	{field: 'type', headerName: '', width: 24, renderCell: (params: GridRenderCellParams<string>) => {
		if(params.row.type === 'parent') return <ArrowBack/>;
		else if(params.row.type === 'd') return <Folder/>;
		else return <Article/>;
	}},
	{field: 'name', headerName: 'Name', flex: 3},
];

export function VaultBrowser(props: {vault: Vault, client: WebDAV}){

	const [dir, setDir] = useState<EncryptedDir[]>([]);
	const [items, setItems] = useState<EncryptedItem[]>([]);
	const [querying, setQuerying] = useState(false);
	const [sel, setSel] = useState<GridSelectionModel>([]);

	const rows = useMemo(() => {
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
					name: item.decryptedName,
					type: item.type,
					obj: item
				});
			}
			return rows;
		}
	}, [querying]);

	useEffect(() => {
		loadItems();
	}, [dir]);

	useEffect(() => {
		console.log(items);
	}, [items]);

	const loadItems = async () => {
		const temp = [...items];
		try {
			setQuerying(true);
			setItems([]);
			const newItems = await props.vault.listItems(dir.length === 0 ? '' as DirID : await dir[dir.length - 1].getDirId());
			setItems(newItems);
		} catch(e) {
			setItems(temp);
		} finally {
			setQuerying(false);
		}
	}

	const onRowClick = (r: GridRowParams) => {
		if(r.row.type === 'parent') loadSubDir(null);
		else if(r.row.type === 'd') loadSubDir(r.row.obj);
	}

	const loadSubDir = async (subDir: EncryptedDir | null) => {
		if (subDir === null) setDir(dir.slice(0, -1));
		else setDir([...dir, subDir]);
	}

	return (
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
					loading={querying}
					checkboxSelection
					selectionModel={sel}
					onSelectionModelChange={items => {
						if(!querying) setSel(items);
					}}
				/>
			</Box>
		</Box>
	)
}