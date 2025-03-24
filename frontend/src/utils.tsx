import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export const useAuth = () => {
    const navigate = useNavigate()

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/user', {
                    method: 'GET',
                    credentials: 'include',
                })

                if (response.status === 401) {
                    navigate('/signin')
                }
            } catch (error) {
                console.error('Error checking auth:', error)
                navigate('/signin')
            }
        }

        checkAuth()
    }, [navigate])
}
