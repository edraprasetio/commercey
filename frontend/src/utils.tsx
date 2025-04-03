import { useEffect, useState } from 'react'
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

export const useNotifications = () => {
    const [notifications, setNotifications] = useState<{
        pendingRequests: number
        // unreadMessages: number
    }>({
        pendingRequests: 0,
        // unreadMessages: 0,
    })

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await fetch(
                    'http://localhost:5000/api/notifications',
                    { credentials: 'include' }
                )
                if (response.ok) {
                    const data = await response.json()
                    console.log('Fetched Data:', data)
                    setNotifications(data)
                    // console.log(notifications)
                } else {
                    console.error('Failed to fetch notifications')
                }
            } catch (error) {
                console.error('Error fetching notifications:', error)
            }
        }

        fetchNotifications()
        const interval = setInterval(fetchNotifications, 10000)
        return () => clearInterval(interval)
    }, [])

    return notifications
}
