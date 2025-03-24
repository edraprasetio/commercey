import { Routes, Route } from 'react-router-dom'
import { Practice } from './Practice'
import { SignIn } from './SignIn'
import { SignUp } from './SignUp'
import { Chats } from './Chats'
import { Friends } from './Friends'
import { Settings } from './Settings'
import { AddFriend } from './AddFriend'

const Main = () => (
    <Routes>
        <Route
            path='/:username/chats'
            element={
                <>
                    <Chats />
                </>
            }
        ></Route>
        <Route
            path='/:username/friends'
            element={
                <>
                    <Friends />
                </>
            }
        ></Route>
        <Route
            path='/:username/addfriend'
            element={
                <>
                    <AddFriend />
                </>
            }
        ></Route>
        <Route
            path='/:username/settings'
            element={
                <>
                    <Settings />
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
