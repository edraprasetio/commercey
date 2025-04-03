import styled from '@emotion/styled'
import { Navbar } from '../components/atoms/navbar'
import { Card, HomeBackground } from '../components/home/background'
import { Heading32, SubHeading14, SubTitle14 } from '../styles/typography'
import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import userIcon from '../assets/icons/userIcon.svg'
import { useAuth } from '../utils'

const MainContainer = styled.div`
    display: flex;
    height: 100vh;
    flex-direction: column;
`

const FriendContainer = styled.li`
    display: flex;
    width: 240px;
    gap: 24px;
    padding: 8px 16px;
    border-radius: 8px;
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
                                    <img src={userIcon} />
                                    <SubTitle14>
                                        {friend.firstName} {friend.lastName}
                                    </SubTitle14>
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
