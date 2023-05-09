import { Box, Breadcrumbs, Link, styled } from "@mui/material";
import { SingleLine } from "./SingleLine";

const SingleLineLink = styled(Link)({
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
	overflow: 'hidden',
	maxWidth: '20vw'
});

export function DirBreadcrumbs(props: {dir: string[], cd: (index: number) => void}) {
	const prev = [
		props.dir.length === 0
		? <SingleLine color='text.primary' key='Root' maxWidth='20vw'>Root</SingleLine>
		: <SingleLineLink underline='hover' key='root' href='#' onClick={() => props.cd(0)}>Root</SingleLineLink>,
		...props.dir.slice(0, -1).map((d, i) => (
			<SingleLineLink underline='hover' key={i} href='#' onClick={() => props.cd(i + 1)}>{d}</SingleLineLink>
		))
	];
	return (
		<Box mt={1} ml={1}>
			<Breadcrumbs maxItems={4}>
				{prev}
				<SingleLine color='text.primary' maxWidth='20vw'>{props.dir[props.dir.length - 1]}</SingleLine>
			</Breadcrumbs>
		</Box>
	);
}