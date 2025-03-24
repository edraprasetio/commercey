import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { HomeBackground } from '../components/home/background'
import { BlueButton } from '../components/atoms/button'
import { Navbar } from '../components/atoms/navbar'
import { Heading20, Heading32, SubHeading14 } from '../styles/typography'
import styled from '@emotion/styled'
import CustomInput from '../components/atoms/input'

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
                            Change Password
                        </Heading20>
                        <CustomInput
                            status={errors.oldPassword ? 'error' : ''}
                            label='Old Password'
                            type='password'
                            name='oldPassword'
                            value={passwordForm.oldPassword}
                            onChange={handlePasswordChange}
                            message={errors.oldPassword || ''}
                        />
                        <CustomInput
                            status={errors.newPassword ? 'error' : ''}
                            label='New Password'
                            type='password'
                            name='newPassword'
                            value={passwordForm.newPassword}
                            onChange={handlePasswordChange}
                            message={errors.newPassword || ''}
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
