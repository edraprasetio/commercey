import '@emotion/react'
/**
 * Define a theme type, in other words, the theme interface
 */
declare module '@emotion/react' {
    export interface Theme {
        primaryColor: {
            beige: {
                1: string
            }
            black: {
                1: string
            }
            blue: {
                1: string
                2: string
            }
            grey: {
                1: string
                2: string
                3: string
            }
            red: {
                1: string
                2: string
            }
            white: {
                1: string
                2: string
                3: string
            }
        }
        breakPoints: {
            tablet: string
            miniTablet: string
            largePhone: string
            phone: string
        }
    }
}
