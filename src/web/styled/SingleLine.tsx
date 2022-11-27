import { styled, Typography } from "@mui/material";

export const SingleLine = styled(Typography)({
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
	overflow: 'hidden'
});