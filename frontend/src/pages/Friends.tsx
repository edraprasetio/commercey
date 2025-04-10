import styled from '@emotion/styled'
import { Navbar } from '../components/atoms/navbar'
import { Card, HomeBackground } from '../components/home/background'
import { Heading32, SubHeading14, SubTitle14 } from '../styles/typography'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import userIcon from '../assets/icons/userIcon.svg'
import { useAuth } from '../utils'
import { BlueButton } from '../components/atoms/button'

const MainContainer = styled.div`
    display: flex;
    height: 100vh;
    flex-direction: column;
`

const FriendContainer = styled.li`
    display: flex;
    padding: 8px 16px;
    border-radius: 8px;
    justify-content: space-between;
    align-items: center;
    position: relative;
    color: ${(props) => props.theme.primaryColor.black[1]};
    &:hover {
        background-color: rgba(176, 176, 188, 0.4);
    }
`

export const Friends = () => {
    useAuth()

    const { username } = useParams()
    const [user, setUser] = useState<{
        friends: { username: string; firstName: string; lastName: string }[]
    } | null>(null)

    const navigate = useNavigate()

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
                } else {
                    console.error('Failed to fetch user')
                }
            } catch (error) {
                console.error('Error fetching user:', error)
            }
        }

        if (username) {
            fetchUser()
        }
    }, [username])

    const handleMessageClick = async (friendUsername: string) => {
        try {
            const res = await fetch(
                'http://localhost:5000/api/messages/initiate',
                {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ recipientUsername: friendUsername }),
                }
            )

            if (res.ok) {
                navigate(`/${username}/chats/${friendUsername}`)
            } else {
                console.error('Failed to initiate chat')
            }
        } catch (error) {
            console.error('Error initiating chat:', error)
        }
    }

    return (
        <HomeBackground>
            <Navbar />
            <MainContainer>
                <Card>
                    <Heading32>Friends</Heading32>
                    <ul style={{ padding: 'unset' }}>
                        {user?.friends?.length ? (
                            user.friends.map((friend, index) => (
                                <FriendContainer key={index}>
                                    <div
                                        style={{ display: 'flex', gap: '24px' }}
                                    >
                                        <img src={userIcon} />
                                        <SubTitle14>
                                            {friend.firstName} {friend.lastName}
                                        </SubTitle14>
                                    </div>

                                    <BlueButton
                                        style={{
                                            padding: '4px 16px',
                                            width: 'unset',
                                        }}
                                        onClick={() =>
                                            handleMessageClick(friend.username)
                                        }
                                    >
                                        <SubHeading14>Message</SubHeading14>
                                    </BlueButton>
                                </FriendContainer>
                            ))
                        ) : (
                            <p>No friends yet</p>
                        )}
                    </ul>
                </Card>
            </MainContainer>
        </HomeBackground>
    )
}
