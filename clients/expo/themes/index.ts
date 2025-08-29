import colors from "@/colors";
import { extendTheme } from "native-base";

export const theme = extendTheme({
    colors: {
        ...colors,
    },
    components: {
        VStack: {
            variants: {
                body: {
                    w: "100%",
                    h: "100%",
                    px: "15px",
                    bg: "darkGray",
                    flex: 1
                }
            }
        },
        Input: {
            variants: {
                input: {
                    bg: "lightGray",
                    keyboardAppearance: 'dark',
                    px: "20px",
                    h: "55px",
                    w: "100%",
                    my: "5px",
                    borderRadius: 10
                }
            }
        },
        Button: {
            variants: {
                button: {
                    bg: "mainGreen",
                    h: "55px",
                    borderRadius: 10
                }
            }
        }
    }
})