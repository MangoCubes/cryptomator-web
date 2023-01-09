import { ThemeProvider } from '@emotion/react';
import { createTheme, CssBaseline } from '@mui/material';
import React from 'react';
import { MainScreen } from './web/MainScreen';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export function App() {
	const theme = createTheme({
		palette: {
			mode: 'dark',
		}
	});

	return (
		<ThemeProvider theme={theme}>
			<ToastContainer />
			<CssBaseline />
			<MainScreen/>
		</ThemeProvider>
		
	);
}
