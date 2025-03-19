import styled from '@emotion/styled'
import { Navbar } from '../components/atoms/navbar'
import { HomeBackground } from '../components/home/background'
import { Heading32 } from '../styles/typography'
import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'

const MainContainer = styled.div`
    margin: 32px 16px;
    display: flex;
    flex-direction: column;
`

export const Friends = () => {
    const { username } = useParams()
    const [user, setUser] = useState<{
        friends: string[]
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
                    console.log(user)
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
                <Heading32>Friends</Heading32>
                {username}
                {user ? user.friends : ''}
            </MainContainer>
        </HomeBackground>
    )
}
