import { Routes, Route } from 'react-router-dom'
import { Home } from './Home'
import { Practice } from './Practice'

const Main = () => (
    <Routes>
        <Route
            path='/home'
            element={
                <>
                    <Home />
                </>
            }
        ></Route>
        <Route
            path='/'
            element={
                <>
                    <Practice />
                </>
            }
        ></Route>
    </Routes>
)

export default Main
