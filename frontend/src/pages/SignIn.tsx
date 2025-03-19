import styled from '@emotion/styled'
import React, { useState } from 'react'
import { Heading32, SubHeading14, SubHeading16 } from '../styles/typography'
import title from '../assets/icons/Title - large.svg'
import CustomInput from '../components/atoms/input'
import { BlueButton } from '../components/atoms/button'
import { SimpleLink } from '../components/atoms/link'
import { useNavigate } from 'react-router-dom'

const FormContainer = styled.form`
    display: flex;
    width: 320px;
    flex-direction: column;
    align-items: center;
    gap: 8px;
`
const TitleIcon = styled.img`
    height: 30px;
    width: 72px;
`

const TitleWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
`

const MainContainer = styled.div`
    display: flex;
    width: 100%;
    height: 100vh;
    gap: 32px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`

export const SignIn = () => {
    const [errors, setErrors] = useState<{ [key: string]: string }>({})
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const response = await fetch('http://localhost:5000/api/signin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
                credentials: 'include',
            })

            const data = await response.json()

            if (response.ok) {
                console.log('User signed in:', data)
                setErrors({})

                const userResponse = await fetch(
                    'http://localhost:5000/api/user',
                    {
                        method: 'GET',
                        credentials: 'include',
                    }
                )

                if (userResponse.ok) {
                    const userData = await userResponse.json()
                    console.log('User data from Mongo:', userData)
                    navigate(`/${userData.username}/chats`)
                } else {
                    console.error('Failed to fetch user data:', userResponse)
                }
            } else {
                console.error('Error:', data)
                setErrors(data.errors || {})
            }
        } catch (error) {
            console.error('Request failed', error)
        }
    }

    return (
        <MainContainer>
            <TitleWrapper>
                <TitleIcon src={title} />
                <Heading32>Sign In</Heading32>
            </TitleWrapper>

            <FormContainer onSubmit={handleSubmit}>
                <CustomInput
                    status={errors.username ? 'error' : ''}
                    label='Username'
                    type='text'
                    name='username'
                    value={formData.username}
                    onChange={handleChange}
                    message={errors.username || ''}
                />
                <CustomInput
                    status={errors.password ? 'error' : ''}
                    label='Password'
                    type='password'
                    name='password'
                    value={formData.password}
                    onChange={handleChange}
                    message={errors.password || ''}
                />
                <BlueButton style={{ marginTop: '24px' }} type='submit'>
                    <SubHeading16>SIGN IN</SubHeading16>
                </BlueButton>
            </FormContainer>
            <p style={{ color: '#666464' }}>
                <SubHeading14>
                    Don&apos;t have an account yet?{' '}
                    <SimpleLink to='/signup'>Sign up here.</SimpleLink>
                </SubHeading14>
            </p>
        </MainContainer>
    )
}
