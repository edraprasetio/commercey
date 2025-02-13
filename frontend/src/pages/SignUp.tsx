import { useState } from 'react'
import styled from '@emotion/styled'
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
    padding-top: 56px;
    padding-bottom: 56px;
`

export const SignUp = () => {
    const [userCheck, setUserCheck] = useState(false)
    const [hasError, setHasError] = useState(false)
    const [errors, setErrors] = useState<{ [key: string]: string }>({})
    const [formData, setFormData] = useState({
        username: '',
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const response = await fetch('http://localhost:5000/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })

            const data = await response.json()

            if (response.ok) {
                console.log('User created:', data)
                setUserCheck(true)
                setErrors({})
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
                <Heading32>Sign Up</Heading32>
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
                    label='First name'
                    type='text'
                    name='firstName'
                    value={formData.firstName}
                    onChange={handleChange}
                />
                <CustomInput
                    label='Last name'
                    type='text'
                    name='lastName'
                    value={formData.lastName}
                    onChange={handleChange}
                />
                <CustomInput
                    status={errors.email ? 'error' : ''}
                    label='Email Address'
                    type='email'
                    name='email'
                    value={formData.email}
                    onChange={handleChange}
                    message={errors.email || ''}
                />
                <CustomInput
                    label='Password'
                    type='password'
                    name='password'
                    value={formData.password}
                    onChange={handleChange}
                />
                <CustomInput
                    label='Confirm Password'
                    type='password'
                    name='confirmPassword'
                    value={formData.confirmPassword}
                    onChange={handleChange}
                />
                <BlueButton style={{ marginTop: '24px' }} type='submit'>
                    <SubHeading16>SIGN UP ACCOUNT</SubHeading16>
                </BlueButton>
            </FormContainer>
            <p style={{ color: '#666464' }}>
                <SubHeading14>
                    Already have an account?{' '}
                    <SimpleLink to='/signin'>Sign in here.</SimpleLink>
                </SubHeading14>
            </p>
            {userCheck && <div>User Created</div>}
        </MainContainer>
    )
}
