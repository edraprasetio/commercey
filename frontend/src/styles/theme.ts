import { Theme } from '@emotion/react'
/**
 * Implement the theme interface
 */
export const defaultTheme: Theme = {
    primaryColor: {
        beige: {
            1: '#E5D3B3',
        },
        black: {
            1: '#35363D',
        },
        blue: {
            1: '#309BFF',
            2: '#49a6fc',
        },
        grey: {
            1: '#666464',
            2: '#B0B0BC',
        },
        red: {
            1: '#CF8081',
            2: '#FFF5F5',
        },
        white: {
            1: '#FFFFFF',
            2: '#F3F3F3',
            3: '#DFDFDF',
        },
    },
    breakPoints: {
        tablet: '1420px',
        miniTablet: '1240px',
        largePhone: '940px',
        phone: '700px',
    },
}
