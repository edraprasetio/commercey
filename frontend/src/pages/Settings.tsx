import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { HomeBackground } from '../components/home/background'
import { BlueButton } from '../components/atoms/button'
import { Navbar } from '../components/atoms/navbar'
import { Heading20, Heading32, SubHeading14 } from '../styles/typography'
import styled from '@emotion/styled'
import CustomInput from '../components/atoms/input'
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

export const Settings = () => {
    useAuth()

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

    const [errors, setErrors] = useState<{ [key: string]: string }>({})
    const [usernameForm, setUsernameForm] = useState({
        newUsername: '',
    })

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUsernameForm({ ...usernameForm, [e.target.name]: e.target.value })
    }

    const [passwordForm, setPasswordForm] = useState({
        oldPassword: '',
        newPassword: '',
    })

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value })
    }

    const handlePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        console.log(user?.username)
        console.log(passwordForm.oldPassword)
        console.log(passwordForm.newPassword)
        try {
            const response = await fetch(
                'http://localhost:5000/api/user/change-password',
                {
                    method: 'PUT', // Changed from POST to PUT
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        username: user?.username,
                        old_password: passwordForm.oldPassword,
                        new_password: passwordForm.newPassword,
                    }),
                }
            )

            if (response.ok) {
                console.log('Password changed successfully')
                setErrors({}) // Clear errors
            } else {
                const errorData = await response.json() // Attempt to parse JSON
                console.error('Error:', errorData)
                setErrors(errorData.errors || {}) // Handle errors from the backend
                console.log(errors.old_password)
            }
        } catch (error) {
            console.error('Unexpected error:', error)
        }
    }

    return (
        <HomeBackground>
            <Navbar />
            <MainContainer>
                <Heading32>Settings</Heading32>
                <FormContainer>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            alignItems: 'start',
                            width: '320px',
                        }}
                    >
                        <Heading20 style={{ marginBottom: '16px' }}>
                            Update Username
                        </Heading20>
                        <CustomInput
                            status={errors.newUsername ? 'error' : ''}
                            label='New Username'
                            type='text'
                            name='newUsername'
                            value={usernameForm.newUsername}
                            onChange={handleUsernameChange}
                            message={errors.newUsername || ''}
                        />
                    </div>

                    <BlueButton
                        style={{
                            marginTop: '8px',
                            padding: '8px 32px',
                            width: 'unset',
                        }}
                        type='submit'
                    >
                        <SubHeading14>SAVE CHANGES</SubHeading14>
                    </BlueButton>
                </FormContainer>
                <FormContainer onSubmit={handlePassword}>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            alignItems: 'start',
                            width: '320px',
                        }}
                    >
                        <Heading20 style={{ marginBottom: '16px' }}>
                            Change Password
                        </Heading20>
                        <CustomInput
                            status={errors.old_password ? 'error' : ''}
                            label='Old Password'
                            type='password'
                            name='oldPassword'
                            value={passwordForm.oldPassword}
                            onChange={handlePasswordChange}
                            message={errors.old_password || ''}
                        />
                        <CustomInput
                            status={errors.new_password ? 'error' : ''}
                            label='New Password'
                            type='password'
                            name='newPassword'
                            value={passwordForm.newPassword}
                            onChange={handlePasswordChange}
                            message={errors.new_password || ''}
                        />
                    </div>

                    <BlueButton
                        style={{
                            marginTop: '8px',
                            padding: '8px 32px',
                            width: 'unset',
                        }}
                        type='submit'
                    >
                        <SubHeading14>SAVE CHANGES</SubHeading14>
                    </BlueButton>
                </FormContainer>
            </MainContainer>
        </HomeBackground>
    )
}
