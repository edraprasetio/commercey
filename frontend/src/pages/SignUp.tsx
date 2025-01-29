import { useState } from 'react'
import styled from '@emotion/styled'

const FormContainer = styled.form`
    display: flex;
    width: 400px;
    flex-direction: column;
`

export const SignUp = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    })

    // const [error, setError] = useState('')

    // keeps data synced in user's perspective
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // API call starts here
        try {
            // Send data to the Go API
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
                // Handle success (redirect, display success message, etc.)
            } else {
                console.error('Error:', data)
                // Handle error (display error message)
            }
        } catch (error) {
            console.error('Request failed', error)
        }
    }

    return (
        <FormContainer onSubmit={handleSubmit}>
            <input
                type='text'
                name='name'
                placeholder='Full Name'
                value={formData.name}
                onChange={handleChange}
            />
            <input
                type='email'
                name='email'
                placeholder='Email'
                value={formData.email}
                onChange={handleChange}
            />
            <input
                type='password'
                name='password'
                placeholder='Password'
                value={formData.password}
                onChange={handleChange}
            />
            <input
                type='password'
                name='confirmPassword'
                placeholder='Confirm Password'
                value={formData.confirmPassword}
                onChange={handleChange}
            />
            <button type='submit'>Sign Up</button>
        </FormContainer>
    )
}
