import { Routes, Route } from 'react-router-dom'
import { Home } from './Home'
import { Practice } from './Practice'
import { SignIn } from './SignIn'
import { SignUp } from './SignUp'

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
        <Route
            path='/signin'
            element={
                <>
                    <SignIn />
                </>
            }
        ></Route>
        <Route
            path='/signup'
            element={
                <>
                    <SignUp />
                </>
            }
        ></Route>
    </Routes>
)

export default Main
