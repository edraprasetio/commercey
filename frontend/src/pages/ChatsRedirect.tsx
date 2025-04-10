import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const ChatsRedirect = () => {
    const { username } = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        const redirectToFirstChat = async () => {
            try {
                const res = await fetch(
                    `http://localhost:5000/api/conversations`,
                    {
                        method: 'GET',
                        credentials: 'include',
                    }
                )
                const data = await res.json()
                if (data.length > 0) {
                    const firstFriendUsername = data[0].recipientUsername
                    navigate(`/${username}/chats/${firstFriendUsername}`)
                }
            } catch (error) {
                console.error('Failed to redirect to first chat:', error)
            }
        }

        redirectToFirstChat()
    }, [navigate, username])

    return null
}

export default ChatsRedirect
