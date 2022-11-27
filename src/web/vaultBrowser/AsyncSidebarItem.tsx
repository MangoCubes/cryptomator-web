import styled from "@emotion/styled";
import { TreeItem } from "@mui/lab";
import { Typography } from "@mui/material";
import { DirID, EncryptedDir, EncryptedItem } from "cryptomator-ts";
import { useEffect, useState } from "react";
import { DirCache, ExpStatus } from "../../types/types";

/**
 * This component has these states:
 * 1. Both ID and items are not loaded
 * 2. ID is loaded, but children items are not
 * 3. Both ID and children are loaded
 */

enum States {
	None,
	Partial,
	Full
}

type LoadStatus = {
	state: States.None;
} | {
	state: States.Partial;
	id: DirID;
} | {
	state: States.Full;
	id: DirID;
	items: EncryptedItem[];
}

const ItemLabel = styled(Typography)({
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
	overflow: 'hidden'
});

export function AsyncSidebarItem(props: {dir: EncryptedDir, tree: DirCache<EncryptedItem>}){

	const [loadState, setLoadState] = useState<LoadStatus>({state: States.None});

	useEffect(() => {
		startIDLoad();
	}, []);

	useEffect(() => {
		if(loadState.state === States.Partial){
			const items = props.tree[loadState.id];
			if(items && items.explored === ExpStatus.Ready){
				setLoadState({
					state: States.Full,
					id: loadState.id,
					items: items.child
				});
			}
		}
		console.log(loadState)
	}, [loadState, props.tree]);

	const startIDLoad = async () => {
		const id = await props.dir.getDirId();
		setLoadState({
			state: States.Partial,
			id: id
		});
	}

	const getInnerItems = () => {
		if(loadState.state === States.Full){
			const dirs = loadState.items.filter(i => i.type === 'd') as EncryptedDir[];
			if(dirs.length === 0) return (
				<TreeItem nodeId={loadState.id + 'None'} key={loadState.id + 'None'} label={<ItemLabel>No folders</ItemLabel>}/>
			);
			return dirs.map(d => (
				<AsyncSidebarItem dir={d} key={d.fullName} tree={props.tree}/>
			));
		} else return <TreeItem nodeId={props.dir.fullName + 'Loading'} key={props.dir.fullName + 'Loading'} label={<ItemLabel>Loading...</ItemLabel>}/>
	}

	if(loadState.state === States.None) return (
		<TreeItem nodeId={props.dir.fullName + 'Loading'} key={props.dir.fullName + 'Loading'} label={<ItemLabel>{props.dir.decryptedName}</ItemLabel>}/>
	);
	else return (
		<TreeItem nodeId={loadState.id} key={loadState.id} label={<ItemLabel>{props.dir.decryptedName}</ItemLabel>}>
			{getInnerItems()}
		</TreeItem>
	)
}