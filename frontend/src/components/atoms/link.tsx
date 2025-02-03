import styled from '@emotion/styled'
import { Link } from 'react-router-dom'

export const SimpleLink = styled(Link)`
    color: unset;

    &:hover {
        color: ${(props) => props.theme.primaryColor.blue[1]};
    }
`
