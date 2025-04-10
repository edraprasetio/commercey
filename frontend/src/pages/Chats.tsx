import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, HomeBackground } from '../components/home/background'
import { BlueButton } from '../components/atoms/button'
import { Navbar } from '../components/atoms/navbar'
import { Heading32, Paragraph14, SubTitle14 } from '../styles/typography'
import styled from '@emotion/styled'
import { useAuth } from '../utils'
import SendIcon from '../assets/icons/sendIcon.svg'
import UserIcon from '../assets/icons/userIcon.svg'
import Dot from '../assets/icons/dot.svg'
import { encryptMessageWithAES, generateRSAKeyPair } from '../utils/encryption'
import { ConversationList } from '../components/conversationList'

const MainContainer = styled.div`
    display: flex;
    height: 100vh;
    width: 100%;
`

const ContentWrapper = styled.div`
    display: flex;
    flex: 1;
    width: 100%;
    gap: 16px;
    margin: 32px 32px 32px 0;
`

const RightCard = styled(Card)`
    display: flex;
    flex-direction: column;
    margin: unset;
    padding: unset;
`

const ProfileContainer = styled.div`
    width: 100%;
    display: flex;
    border-radius: 16px 16px 0px 0px;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.1), 0 6px 20px 0 rgba(0, 0, 0, 0.1);
`

const ProfileContent = styled.div`
    width: 100%;
    display: flex;
    gap: 16px;
    align-items: center;
    padding: 16px;
`

const InputContainer = styled.div`
    width: 100%;
`

const InputContent = styled.form`
    margin: 16px;
    display: flex;
    flex-direction: row;
    gap: 16px;
`
const StyledInput = styled.input`
    display: flex;
    padding: 8px 16px;
    width: 100%;
    border: 1px solid ${(props) => props.theme.primaryColor.grey[3]};
    background-color: ${(props) => props.theme.primaryColor.grey[2]};
    font-family: Roboto-Regular;
    font-size: 14px;
    font-weight: 500;
    border-radius: 16px;
    outline: none;
    transition: border-color 0.3s ease;

    &:focus {
        border-color: ${(props) => props.theme.primaryColor.blue[1]};
    }
`

const ButtonContainer = styled.div`
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    border-radius: 50%;
    justify-content: center;
    background-color: ${(props) => props.theme.primaryColor.blue[1]};
    &:hover {
        background-color: ${(props) => props.theme.primaryColor.blue[2]};
    }
`

const MessageContainer = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    // justify-content: flex-end;
    overflow-y: auto;
    width: 100%;
`

const MessageBubble = styled.div<{ isMe: boolean }>`
    display: flex;
    justify-content: ${(props) => (props.isMe ? 'flex-end' : 'flex-start')};
    align-items: center;
    gap: 8px;
    color: ${(props) =>
        props.isMe
            ? props.theme.primaryColor.white[1]
            : props.theme.primaryColor.black[1]};
    padding: 0px 15px;
    margin: 0px 0;
`

const BubbleContent = styled.div<{ isMe: boolean }>`
    max-width: 400px;
    background-color: ${(props) =>
        props.isMe
            ? props.theme.primaryColor.blue[1]
            : props.theme.primaryColor.grey[3]};
    color: ${(props) =>
        props.isMe
            ? props.theme.primaryColor.white[1]
            : props.theme.primaryColor.black[1]};
    padding: 10px 15px;
    border-radius: 20px;
    margin: 2px 0;
