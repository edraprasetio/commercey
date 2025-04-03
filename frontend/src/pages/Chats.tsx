import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, HomeBackground } from '../components/home/background'
import { BlueButton } from '../components/atoms/button'
import { Navbar } from '../components/atoms/navbar'
import { Heading32 } from '../styles/typography'
import styled from '@emotion/styled'
import { useAuth } from '../utils'

const MainContainer = styled.div`
    display: flex;
    height: 100vh;
    flex-direction: column;
`

export const Chats = () => {
    useAuth()

    return (
        <HomeBackground>
            <Navbar />
            <MainContainer>
                <Card>
                    <Heading32>Chats</Heading32>
                </Card>
            </MainContainer>
        </HomeBackground>
    )
}
