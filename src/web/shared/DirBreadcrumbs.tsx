import { Typography, Link, Box, Breadcrumbs } from "@mui/material";

export function DirBreadcrumbs(props: {dir: string[], cd: (index: number) => void}) {
	const prev = [
		props.dir.length === 0
		? <Typography color='text.primary' key='Root'>Root</Typography>
		: <Link underline='hover' key='root' href='#'>Root</Link>,
		...props.dir.slice(0, -1).map((d, i) => (
			<Link underline='hover' key={i} href='#'>{d}</Link>
		))			
	];
	return (
		<Box mt={1} ml={1}>
			<Breadcrumbs>
				{prev}
				<Typography color='text.primary'>{props.dir[props.dir.length - 1]}</Typography>
			</Breadcrumbs>
		</Box>
	);
}