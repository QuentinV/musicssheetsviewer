import React from 'react'
import './theme.css'
import 'primeflex/primeflex.css'
import 'primeicons/primeicons.css'
import 'primereact/resources/themes/mira/theme.css'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { HomePage } from './pages/HomePage';
import { UploadPage } from './pages/UploadPage'
import { SheetPage } from './pages/SheetPage'


function App() {
    return (
        <HashRouter>
        <Routes>
            <Route
                index
                element={
                    <HomePage />
                }
            />
            <Route
                path="/upload"
                element={
                    <UploadPage />
                }
            />
            <Route
                path="/sheet"
                element={
                    <SheetPage />
                }
            />
        </Routes>
    </HashRouter>
    )
}

export default App
