import { Routes, Route } from 'react-router-dom'
import { Practice } from './Practice'
import { SignIn } from './SignIn'
import { SignUp } from './SignUp'
import { Chats } from './Chats'

const Main = () => (
    <Routes>
        <Route
            path='/:username'
            element={
                <>
                    <Chats />
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
