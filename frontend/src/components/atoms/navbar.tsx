import styled from '@emotion/styled'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import chatIcon from '../../assets/icons/chatsIcon.svg'
import friendsIcon from '../../assets/icons/usersIcon.svg'
import userIcon from '../../assets/icons/userIcon.svg'
import line from '../../assets/icons/line.svg'
import logOut from '../../assets/icons/logOutIcon.svg'
import settings from '../../assets/icons/settingsIcon.svg'
import addFriend from '../../assets/icons/addFriendIcon.svg'
import { SubHeading14 } from '../../styles/typography'
import { useNotifications } from '../../utils'

const MainContainer = styled.div`
    display: flex;
    width: 280px;
    height: 100vh;
    flex-direction: column;
    justify-content: space-between;
    padding: 0px 16px;
`
const ItemContainer = styled.div`
    display: flex;
    padding: 0px 16px;
    height: 48px;
    justify-content: space-between;
    border-radius: 8px;
    align-items: center;
    position: relative;
    color: ${(props) => props.theme.primaryColor.black[1]};
    &:hover {
        background-color: rgba(176, 176, 188, 0.4);
    }
    &.set {
        background-color: rgba(176, 176, 188, 0.4);
    }
`

const UserItemContainer = styled(ItemContainer)`
    justify-content: unset;
    gap: 24px;
`

const NotificationWrapper = styled.div`
    display: flex;
    color: ${(props) => props.theme.primaryColor.white[1]};
    background-color: red;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
`

const IconWrapper = styled.img`
    width: 24px;
    height: 24px;
`

const Popup = styled.div`
    position: absolute;
    width: 244px;
    top: -128px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    gap: 7.5px;
    background: ${(props) => props.theme.primaryColor.white[1]};
    padding: 8px 12px;
    border-radius: 6px;
    white-space: nowrap;
    box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.2);
    z-index: 10;
    &::after {
        position: absolute;
        content: '';
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
        border-top: 12px solid ${(props) => props.theme.primaryColor.white[1]};
        filter: drop-shadow(0px 3px 3px rgba(0, 0, 0, 0.2));
        bottom: -12px;
        left: 112px;
    }
`

export const Navbar = () => {
    const [isPopupVisible, setPopupVisible] = useState(false)
    const { username } = useParams()
    const [user, setUser] = useState<{
        firstName: string
        lastName: string
    } | null>(null)

    const location = useLocation()

    const { pendingRequests } = useNotifications()
    useEffect(() => {
        console.log('Updated pendingFriendRequests:', pendingRequests)
    }, [pendingRequests])

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/user`, {
                    method: 'GET',
                    credentials: 'include',
                })

                if (response.ok) {
                    const data = await response.json()
                    setUser(data)
                    // console.log(user)
                }
            } catch (error) {
                console.error('Error fetching user:', error)
            }
        }

        if (username) {
            fetchUser()
        }
    }, [username])

    const navigate = useNavigate()

    const handleLogout = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/signout', {
                method: 'POST',
                credentials: 'include',
            })

            if (response.ok) {
                navigate('/signin')
            } else {
                console.error('Logout failed')
            }
        } catch (error) {
            console.error('Request failed', error)
        }
    }

    return (
        <MainContainer>
            <div
                style={{
                    display: 'flex',
                    gap: '8px',
                    flexDirection: 'column',
                    marginTop: '32px',
                }}
            >
                <ItemContainer
                    className={
                        location.pathname === `/${username}/chats` ? 'set' : ''
                    }
                    onClick={() => navigate(`/${username}/chats`)}
                >
                    <div
                        style={{
                            display: 'flex',
                            gap: '24px',
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}
                    >
                        <IconWrapper src={chatIcon} />{' '}
                        <SubHeading14>Chats</SubHeading14>
                    </div>
                </ItemContainer>

                <ItemContainer
                    className={
                        location.pathname === `/${username}/friends`
                            ? 'set'
                            : ''
                    }
                    onClick={() => navigate(`/${username}/friends`)}
                >
                    <div
                        style={{
                            display: 'flex',
                            gap: '24px',
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}
                    >
                        <IconWrapper src={friendsIcon} />
                        <SubHeading14>Friends</SubHeading14>
                    </div>
                </ItemContainer>

                <ItemContainer
                    className={
                        location.pathname === `/${username}/addfriend`
                            ? 'set'
                            : ''
                    }
                    onClick={() => navigate(`/${username}/addfriend`)}
                >
                    <div
                        style={{
                            display: 'flex',
                            gap: '24px',
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}
                    >
                        <IconWrapper src={addFriend} />
                        <SubHeading14>Add Friend</SubHeading14>
                    </div>
                    {pendingRequests > 0 && (
                        <NotificationWrapper>
                            {pendingRequests > 9 ? '9+' : pendingRequests}
                        </NotificationWrapper>
                    )}
                </ItemContainer>
            </div>
            <UserItemContainer
                style={{ marginBottom: '32px' }}
                onClick={() => setPopupVisible(!isPopupVisible)}
                onBlur={() => setPopupVisible(false)}
                tabIndex={0}
            >
                <IconWrapper src={userIcon} />
                <SubHeading14>
                    {user ? user.firstName : 'Loading...'}{' '}
                    {user ? user.lastName : 'Loading...'}
                </SubHeading14>
                {isPopupVisible && (
                    <Popup>
                        <UserItemContainer
                            onClick={() => navigate(`/${username}/settings`)}
                        >
                            <IconWrapper src={settings} />
                            <SubHeading14>Settings</SubHeading14>
                        </UserItemContainer>
                        <img src={line} />
                        <UserItemContainer onClick={handleLogout}>
                            <IconWrapper src={logOut} />
                            <SubHeading14>Sign Out</SubHeading14>
                        </UserItemContainer>
                    </Popup>
                )}
            </UserItemContainer>
        </MainContainer>
    )
}
