import { ArrowBack, Folder, Article } from "@mui/icons-material";
import { Box, AppBar, Toolbar, Typography } from "@mui/material";
import { GridSelectionModel, DataGrid, GridRowParams, GridRenderCellParams } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { FileStat } from "webdav";
import { WebDAV } from "../../lib/cryptomator/storage-adapters/WebDAV";

const columns = [
	{field: 'type', headerName: '', width: 24, renderCell: (params: GridRenderCellParams<string>) => {
		if(params.row.type === 'parent') return <ArrowBack/>;
		else if(params.row.type === 'directory') return <Folder/>;
		else return <Article/>
	}},
	{field: 'name', headerName: 'Name', flex: 3},
];

export function FileBrowser(props: {client: WebDAV}){

	const [dir, setDir] = useState<string[]>([]);
	const [items, setItems] = useState<FileStat[]>([]);
	const [querying, setQuerying] = useState(false);
	const [sel, setSel] = useState<GridSelectionModel>([]);
	
	useEffect(() => {
		loadItems(dir);
	}, []);

	const loadItems = async (absDir: string[]) => {
		try {
			setQuerying(true);
			setItems(await props.client.listItems('/' + absDir.join('/')));
			setDir(absDir);
		} catch(e) {

		} finally {
			setQuerying(false);
		}
	}

	const loadSubDir = async (subDir: string | null) => {
		if (subDir === null) await loadItems(dir.slice(0, -1));
		else await loadItems([...dir, subDir]);
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
					id: item.filename,
					name: item.basename,
					type: item.type
				});
			}
			return rows;
		}
	}

	const onRowClick = (r: GridRowParams) => {
		if(r.row.type === 'parent') loadSubDir(null);
		else if(r.row.type === 'directory') loadSubDir(r.row.name);
	}

	return (
		<Box sx={{display: 'flex', flexDirection: 'column', height: '100%', flex: 1}}>
			<AppBar position='static'>
				<Toolbar>
					<Typography variant='h5'>{dir.length === 0 ? 'Root' : dir[dir.length - 1]}</Typography>
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
		</Box>
	)
}