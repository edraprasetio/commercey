import styled from '@emotion/styled'
import { useState } from 'react'
import { SubHeading12, SubHeading14 } from '../../styles/typography'

const StyledInputContainer = styled.div`
    display: flex;
    flex-direction: column;
    position: relative;
    width: 100%;
`

const StyledLabel = styled.label`
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 500;
    color: ${(props) => props.theme.primaryColor.black[1]};
`

const StyledInput = styled.input`
    padding: 16px 16px;
    border: 1px solid ${(props) => props.theme.primaryColor.grey[2]};
    border-radius: 8px;
    font-size: 16px;
    outline: none;
    transition: border-color 0.3s ease;
    font-family: Roboto-Regular;
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 1px;

    &:focus {
        border-color: ${(props) => props.theme.primaryColor.blue[1]};
    }

    &.error {
        background-color: ${(props) => props.theme.primaryColor.red[2]};
        border-color: ${(props) => props.theme.primaryColor.red[1]};
        &:focus {
            background-color: ${(props) => props.theme.primaryColor.white[1]};
            border-color: ${(props) => props.theme.primaryColor.blue[1]};
        }
    }
`

const StyledMessage = styled.span`
    text-align: right;
    margin-top: 4px;
    font-size: 12px;
    color: ${(props) => props.theme.primaryColor.black[1]};
`

const CustomInput = ({ label, status, message, ...inputProps }: any) => {
    const displayedMessage = status === 'error' ? message : message || ''
    return (
        <StyledInputContainer>
            <StyledLabel>
                <SubHeading14>{label}</SubHeading14>
            </StyledLabel>
            <StyledInput
                {...inputProps}
                className={status === 'error' ? 'error' : ''}
            />
            {displayedMessage && (
                <StyledMessage>
                    <SubHeading12>{displayedMessage}</SubHeading12>
                </StyledMessage>
            )}
        </StyledInputContainer>
    )
}

export default CustomInput
