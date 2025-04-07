import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, HomeBackground } from '../components/home/background'
import { BlueButton } from '../components/atoms/button'
import { Navbar } from '../components/atoms/navbar'
import { Heading32 } from '../styles/typography'
import styled from '@emotion/styled'
import { useAuth } from '../utils'
import SendIcon from '../assets/icons/sendIcon.svg'

const MainContainer = styled.div`
    display: flex;
    height: 100vh;
    width: 100%;
`
const LeftCard = styled(Card)`
    margin: unset;
    padding: unset;
    width: 300px;
    flex-shrink: 0;
`

const LeftContainer = styled.div`
    margin: 16px;
`

const RightCard = styled(Card)`
    display: flex;
    flex-direction: column;
    margin: unset;
    padding: unset;
`

const ProfileContainer = styled.div`
    width: 100%;
    display: flex;
    border-radius: 16px 16px 0px 0px;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.1), 0 6px 20px 0 rgba(0, 0, 0, 0.1);
`

const ProfileContent = styled.div`
    width: 100%;
    display: flex;
    padding: 16px;
`

const MessageContainer = styled.div`
    height: 100%;
`

const InputContainer = styled.div`
    width: 100%;
`

const InputContent = styled.div`
    margin: 16px;
    display: flex;
    flex-direction: row;
    gap: 16px;
`
const StyledInput = styled.input`
    display: flex;
    padding: 8px 16px;
    width: 100%;
    border: 1px solid ${(props) => props.theme.primaryColor.grey[3]};
    background-color: ${(props) => props.theme.primaryColor.grey[2]};
    font-family: Roboto-Regular;
    font-size: 14px;
    font-weight: 500;
    border-radius: 16px;
    outline: none;
    transition: border-color 0.3s ease;

    &:focus {
        border-color: ${(props) => props.theme.primaryColor.blue[1]};
    }
`

const ButtonContainer = styled.div`
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    border-radius: 50%;
    justify-content: center;
    background-color: ${(props) => props.theme.primaryColor.blue[1]};
    &:hover {
        background-color: ${(props) => props.theme.primaryColor.blue[2]};
    }
`

export const Chats = () => {
    useAuth()

    return (
        <HomeBackground>
            <Navbar />
            <MainContainer>
                <div
                    style={{
                        display: 'flex',
                        width: '100%',
                        gap: '16px',
                        marginTop: '32px',
                        marginBottom: '32px',
                        marginRight: '32px',
                    }}
                >
                    <LeftCard>
                        <LeftContainer>
                            <Heading32>Chats</Heading32>
                        </LeftContainer>
                    </LeftCard>
                    <RightCard>
                        <ProfileContainer>
                            <ProfileContent>Test</ProfileContent>
                        </ProfileContainer>
                        <MessageContainer>Test</MessageContainer>
                        <InputContainer>
                            <InputContent>
                                <StyledInput />
                                <ButtonContainer>
                                    <img src={SendIcon} />
                                </ButtonContainer>
                            </InputContent>
                        </InputContainer>
                    </RightCard>
                </div>
            </MainContainer>
        </HomeBackground>
    )
}
