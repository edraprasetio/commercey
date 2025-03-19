import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { HomeBackground } from '../components/home/background'
import { BlueButton } from '../components/atoms/button'

export const Home = () => {
    const { username } = useParams()
    const [user, setUser] = useState<{ username: string } | null>(null)

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

    const navigate = useNavigate()

    const handleLogout = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/signout', {
                method: 'POST',
                credentials: 'include', // Ensure cookies are included
            })

            if (response.ok) {
                navigate('/signin') // Redirect to sign-in page
            } else {
                console.error('Logout failed')
            }
        } catch (error) {
            console.error('Request failed', error)
        }
    }

    return (
        <HomeBackground>
            Username is {user ? user.username : 'Loading...'}
            <BlueButton onClick={handleLogout} style={{ width: '400px' }}>
                LOG OUT
            </BlueButton>
        </HomeBackground>
    )
}
