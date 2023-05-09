import { ThemeProvider } from '@emotion/react';
import { createTheme, CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MainScreen } from './web/MainScreen';

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
			<MainScreen />
		</ThemeProvider>

	);
}
