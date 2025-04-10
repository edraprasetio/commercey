import { useEffect, useState } from 'react'
import { useAuth } from '../utils'
import styled from '@emotion/styled'
import { Card } from './home/background'
import { Heading32, Paragraph14, SubTitle14 } from '../styles/typography'
import UserIcon from '../assets/icons/userIcon.svg'
import Dot from '../assets/icons/dot.svg'

const LeftCard = styled(Card)`
    margin: unset;
    padding: unset;
    width: 300px;
    flex-shrink: 0;
`

const LeftContainer = styled.div`
    margin: 16px;
    display: flex;
    flex-direction: column;
    gap: 24px;
`

const FriendContainer = styled.li`
    display: flex;
    width: 248px;
    gap: 16px;
    padding: 8px 8px;
    border-radius: 8px;
    align-items: center;
    position: relative;
    color: ${(props) => props.theme.primaryColor.black[1]};
    &:hover {
        background-color: rgba(176, 176, 188, 0.4);
    }
`

const PreviewMessageContainer = styled.span`
    max-width: 180px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`

const PreviewContainer = styled.div`
    display: flex;
    gap: 4px;
    alignitems: center;
    color: ${(props) => props.theme.primaryColor.grey[1]};
`

type ConversationPreview = {
    username: string
    firstName: string
    lastName: string
    lastMessage: string
    timestamp: string
}

type Friend = {
    username: string
    firstName: string
    lastName: string
    lastMessage: string
    timestamp: string
}

interface ConversationListProps {
    selectedFriend: Friend | null
    onSelectFriend: (friend: Friend) => void
    refreshFlag: boolean
}

export const ConversationList = ({
    selectedFriend,
    onSelectFriend,
    refreshFlag,
}: ConversationListProps) => {
    useAuth
    const [conversationList, setConversationList] = useState<
        ConversationPreview[]
    >([])

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
    }, [refreshFlag])

    return (
        <LeftCard>
            <LeftContainer>
                <Heading32>Chats</Heading32>
                {conversationList.map((convo) => (
                    <FriendContainer
                        key={convo.username}
                        onClick={() => onSelectFriend(convo)}
                        className={`friend-item ${
                            selectedFriend?.username === convo.username
                                ? 'active'
                                : ''
                        }`}
                    >
                        <img src={UserIcon} />
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px',
                            }}
                        >
                            <SubTitle14>
                                {convo.firstName} {convo.lastName}
                            </SubTitle14>
                            <PreviewContainer>
                                <PreviewMessageContainer>
                                    <Paragraph14>
                                        {convo.lastMessage}
                                    </Paragraph14>
                                </PreviewMessageContainer>
                                <img src={Dot} />
                                <span className='timestamp'>
                                    <Paragraph14>{convo.timestamp}</Paragraph14>
                                </span>
                            </PreviewContainer>
                        </div>
                    </FriendContainer>
                ))}
            </LeftContainer>
        </LeftCard>
    )
}