`

type ConversationPreview = {
    username: string
    firstName: string
    lastName: string
    lastMessage: string
    timestamp: string
}

type Message = {
    id: string
    senderUsername: string
    recipientUsername: string
    content: string
    timestamp: string
    read: boolean
}

type Friend = {
    username: string
    firstName: string
    lastName: string
    lastMessage: string
    timestamp: string
}

export const Chats = () => {
    useAuth()
    const [conversationList, setConversationList] = useState<
        ConversationPreview[]
    >([])
    const [refreshFlag, setRefreshFlag] = useState(false)
    const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [currentUser, setCurrentUser] = useState<{
        firstName: string
        lastName: string
        username: string
    } | null>(null)

    const { username } = useParams()

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const res = await fetch(
                    'http://localhost:5000/api/messages/conversations',
                    {
                        credentials: 'include', // if using cookies
                    }
                )
                const data: ConversationPreview[] = await res.json()
                setConversationList(data)
                console.log(conversationList)
            } catch (err) {
                console.error('Error fetching conversations:', err)
            }
        }

        fetchConversations()
    }, [])

    useEffect(() => {
        if (!selectedFriend) return
        console.log('Selected friend is: ', selectedFriend)

        fetch(
            `http://localhost:5000/api/messages?recipient=${selectedFriend.username}`,
            {
                method: 'GET',
                credentials: 'include',
            }
        )
            .then((res) => {
                if (!res.ok) throw new Error('Failed to fetch messages')
                return res.json()
            })
            .then(setMessages)

            .catch((err) => console.error('Error fetching messages:', err))
        // console.log('Fetched Messages are: ', messages)
    }, [selectedFriend])

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/user`, {
                    method: 'GET',
                    credentials: 'include',
                })

                if (response.ok) {
                    const data = await response.json()
                    setCurrentUser(data)
                    console.log('Current user: ', currentUser)
                }
            } catch (error) {
                console.error('Error fetching user:', error)
            }
        }

        if (username) {
            fetchUser()
        }
    }, [username])

    const messagesEndRef = useRef<HTMLDivElement | null>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const sendMessage = async () => {
        if (!selectedFriend || !newMessage.trim()) return

        // const encryptionKey = await getKeyForFriend(selectedFriend.username)
        const keyPair = await generateRSAKeyPair()

        const publicKey = keyPair.publicKey
        const privateKey = keyPair.privateKey

        const encryptedMessage = encryptMessageWithAES(newMessage, publicKey)
        console.log('Public key is: ', publicKey)
        console.log('Private key is: ', privateKey)
        console.log('New Message is: ', newMessage)
        console.log('Encrypted Message is: ', encryptedMessage)

        try {
            const res = await fetch('http://localhost:5000/api/messages/send', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    recipientUsername: selectedFriend.username,
                    content: newMessage,
                }),
            })

            if (res.ok) {
                if (!currentUser?.username) return
                const now = new Date().toISOString()
                const newMsg = {
                    id: Date.now().toString(),
                    senderUsername: currentUser?.username,
                    recipientUsername: selectedFriend.username,
                    content: newMessage,
                    timestamp: now,
                    read: true,
                }
                setMessages((prev) => [...prev, newMsg])
                setNewMessage('')
                setRefreshFlag((prev) => !prev)
            }
        } catch (err) {
            console.error('Error sending message:', err)
        }
    }

    return (
        <HomeBackground>
            <Navbar />
            <MainContainer>
                {conversationList && (
                    <ContentWrapper>
                        <ConversationList
                            refreshFlag={refreshFlag}
                            selectedFriend={selectedFriend}
                            onSelectFriend={(friend) =>
                                setSelectedFriend(friend)
                            }
                        />
                        {selectedFriend && (
                            <RightCard>
                                <ProfileContainer>
                                    <ProfileContent>
                                        <img src={UserIcon} />
                                        <SubTitle14>
                                            {selectedFriend.firstName}{' '}
                                            {selectedFriend.lastName}
                                        </SubTitle14>
                                    </ProfileContent>
                                </ProfileContainer>
                                <MessageContainer>
                                    {messages.map((msg) => {
                                        const isMe =
                                            msg.senderUsername ===
                                            currentUser?.username
                                        return (
                                            <MessageBubble
                                                key={msg.id}
                                                isMe={isMe}
                                            >
                                                {!isMe && (
                                                    <img src={UserIcon} />
                                                )}
                                                <BubbleContent isMe={isMe}>
                                                    <Paragraph14
                                                        style={{
                                                            display:
                                                                'inline-block',
                                                        }}
                                                    >
                                                        {msg.content}
                                                    </Paragraph14>
                                                </BubbleContent>
                                            </MessageBubble>
                                        )
                                    })}
                                    <div ref={messagesEndRef} />
                                </MessageContainer>
                                <InputContainer>
                                    <InputContent
                                        onSubmit={(e) => {
                                            e.preventDefault()
                                            sendMessage()
                                        }}
                                    >
                                        <StyledInput
                                            value={newMessage}
                                            onChange={(e) =>
                                                setNewMessage(e.target.value)
                                            }
                                            placeholder='Aa'
                                        />
                                        <ButtonContainer onClick={sendMessage}>
                                            <img src={SendIcon} />
                                        </ButtonContainer>
                                    </InputContent>
                                </InputContainer>
                            </RightCard>
                        )}
                    </ContentWrapper>
                )}
            </MainContainer>
        </HomeBackground>
    )
}
