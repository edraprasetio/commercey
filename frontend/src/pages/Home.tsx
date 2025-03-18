import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { HomeBackground } from '../components/home/background'

export const Home = () => {
    const { username } = useParams() // Get username from URL
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
            Username is {user ? user.username : 'Loading...'}
        </HomeBackground>
    )
}
