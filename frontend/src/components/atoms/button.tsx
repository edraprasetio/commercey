import styled from '@emotion/styled'

export const BaseButton = styled.button`
    width: 498px;
    padding: 12px 32px;
    border: 2px;
    background-color: #000000;
    border-radius: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: #ffffff;
    line-height: 29.26px;
    letter-spacing: 10%;
    &:hover {
        background-color: #374092;
    }
`

export const MediumBlackButton = styled(BaseButton)`
    width: unset;
    height: 36px;
    padding: 0px 24px;
    border-radius: 16px;
    font-family: Monsterrat-Medium;
    font-size: 18px;
    color: #ffffff;
`

export const BlueButton = styled(BaseButton)`
    width: 100%;
    background-color: ${(props) => props.theme.primaryColor.blue[1]};
    &:hover {
        background-color: ${(props) => props.theme.primaryColor.blue[2]};
    }
`
