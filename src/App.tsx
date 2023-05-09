import { ThemeProvider } from '@emotion/react';
import { createTheme, CssBaseline } from '@mui/material';
import React from 'react';
import { MainScreen } from './web/MainScreen';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider, Routes } from 'react-router-dom';

const router = createBrowserRouter(
	createRoutesFromElements(
		<Routes>
			<Route path='onedrive' element={<></>}/>
			<Route path='*' element={<MainScreen />} />
		</Routes>
		
	)
);

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
			<RouterProvider router={router} />
		</ThemeProvider>

	);
}
