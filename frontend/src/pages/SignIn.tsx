import styled from '@emotion/styled'
import { useState } from 'react'
import { Heading32, SubHeading14, SubHeading16 } from '../styles/typography'
import title from '../assets/icons/Title - large.svg'
import CustomInput from '../components/atoms/input'
import { BlueButton } from '../components/atoms/button'
import { SimpleLink } from '../components/atoms/link'

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
    padding-top: 16px;
    padding-bottom: 16px;
`

export const SignIn = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = () => {
        console.log('Do Submission')
    }

    return (
        <MainContainer>
            <TitleWrapper>
                <TitleIcon src={title} />
                <Heading32>Sign In</Heading32>
            </TitleWrapper>

            <FormContainer onSubmit={handleSubmit}>
                <CustomInput
                    label='Username'
                    message=''
                    type='text'
                    name='username'
                    value={formData.username}
                    onChange={handleChange}
                />
                <CustomInput
                    label='Password'
                    type='password'
                    name='password'
                    value={formData.password}
                    onChange={handleChange}
                />
                <BlueButton style={{ marginTop: '24px' }} type='submit'>
                    <SubHeading16>SIGN UP ACCOUNT</SubHeading16>
                </BlueButton>
            </FormContainer>
            <p style={{ color: '#666464' }}>
                <SubHeading14>
                    Don&apos;t have an account yet?{' '}
                    <SimpleLink to='/signin'>Sign up here.</SimpleLink>
                </SubHeading14>
            </p>
        </MainContainer>
    )
}
