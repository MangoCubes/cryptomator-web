import { ThemeProvider } from '@emotion/react';
import { createTheme, CssBaseline } from '@mui/material';
import React from 'react';
import { MainScreen } from './lib/web/MainScreen';

export function App() {
	const theme = createTheme({
		palette: {
			mode: 'dark',
		}
	});

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<MainScreen/>
		</ThemeProvider>
	);
}
