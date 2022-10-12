import { Box, AppBar, Toolbar, Typography } from "@mui/material";
import { GridSelectionModel, DataGrid } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { FileStat } from "webdav";
import { WebDAV } from "../../lib/cryptomator/storage-adapters/WebDAV";

const columns = [
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
			for(const item of items){
				rows.push({
					id: item.filename,
					name: item.basename
				});
			}
			return rows;
		}
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
					onRowClick={(r) => loadSubDir(r.row.name)}
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