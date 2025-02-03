import React from 'react'
import Main from './pages/Main'
import { defaultTheme } from './styles/theme'
import { ThemeProvider } from '@emotion/react'

function App() {
    return (
        <>
            <ThemeProvider theme={defaultTheme}>
                <div>
                    <Main />
                </div>
            </ThemeProvider>
        </>
    )
}

export default App
