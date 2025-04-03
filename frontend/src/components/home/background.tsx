import styled from '@emotion/styled'

export const HomeBackground = styled.div`
    width: 100%;
    height: 100vh;
    background-color: #dfdfdf;
    display: flex;
    justify-content: start;
    align-items: start;
`

export const Card = styled.div`
    width: 100%;
    height: 100%;
    background-color: ${(props) => props.theme.primaryColor.white[1]};
    border-radius: 16px;
    margin: 32px 0px;
    padding: 16px;
`
