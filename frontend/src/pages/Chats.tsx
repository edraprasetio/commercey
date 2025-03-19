import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { HomeBackground } from '../components/home/background'
import { BlueButton } from '../components/atoms/button'
import { Navbar } from '../components/atoms/navbar'
import { Heading32 } from '../styles/typography'
import styled from '@emotion/styled'

const MainContainer = styled.div`
    margin: 32px 16px;
    display: flex;
    flex-direction: column;
`

export const Chats = () => {
    return (
        <HomeBackground>
            <Navbar />
            <MainContainer>
                <Heading32>Chats</Heading32>
            </MainContainer>
        </HomeBackground>
    )
}
