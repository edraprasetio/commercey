import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { HomeBackground } from '../components/home/background'
import { BlueButton, ClearButton } from '../components/atoms/button'
import { Navbar } from '../components/atoms/navbar'
import {
    Heading20,
    Heading32,
    SubHeading12,
    SubHeading14,
    SubTitle14,
} from '../styles/typography'
import styled from '@emotion/styled'
import CustomInput from '../components/atoms/input'
import userIcon from '../assets/icons/userIcon.svg'
import { useAuth } from '../utils'

const MainContainer = styled.div`
    margin: 32px 16px;
    display: flex;
    flex-direction: column;
    gap: 32px;
`

const FormContainer = styled.form`
    display: flex;
    flex-direction: column;
    align-items: end;
    gap: 8px;
`

const FriendContainer = styled.li`
    display: flex;
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

export const AddFriend = () => {
    useAuth()

    const [errors, setErrors] = useState<{ [key: string]: string }>({})
    const [addFriendForm, setAddFriendForm] = useState({
        username: '',
        target_friend: '',
    })

    const handleAddFriendChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAddFriendForm({ ...addFriendForm, [e.target.name]: e.target.value })
    }

    const { username } = useParams()
    const [user, setUser] = useState<{
        username: string
        pendingRequests: {
            username: string
            firstName: string
            lastName: string
        }[]
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
                    console.log(data)
                    setUser(data)
                    setAddFriendForm((prevForm) => ({
                        ...prevForm,
                        username: data.username,
                    }))
                    console.log(user?.pendingRequests)
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

    const handleSubmitAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        console.log(addFriendForm)

        try {
            const response = await fetch(
                'http://localhost:5000/api/friend/request',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(addFriendForm),
                    credentials: 'include',
                }
            )

            const data = await response.json()

            if (response.ok) {
                console.log(data.message)
                setErrors({})
            } else {
                console.error('Error:')
                // setErrors(data.errors || {})
            }
        } catch (error) {
            console.error('Request failed', error)
        }
    }

    const handleAccept = async (acceptedUser: string) => {
        try {
            const response = await fetch(
                'http://localhost:5000/api/friend/accept',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        username: user?.username,
                        accepted_user: acceptedUser,
                    }),
                }
            )
            if (response.ok) {
                // Update state to remove the accepted request
                setUser((prevUser) => ({
                    ...prevUser!,
                    pendingRequests: prevUser!.pendingRequests.filter(
                        (req) => req.username !== acceptedUser
                    ),
                }))
            } else {
                console.error('Failed to accept friend request')
            }
        } catch (error) {
            console.error('Error:', error)
        }
    }

    const handleReject = async (rejectedUser: string) => {
        try {
            const response = await fetch(
                'http://localhost:5000/api/friend/reject',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        username: user?.username,
                        rejected_user: rejectedUser,
                    }),
                }
            )
            if (response.ok) {
                // Update state to remove the rejected request
                setUser((prevUser) => ({
                    ...prevUser!,
                    pendingRequests: prevUser!.pendingRequests.filter(
                        (req) => req.username !== rejectedUser
                    ),
                }))
            } else {
                console.error('Failed to reject friend request')
            }
        } catch (error) {
            console.error('Error:', error)
        }
    }

    return (
        <HomeBackground>
            <Navbar />
            <MainContainer>
                <Heading32>Add Friend</Heading32>
                <FormContainer onSubmit={handleSubmitAdd}>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            alignItems: 'start',
                            width: '320px',
                        }}
                    >
                        <Heading20 style={{ marginBottom: '8px' }}>
                            Add via username
                        </Heading20>
                        <CustomInput
                            status={errors.target_friend ? 'error' : ''}
                            type='text'
                            name='target_friend'
                            value={addFriendForm.target_friend}
                            onChange={handleAddFriendChange}
                            message={errors.target_friend || ''}
                        />
                    </div>

                    <BlueButton
                        style={{
                            marginTop: '8px',
                            padding: '4px 16px',
                            width: 'unset',
                        }}
                        type='submit'
                    >
                        <SubHeading14>SEND REQUEST</SubHeading14>
                    </BlueButton>
                </FormContainer>

                <Heading20>Requests</Heading20>
                <ul>
                    {user?.pendingRequests?.length ? (
                        user.pendingRequests.map((request, index) => (
                            <FriendContainer key={index}>
                                <img src={userIcon} />
                                <SubTitle14>
                                    {request.firstName} {request.lastName}
                                </SubTitle14>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <BlueButton
                                        style={{
                                            padding: '4px 16px',
                                            width: 'unset',
                                        }}
                                        onClick={() =>
                                            handleAccept(request.username)
                                        }
                                    >
                                        <SubHeading12>Accept</SubHeading12>
                                    </BlueButton>
                                    <ClearButton
                                        onClick={() =>
                                            handleReject(request.username)
                                        }
                                    >
                                        <SubHeading12>Reject</SubHeading12>
                                    </ClearButton>
                                </div>
                            </FriendContainer>
                        ))
                    ) : (
                        <p>No requests yet</p>
                    )}
                </ul>
            </MainContainer>
        </HomeBackground>
    )
}
