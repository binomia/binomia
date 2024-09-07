import { TouchableOpacity } from 'react-native'
import React from 'react'
import { Text, HStack, StyledProps } from 'native-base';


type Props = {
    style?: StyledProps
    title: string
    onPress?: () => void
}

const Button: React.FC<Props> = ({ title, onPress = () => { }, style = { fontWeight: "bold", fontSize: "16px" } }): JSX.Element => {
    return (
        <TouchableOpacity style={{ width: "100%" }} onPress={onPress}>
            <HStack {...style} borderRadius={"25px"} bg={"mainGreen"} alignItems={"center"} justifyContent={"center"} h="55px">
                <Text width={"100%"} fontWeight={"bold"} fontSize={"16px"} textAlign={"center"} color={"white"}>{title}</Text>
            </HStack>
        </TouchableOpacity>
    )
}


export default Button